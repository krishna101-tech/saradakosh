/**
 * Turso LibSQL HTTP Pipeline Client
 *
 * Provides a pure HTTP client for Turso / LibSQL databases using the official
 * /v2/pipeline protocol. Eliminates native C++ compilation dependencies and
 * provides cross-instance durable writes in serverless (Vercel) environments.
 */

export function getTursoPipelineUrl() {
  const rawUrl = process.env.TURSO_DATABASE_URL || '';
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  if (url.startsWith('libsql://')) {
    url = 'https://' + url.slice('libsql://'.length);
  }
  url = url.replace(/\/+$/, '');
  if (!url.endsWith('/v2/pipeline')) {
    url = `${url}/v2/pipeline`;
  }
  return url;
}

export function isTursoConfigured() {
  return Boolean(process.env.TURSO_DATABASE_URL && process.env.TURSO_DATABASE_URL.trim());
}

export function toTursoValue(val) {
  if (val === null || val === undefined) return { type: 'null' };
  if (typeof val === 'number') {
    if (Number.isInteger(val)) return { type: 'integer', value: String(val) };
    return { type: 'float', value: val };
  }
  if (typeof val === 'boolean') return { type: 'integer', value: val ? '1' : '0' };
  return { type: 'text', value: String(val) };
}

export function fromTursoValue(cell) {
  if (!cell || cell.type === 'null') return null;
  if (cell.type === 'integer') return Number(cell.value);
  if (cell.type === 'float') return Number(cell.value);
  if (cell.type === 'text') return cell.value;
  if (cell.type === 'blob') return cell.base64;
  return cell.value;
}

export async function executeTursoQuery(sql, args = []) {
  const url = getTursoPipelineUrl();
  if (!url) {
    throw new Error('TURSO_DATABASE_URL is not configured.');
  }
  const token = process.env.TURSO_AUTH_TOKEN;
  
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const payload = {
    requests: [
      {
        type: 'execute',
        stmt: {
          sql,
          args: args.map(toTursoValue)
        }
      },
      { type: 'close' }
    ]
  };

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Turso HTTP error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const execResult = data.results?.[0];
  if (execResult?.type === 'error') {
    throw new Error(`Turso query error: ${execResult.error?.message || 'Unknown error'}`);
  }

  const result = execResult?.response?.result;
  if (!result || !result.cols) return { rows: [], affectedRowCount: 0 };

  const cols = result.cols.map(c => c.name);
  const rows = (result.rows || []).map(r => {
    const row = {};
    for (let i = 0; i < cols.length; i++) {
      row[cols[i]] = fromTursoValue(r[i]);
    }
    return row;
  });

  return {
    rows,
    affectedRowCount: result.affected_row_count || 0,
    lastInsertRowid: result.last_insert_rowid
  };
}

export async function executeTursoBatch(statements) {
  const url = getTursoPipelineUrl();
  if (!url) {
    throw new Error('TURSO_DATABASE_URL is not configured.');
  }
  const token = process.env.TURSO_AUTH_TOKEN;
  
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const requests = [
    { type: 'execute', stmt: { sql: 'BEGIN' } }
  ];

  for (const s of statements) {
    requests.push({
      type: 'execute',
      stmt: {
        sql: s.sql,
        args: (s.args || []).map(toTursoValue)
      }
    });
  }

  requests.push({ type: 'execute', stmt: { sql: 'COMMIT' } });
  requests.push({ type: 'close' });

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ requests })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Turso HTTP batch error ${res.status}: ${text}`);
  }

  const data = await res.json();
  for (const r of data.results || []) {
    if (r.type === 'error') {
      throw new Error(`Turso batch statement error: ${r.error?.message || 'Unknown error'}`);
    }
  }

  const results = [];
  for (let i = 0; i < statements.length; i++) {
    const item = data.results?.[i + 1];
    const result = item?.response?.result;
    if (result && result.cols) {
      const cols = result.cols.map(c => c.name);
      const rows = (result.rows || []).map(r => {
        const row = {};
        for (let j = 0; j < cols.length; j++) {
          row[cols[j]] = fromTursoValue(r[j]);
        }
        return row;
      });
      results.push({ rows, affectedRowCount: result.affected_row_count || 0 });
    } else {
      results.push({ rows: [], affectedRowCount: result?.affected_row_count || 0 });
    }
  }

  return results;
}
