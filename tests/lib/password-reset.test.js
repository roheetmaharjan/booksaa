import test from "node:test";
import assert from "node:assert/strict";
import {
  createPasswordResetToken,
  hashPasswordResetToken,
} from "../../utils/passwordReset.js";

test("password reset tokens are random and stored as one-way hashes", () => {
  const first = createPasswordResetToken();
  const second = createPasswordResetToken();

  assert.notEqual(first.token, second.token);
  assert.notEqual(first.tokenHash, first.token);
  assert.equal(first.tokenHash, hashPasswordResetToken(first.token));
});
