import { FormServiceIntegrationError, requestFormService, requireFormServiceAdmin } from "@/lib/form-service";

export const runtime = "nodejs";

export async function POST() {
  try {
    const session = await requireFormServiceAdmin();
    return await requestFormService("/api/v1/sessions", {
      session,
      method: "POST",
      body: { kind: "builder" },
    });
  } catch (error) {
    if (!(error instanceof FormServiceIntegrationError)) {
      console.error("Failed to create a Form Service builder session:", error);
    }
    return Response.json(
      { error: error.message || "Unable to connect to Form Service." },
      { status: error.status || 502 },
    );
  }
}
