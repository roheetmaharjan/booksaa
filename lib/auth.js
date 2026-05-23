import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  AUTH_COOKIE_NAME,
  createSessionToken,
  getSessionCookieOptions,
  verifySessionToken,
} from "@/lib/auth-session";

export function buildSessionUser(user) {
  return {
    id: user.id,
    name: user.firstname,
    email: user.email,
    role: user.role.name,
  };
}

export async function authenticateUser(identifier, password) {
  if (!identifier || !password) {
    return null;
  }

  const user = await prisma.users.findFirst({
    where: {
      OR: [{ email: identifier }, { username: identifier }],
    },
    include: {
      role: true,
    },
  });

  if (!user) {
    return null;
  }

  if (user.status !== "ACTIVE") {
    throw new Error("Your account is not active. Please complete your profile.");
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return null;
  }

  return buildSessionUser(user);
}

export async function getSessionFromCookieStore(cookieStore) {
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function getCurrentSession() {
  return getSessionFromCookieStore(await cookies());
}

export { AUTH_COOKIE_NAME, createSessionToken, getSessionCookieOptions, verifySessionToken };
