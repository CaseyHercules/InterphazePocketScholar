import test from "node:test";
import assert from "node:assert/strict";
import { getEventData, readEventCollection, writeEventCollection } from "@/lib/event-data";

test("event-data reads and writes collection keys safely", () => {
  const source = { items: [{ itemId: "a", quantity: 2 }], other: "keep" };
  const items = readEventCollection<{ itemId: string; quantity: number }>(source, "items");
  assert.equal(items.length, 1);
  assert.equal(items[0]?.itemId, "a");

  const updated = writeEventCollection(source, "spells", [{ id: "s1", quantity: 1 }]);
  assert.deepEqual(updated.items, source.items);
  assert.deepEqual(updated.spells, [{ id: "s1", quantity: 1 }]);
  assert.equal(updated.other, "keep");
});

test("event-data normalizes invalid shapes", () => {
  assert.deepEqual(getEventData(null), {});
  assert.deepEqual(readEventCollection(undefined, "items"), []);
  assert.deepEqual(readEventCollection({ items: "bad" }, "items"), []);
});
