import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { sendInviteEmail } from "@/lib/sendInviteEmail";
import bcrypt from "bcryptjs"; 


export async function POST(req) {
  const body = await req.json();
  const { firstname, lastname, email, categoryId, planId,name } = body;

  if (!firstname || !lastname || !email || !categoryId || !planId || !name) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  let user = await prisma.users.findUnique({ where: { email } });
  const hashed = await bcrypt.hash("INVITED", 10);

  if (!user) {
    user = await prisma.users.create({
      data: {
        firstname,
        lastname,
        email,
        password: hashed,
        role: {
          connect:{
            name: "VENDOR",
          }
        },
        status: "INACTIVE", // Optional
      },
    });
  }

  const vendor = await prisma.vendors.create({
    data: {
      name,
      categoryId,
      planId,
      userId: user.id,
      status: "INACTIVE",
    },
  });

  const token = uuidv4();

  await prisma.invitation.create({
    data: {
      email,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h
    },
  });

  await sendInviteEmail(email, token);

  return Response.json({ success: true });
}
