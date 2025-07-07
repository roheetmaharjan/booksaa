import { Redis } from "@upstash/redis";
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function isRateLimited(ip) {
  const key = `rate_limit:${ip}`;
  const limit = Infinity;
  const ttl = 60;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, ttl);
  }
  return {
    isLimited: count > limit,
    count,
  };
}
