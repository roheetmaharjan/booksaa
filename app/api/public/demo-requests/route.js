import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const INDUSTRIES = new Set([
  "Beauty salon",
  "Barbershop",
  "Med spa",
  "Nail salon",
  "Massage & wellness",
  "Hair removal",
  "Tattoo & piercing",
  "Other",
]);
const LOCATIONS = new Set(["1 Location (Single)", "2–5 Locations", "6–10 Locations", "11+ Locations"]);
const STAFF_OPTIONS = new Set(["Just me (Solo operator)", "2–5 providers", "6–10 providers", "11+ providers"]);

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const firstName = text(body?.firstName);
  const lastName = text(body?.lastName);
  const businessEmail = text(body?.businessEmail).toLowerCase();
  const phone = text(body?.phone);
  const businessName = text(body?.businessName);
  const industry = text(body?.industry);
  const locations = text(body?.locations);
  const software = text(body?.software);
  const staffCount = text(body?.staffCount);
  const notes = text(body?.notes);

  if (!firstName || !lastName || !businessName || !phone || !businessEmail || !industry) {
    return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
  }
  if (firstName.length > 80 || lastName.length > 80 || businessName.length > 120 || phone.length > 32 || businessEmail.length > 254 || software.length > 120 || notes.length > 2000) {
    return NextResponse.json({ error: "One or more fields exceed the allowed length." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessEmail)) {
    return NextResponse.json({ error: "Please provide a valid business email." }, { status: 400 });
  }
  if (!INDUSTRIES.has(industry) || !LOCATIONS.has(locations) || !STAFF_OPTIONS.has(staffCount)) {
    return NextResponse.json({ error: "Please select valid business details." }, { status: 400 });
  }
  if (body?.consent !== true) {
    return NextResponse.json({ error: "Please agree to the privacy policy and terms." }, { status: 400 });
  }

  try {
    const demoRequest = await prisma.demoRequest.create({
      data: {
        firstName,
        lastName,
        businessEmail,
        phone,
        businessName,
        industry,
        locations,
        software: software || null,
        staffCount,
        notes: notes || null,
      },
      select: { id: true },
    });

    return NextResponse.json({ success: true, id: demoRequest.id }, { status: 201 });
  } catch (error) {
    console.error("Demo request submission failed:", error);
    return NextResponse.json({ error: "Unable to save your demo request right now." }, { status: 500 });
  }
}
