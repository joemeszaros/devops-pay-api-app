import test from "node:test";
import assert from "node:assert/strict";
import { splitIntoInstallments } from "../src/installments.js";

test("splitIntoInstallments preserves the original total", () => {
  const plan = splitIntoInstallments(10_000, 3);

  assert.equal(plan.length, 3);
  assert.deepEqual(
    plan.map((item) => item.amountMinor),
    [3334, 3333, 3333]
  );
  assert.equal(
    plan.reduce((total, item) => total + item.amountMinor, 0),
    10_000
  );
});

test("splitIntoInstallments handles exact division", () => {
  const plan = splitIntoInstallments(12_000, 6);

  assert.equal(plan.length, 6);
  assert.ok(plan.every((item) => item.amountMinor === 2000));
});
