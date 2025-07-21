import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { token, password, phone, bio, location } = await req.json();

  const invite = await prisma.invitation.findUnique({ where: { token } });

  if (!invite || invite.used || invite.expiresAt < new Date()) {
    return Response.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const user = await prisma.users.findUnique({ where: { email: invite.email } });

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }


  await prisma.users.update({
    where: { id: user.id },
    data: {
      password: await bcrypt.hash(password, 10),
      phone,
      bio,
      location,
      status: "ACTIVE", // If needed
    },
  });

  await prisma.invitation.update({
    where: { token },
    data: { used: true },
  });

  return Response.json({ success: true });
}
