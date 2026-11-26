import { getCurrentSession } from "@/lib/auth";

export class FormServiceIntegrationError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

export async function requireFormServiceAdmin() {
  const session = await getCurrentSession();
  if (!session) throw new FormServiceIntegrationError("Unauthorized.", 401);
  if (session.role !== "ADMIN") {
    throw new FormServiceIntegrationError("Only Booksaa administrators can manage forms.", 403);
  }
  return session;
}

export async function requestFormService(path, { session, method = "GET", body } = {}) {
  const baseUrl = process.env.FORM_SERVICE_URL;
  const clientId = process.env.FORM_SERVICE_PARTNER_CLIENT_ID;
  const clientSecret = process.env.FORM_SERVICE_PARTNER_CLIENT_SECRET;
  if (!baseUrl || !clientId || !clientSecret) {
    throw new FormServiceIntegrationError(
      "Form Service is not configured. Set FORM_SERVICE_URL and the partner Client ID/Secret on the Booksaa server.",
      503,
    );
  }

  let endpoint;
  try {
    endpoint = new URL(path, `${baseUrl.replace(/\/+$/, "")}/`);
  } catch {
    throw new FormServiceIntegrationError("FORM_SERVICE_URL must be a valid URL.", 503);
  }
  if (!["http:", "https:"].includes(endpoint.protocol)) {
    throw new FormServiceIntegrationError("FORM_SERVICE_URL must use HTTP or HTTPS.", 503);
  }

  const headers = {
    Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
  };
  if (session?.id) headers["X-User-Id"] = session.id;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const response = await fetch(endpoint, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    cache: "no-store",
  });
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new FormServiceIntegrationError("Form Service returned an invalid response.", 502);
  }
  return Response.json(data, { status: response.status });
}
