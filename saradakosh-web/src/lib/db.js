import Database from 'better-sqlite3';
import path from 'path';

// Connect to the SQLite database which is in the parent directory
const dbPath = path.resolve(process.cwd(), '../saradakosh.db');
const db = new Database(dbPath, { readonly: true });

export function getPersons() {
  try {
    const stmt = db.prepare(`SELECT id, para1 FROM parameters WHERE type = 'Person' ORDER BY para1`);
    return stmt.all();
  } catch (error) {
    console.error("Error fetching persons:", error);
    return [];
  }
}

export function getEvents(limit = 100) {
  try {
    const stmt = db.prepare('SELECT * FROM events ORDER BY yr ASC, mn ASC, dt ASC LIMIT ?');
    return stmt.all(limit);
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

export function getEventsByDate(month, day) {
  try {
    const stmt = db.prepare(`
      SELECT * FROM events 
      WHERE dt = ? AND mn = ? 
      ORDER BY yr ASC
    `);
    const todayEvents = stmt.all(day, month);

    // Also fetch children if they exist to build the accordion
    const parentIds = todayEvents.map(e => e.id);
    if (parentIds.length === 0) return [];
    
    // Using simple IN clause since parentIds is usually small for a single day
    const childrenStmt = db.prepare(`
      SELECT * FROM events 
      WHERE child_id IN (${parentIds.map(() => '?').join(',')}) 
      AND id != child_id
    `);
    const childEvents = childrenStmt.all(...parentIds);

    // Attach children to parents
    return todayEvents.map(parent => {
      const children = childEvents.filter(c => c.child_id === parent.id && c.du && c.du.trim() !== '');
      return { ...parent, children };
    });

  } catch (error) {
    console.error("Error fetching events by date:", error);
    return [];
  }
}

export function getRefsHierarchy() {
  try {
    const stmt = db.prepare(`
      SELECT 
        ref.id as ref_id,
        ref.para1 as ref_name,
        ref.remark as remark,
        ref.remark2 as remark2,
        ref.remark3 as remark3,
        ref.remark4 as remark4,
        l1.para1 as level1_name,
        l2.para1 as level2_name
      FROM parameters ref
      JOIN param_hierarchy ph ON ref.id = ph.parent_id
      LEFT JOIN parameters l1 ON ph.child_id = l1.id
      LEFT JOIN parameters l2 ON ph.child2_id = l2.id
      WHERE ref.type = 'Ref'
      ORDER BY l1.para1 ASC, l2.para1 ASC, ref.para1 ASC
    `);
    
    const rows = stmt.all();
    
    // Group into hierarchy
    const hierarchy = {};
    rows.forEach(row => {
      const l1 = row.level1_name || "Unknown";
      const l2 = row.level2_name || "Unknown";
      
      if (!hierarchy[l1]) hierarchy[l1] = {};
      if (!hierarchy[l1][l2]) hierarchy[l1][l2] = [];
      
      hierarchy[l1][l2].push({
        id: row.ref_id,
        name: row.ref_name,
        remark: row.remark,
        remark2: row.remark2,
        remark3: row.remark3,
        remark4: row.remark4
      });
    });
    
    return hierarchy;
  } catch (error) {
    console.error("Error building refs hierarchy:", error);
    return {};
  }
}

export function getMegaPeriods() {
  try {
    const stmt = db.prepare(`
      SELECT 
        item.id as item_id,
        item.para1 as item_name,
        cat.para1 as category_name
      FROM parameters item
      JOIN param_hierarchy ph ON item.id = ph.parent_id
      JOIN parameters cat ON ph.child_id = cat.id
      WHERE cat.type = 'MPCat'
      ORDER BY cat.id ASC, item.id ASC
    `);
    
    const rows = stmt.all();
    
    const hierarchy = {};
    rows.forEach(row => {
      const cat = row.category_name || "Unknown";
      if (!hierarchy[cat]) hierarchy[cat] = [];
      
      hierarchy[cat].push({
        id: row.item_id,
        name: row.item_name
      });
    });
    
    return hierarchy;
  } catch (error) {
    console.error("Error building mega periods:", error);
    return {};
  }
}

export function getVivekanandaHierarchy() {
  try {
    // Get all Period2
    const p2Stmt = db.prepare(`
      SELECT item.id, item.para1, item.sequence
      FROM parameters item
      JOIN param_hierarchy ph ON item.id = ph.parent_id
      WHERE item.type = 'Period2' AND ph.child2_id = 3
      ORDER BY item.sequence ASC
    `);
    
    // Get all Period3
    const p3Stmt = db.prepare(`
      SELECT item.id, item.para1, item.sequence, ph.child_id as parent_id
      FROM parameters item
      JOIN param_hierarchy ph ON item.id = ph.parent_id
      WHERE item.type = 'Period3' AND ph.child2_id = 3
      ORDER BY item.sequence ASC
    `);

    // Get all Period4
    const p4Stmt = db.prepare(`
      SELECT item.id, item.para1, item.sequence, ph.child_id as parent_id
      FROM parameters item
      JOIN param_hierarchy ph ON item.id = ph.parent_id
      WHERE item.type = 'Period4' AND ph.child2_id = 3
      ORDER BY item.sequence ASC
    `);

    const p2Items = p2Stmt.all();
    const p3Items = p3Stmt.all();
    const p4Items = p4Stmt.all();

    const p3Map = new Map();
    p3Items.forEach(p3 => {
      if (!p3Map.has(p3.parent_id)) p3Map.set(p3.parent_id, []);
      p3Map.get(p3.parent_id).push(p3);
    });

    const p4Map = new Map();
    p4Items.forEach(p4 => {
      if (!p4Map.has(p4.parent_id)) p4Map.set(p4.parent_id, []);
      p4Map.get(p4.parent_id).push(p4);
    });

    const hierarchy = [];
    for (const p2 of p2Items) {
      const p2Node = {
        ...p2,
        children: []
      };
      
      for (const p3 of p3Map.get(p2.id) || []) {
        const p4Children = p4Map.get(p3.id) || [];
        // Only add Period3 if it has Period4 children
        if (p4Children.length > 0) {
          p2Node.children.push({
            ...p3,
            children: p4Children
          });
        }
      }
      
      // Only add Period2 if it has valid Period3 children
      if (p2Node.children.length > 0) {
        hierarchy.push(p2Node);
      }
    }
    
    return hierarchy;
  } catch (error) {
    console.error("Error building Vivekananda hierarchy:", error);
    return [];
  }
}

export function getEventsByParameterId(paramId) {
  try {
    const stmt = db.prepare(`
      SELECT e.* 
      FROM events e
      JOIN event_parameters ep ON e.id = ep.event_id
      WHERE ep.parameter_id = ?
      ORDER BY e.yr ASC, e.mn ASC, e.dt ASC
    `);
    
    const events = stmt.all(paramId);
    
    // Filter out image events
    const textEvents = events.filter(e => !(e.type && e.type.toLowerCase() === 'image'));
    
    // Fetch children for accordion
    const parentIds = textEvents.map(e => e.id);
    if (parentIds.length === 0) return { parameter: getParameterById(paramId), events: [] };
    
    const childrenStmt = db.prepare(`
      SELECT * FROM events 
      WHERE child_id IN (${parentIds.map(() => '?').join(',')}) 
      AND id != child_id
    `);
    const childEvents = childrenStmt.all(...parentIds);
    
    const finalEvents = textEvents.map(parent => {
      const children = childEvents.filter(c => c.child_id === parent.id && c.du && c.du.trim() !== '');
      return { ...parent, children };
    });
    
    return {
      parameter: getParameterById(paramId),
      events: finalEvents
    };
  } catch (error) {
    console.error("Error fetching events by parameter:", error);
    return { parameter: null, events: [] };
  }
}

export function getParameterById(id) {
  try {
    const stmt = db.prepare('SELECT * FROM parameters WHERE id = ?');
    return stmt.get(id);
  } catch (e) {
    return null;
  }
}

export function searchEvents(term, limit = 50) {
  try {
    // Basic LIKE search
    const stmt = db.prepare(`
      SELECT * FROM events 
      WHERE du LIKE ? 
      LIMIT ?
    `);
    return stmt.all(`%${term}%`, limit);
  } catch (error) {
    console.error("Error searching events:", error);
    return [];
  }
}

export function getTableNames() {
  const stmt = db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`);
  return stmt.all().map(row => row.name);
}

export function getPlacesHierarchy() {
  try {
    // 1. Get the ID for "India" (Place1)
    const indiaStmt = db.prepare(`SELECT id FROM parameters WHERE para1 = 'India' AND type = 'Place1'`);
    const indiaRow = indiaStmt.get();
    if (!indiaRow) return [];

    const indiaId = indiaRow.id;

    // 2. Fetch all parameters of type Place
    const allPlacesStmt = db.prepare(`SELECT id, para1 FROM parameters WHERE type LIKE 'Place%' ORDER BY para1`);
    const allPlaces = allPlacesStmt.all();
    const placeMap = new Map();
    allPlaces.forEach(p => placeMap.set(p.id, p));

    // 3. Fetch all hierarchy relations
    const relStmt = db.prepare(`SELECT parent_id, child_id FROM param_hierarchy`);
    const relations = relStmt.all();

    // Group children by parent
    const childrenByParent = new Map();
    relations.forEach(r => {
      if (!childrenByParent.has(r.parent_id)) {
        childrenByParent.set(r.parent_id, []);
      }
      childrenByParent.get(r.parent_id).push(r.child_id);
    });

    // Recursive function to build tree
    function buildTree(nodeId) {
      const node = placeMap.get(nodeId);
      if (!node) return null;

      const childrenIds = childrenByParent.get(nodeId) || [];
      // recursively resolve children and sort by name
      const children = childrenIds
        .map(buildTree)
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name));

      return {
        id: node.id,
        name: node.para1,
        children: children
      };
    }

    // Return the children of India (Place2) as the roots of our report
    const topLevelIds = childrenByParent.get(indiaId) || [];
    return topLevelIds
      .map(buildTree)
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name));

  } catch (error) {
    console.error("Error building places hierarchy:", error);
    return [];
  }
}

export default db;
