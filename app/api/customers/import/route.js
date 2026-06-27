import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCustomerCode, findCustomerDuplicates, getCurrentVendorOrThrow, normalizeEmail, normalizePhone } from "@/lib/customer-crm";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && quoted && next === '"') {
      value += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(value.trim());
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(value.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  row.push(value.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function normalizeHeader(header) {
  return header.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export async function POST(req) {
  try {
    const session = await getCurrentSession();
    const vendor = await getCurrentVendorOrThrow(session);
    const formData = await req.formData();
    const file = formData.get("file");
    const ignoreDuplicates = formData.get("ignoreDuplicates") === "true";

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "CSV file is required." }, { status: 400 });
    }

    const rows = parseCsv(await file.text());
    if (rows.length < 2) {
      return NextResponse.json({ error: "CSV must include headers and at least one customer." }, { status: 400 });
    }

    const headers = rows[0].map(normalizeHeader);
    const imported = [];
    const duplicates = [];
    const errors = [];

    for (const [index, row] of rows.slice(1).entries()) {
      const record = Object.fromEntries(headers.map((header, column) => [header, row[column] || ""]));
      const fullName = record.name || record.fullname;
      const payload = {
        fullName,
        phone: normalizePhone(record.phone),
        email: normalizeEmail(record.email),
        address: record.address || null,
        notes: record.notes || null,
      };

      if (!payload.fullName) {
        errors.push({ row: index + 2, error: "Name is required." });
        continue;
      }

      const matches = await findCustomerDuplicates(vendor.id, payload);
      if (matches.length > 0 && !ignoreDuplicates) {
        duplicates.push({ row: index + 2, customer: payload, matches });
        continue;
      }

      const customer = await prisma.customer.create({
        data: {
          ...payload,
          vendorId: vendor.id,
          customerCode: await createCustomerCode(vendor.id),
        },
        select: { id: true, customerCode: true, fullName: true },
      });
      imported.push(customer);
    }

    return NextResponse.json({ imported, duplicates, errors });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to import customers." }, { status: error.status || 500 });
  }
}
