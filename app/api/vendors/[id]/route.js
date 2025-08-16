import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { id } = await params;
  try {
    const vendor = await prisma.vendors.findUnique({
      where: { id },
      include: {
        plan: true,
        category: true,
        user: true,
      },
    });

    if (!vendor) {
      return new Response(JSON.stringify({ error: "Vendor not found" }), {
        status: 404,
      });
    }

    const joinedAtDateOnly = vendor.joinedAt.toISOString().slice(0, 10);
    const trialEndsAtDateOnly = vendor.trialEndsAt.toISOString().slice(0, 10);

    const result = {
      ...vendor,
      joinedAt: joinedAtDateOnly,
      trialEndsAt: trialEndsAtDateOnly,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error fetching vendor" }), {
      status: 500,
    });
  }
}
export async function PUT(req, { params }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Vendor Id is missing" },
      { status: 400 }
    );
  }

  try {
    const data = await req.json();

    const name = data.name;
    const description = data.description;
    const phone = data.phone;
    const cancellation_policy = data.cancellation_policy;
    const location = data.location;
    const planId = data.planId;
    const categoryId = data.categoryId

    const userFirstname = data.user?.firstname;
    const userLastname = data.user?.lastname;
    const userEmail = data.user?.email;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const updatedVendor = await prisma.vendors.update({
      where: { id },
      data: {
        name,
        description,
        phone,
        cancellation_policy,
        location,
        planId,
        categoryId
      },
      include:{user:true}
    });

    if (updatedVendor.userId && (userFirstname||userLastname)){
      await prisma.users.update({
        where:{id : updatedVendor.userId},
        data:{
          firstname: userFirstname,
          lastname:userLastname
        }
      })
    }

    return NextResponse.json(
      { message: "Vendor updated successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating vendor:", error);
    return NextResponse.json(
      { error: "Failed to update vendor" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Vendor ID missing" }, { status: 400 });
  }

  try {
    const vendor = await prisma.vendors.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }
    if (vendor.status === "ACTIVE") {
      return NextResponse.json(
        { error: "You cannot delete active vendors." },
        { status: 403 }
      );
    }

    await prisma.vendors.delete({
      where: { id },
    });

    await prisma.users.delete({
      where: { id: vendor.userId },
    });

    return NextResponse.json(
      { success: true, message: "Vendor and user deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete vendor or user" },
      { status: 500 }
    );
  }
}
