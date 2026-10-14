import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const developmentSecret = randomBytes(32);
const OTP_EXPIRY_MS = 10 * 60 * 1000;
const VERIFIED_EXPIRY_MS = 30 * 60 * 1000;

function getSecret() {
  const configuredSecret = process.env.GUEST_BOOKING_OTP_SECRET;
  if (configuredSecret) return configuredSecret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("GUEST_BOOKING_OTP_SECRET must be configured in production.");
  }
  return developmentSecret;
}

function sign(value) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function createToken(payload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

function readToken(token) {
  if (typeof token !== "string") return null;

  const [encodedPayload, signature, extra] = token.split(".");
  if (!encodedPayload || !signature || extra) return null;

  const expected = Buffer.from(sign(encodedPayload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    return payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

export function createOtpChallenge(email, code) {
  const expiresAt = Date.now() + OTP_EXPIRY_MS;
  const codeHash = createHmac("sha256", getSecret()).update(`${email}:${code}:${expiresAt}`).digest("base64url");
  return createToken({ type: "guest-booking-otp", email, codeHash, exp: expiresAt });
}

export function verifyOtpChallenge(token, code) {
  const payload = readToken(token);
  if (!payload || payload.type !== "guest-booking-otp" || !/^\d{6}$/.test(code)) return null;

  const candidate = createHmac("sha256", getSecret()).update(`${payload.email}:${code}:${payload.exp}`).digest("base64url");
  const expected = Buffer.from(payload.codeHash);
  const received = Buffer.from(candidate);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  return payload.email;
}

export function createVerifiedEmailToken(email) {
  return createToken({
    type: "guest-booking-email-verified",
    email,
    exp: Date.now() + VERIFIED_EXPIRY_MS,
  });
}

export function getVerifiedEmail(token) {
  const payload = readToken(token);
  return payload?.type === "guest-booking-email-verified" ? payload.email : null;
}
