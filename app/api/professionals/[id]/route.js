import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req, { params }) {
  const { id } = await params;

  if (!id) {
    return new NextResponse(JSON.stringify({ error: "Professiona ID missing" }));
  }

  try {
    const deletedProfessional = await prisma.professional.delete({
      where: { id: id },
    });

    return new NextResponse(JSON.stringify(deletedProfessional), { status: 200 });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: "Professional not found" }), {
      status: 404,
    });
  }
}

export async function PATCH(req, { params }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "Professional ID missing" }, { status: 400 });
  }

  try {
    const { name, role, status, phone } = await req.json();
    
    if (!name || !role || !status || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updatedProfessional = await prisma.professional.update({
      where: { id },
      data: {
        name,
        role,
        status,
        phone,
      },
    });

    return NextResponse.json(updatedProfessional, { status: 200 });
  } catch (error) {
    console.error("Update fail: ", error);
    return NextResponse.json(
      { error: error.message || "Cannot Edit Professional" },
      { status: 400 }
    );
  }
}

export async function GET(req, { params }) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "Professional ID missing" }, { status: 400 });
  }
  try {
    const professional = await prisma.professional.findUnique({
      where: { id },
    });
    if (!professional) {
      return NextResponse.json({ error: "Professional not found" }, { status: 404 });
    }
    return NextResponse.json(professional, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch professional" },
      { status: 500 }
    );
  }
}
