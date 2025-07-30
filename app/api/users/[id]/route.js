import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req, {params}) {
  const { id } = await params;

  if (!id) {
    return new NextResponse(JSON.stringify({ error: "User Id missing" }));
  }

  try {
    const deletedUsers = await prisma.users.delete({
      where: { id: id },
    });

    return new NextResponse(JSON.stringify(deletedUsers), { status: 200 });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: "User not found" }), {
      status: 404,
    });
  }
}