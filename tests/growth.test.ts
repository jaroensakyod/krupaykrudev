import test from "node:test";
import assert from "node:assert/strict";
import { normalizeQuery } from "../src/lib/search/normalize";
import { referralExpiresAt, referralRewardAmount } from "../src/lib/growth";
import { bundleSavings } from "../src/lib/bundles";

test("Thai grade and subject query normalizes to filters", () => {
  const result = normalizeQuery("ใบงานคณิตศาสตร์ ม.3");
  assert.equal(result.gradeCode, "M3");
  assert.equal(result.subjectCode, "MATH");
});
test("referral expires after exactly 90 days and reward is five percent", () => {
  assert.equal(referralExpiresAt(new Date("2026-01-01T00:00:00Z")).toISOString(), "2026-04-01T00:00:00.000Z");
  assert.equal(referralRewardAmount(15), 0.75);
});
test("bundle savings never become negative", () => {
  assert.equal(bundleSavings(300, 249), 51);
  assert.equal(bundleSavings(100, 150), 0);
});
