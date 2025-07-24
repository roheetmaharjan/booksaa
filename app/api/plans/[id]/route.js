import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req, context) {
  const { id } = context.params;
}