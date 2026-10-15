import assert from 'node:assert/strict';
import test from 'node:test';
import { correctVivekanandaTimelineDate, stripTimelineOrdinal } from '../src/lib/vivekananda-labels.mjs';

test('Vivekananda America date ranges use the nineteenth century', () => {
  assert.equal(correctVivekanandaTimelineDate('26 America: East coast (Aug - Nov 1999)'), '26 America: East coast (Aug - Nov 1899)');
  assert.equal(correctVivekanandaTimelineDate('27 America: West coast (Dec 99- July 1900)'), '27 America: West coast (Dec 1899- July 1900)');
  assert.equal(correctVivekanandaTimelineDate('28 Europe and Mediterranean (July-Nov 1900)'), '28 Europe and Mediterranean (July-Nov 1900)');
});

test('timeline display preserves dates while removing section ordinals', () => {
  assert.equal(stripTimelineOrdinal('10, 11 Sept 1893'), '10, 11 Sept 1893');
  assert.equal(stripTimelineOrdinal('12 - 27 Sept 1893'), '12 - 27 Sept 1893');
  assert.equal(stripTimelineOrdinal('10 Sept 1893'), '10 Sept 1893');
  assert.equal(stripTimelineOrdinal('26 America: East coast (Aug - Nov 1899)'), 'America: East coast (Aug - Nov 1899)');
  assert.equal(stripTimelineOrdinal('1 Ridgley Manor (Aug-Nov 1899)'), 'Ridgley Manor (Aug-Nov 1899)');
});
