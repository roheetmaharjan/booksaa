import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentVendorOrThrow } from "@/lib/customer-crm";

const columns = [
  ["customerCode", "Customer ID"],
  ["fullName", "Name"],
  ["phone", "Phone"],
  ["email", "Email"],
  ["address", "Address"],
  ["status", "Status"],
  ["tags", "Tags"],
  ["loyaltyPoints", "Loyalty Points"],
  ["dateJoined", "Date Joined"],
  ["notes", "Notes"],
];

function escapeCsv(value) {
  const text = Array.isArray(value) ? value.join(", ") : value instanceof Date ? value.toISOString() : String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function escapeHtml(value) {
  const text = Array.isArray(value) ? value.join(", ") : value instanceof Date ? value.toISOString() : String(value ?? "");
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function GET(req) {
  try {
    const session = await getCurrentSession();
    const vendor = await getCurrentVendorOrThrow(session);
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "csv";

    const customers = await prisma.customer.findMany({
      where: { vendorId: vendor.id },
      orderBy: { fullName: "asc" },
    });

    if (format === "excel") {
      const html = `<!doctype html><html><head><meta charset="utf-8" /></head><body><table><thead><tr>${columns
        .map(([, label]) => `<th>${escapeHtml(label)}</th>`)
        .join("")}</tr></thead><tbody>${customers
        .map((customer) => `<tr>${columns.map(([key]) => `<td>${escapeHtml(customer[key])}</td>`).join("")}</tr>`)
        .join("")}</tbody></table></body></html>`;

      return new NextResponse(html, {
        headers: {
          "Content-Type": "application/vnd.ms-excel; charset=utf-8",
          "Content-Disposition": "attachment; filename=customers.xls",
        },
      });
    }

    const csv = [columns.map(([, label]) => escapeCsv(label)).join(","), ...customers.map((customer) => columns.map(([key]) => escapeCsv(customer[key])).join(","))].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=customers.csv",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to export customers." }, { status: error.status || 500 });
  }
}
