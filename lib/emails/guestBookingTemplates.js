function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function guestBookingOtpTemplate(code, businessName) {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:560px;margin:auto;padding:24px">
      <h1 style="font-size:22px">Verify your email</h1>
      <p>Use this code to continue booking with ${escapeHtml(businessName)}:</p>
      <p style="font-size:32px;font-weight:700;letter-spacing:8px">${escapeHtml(code)}</p>
      <p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>
    </div>`;
}

export function guestBookingConfirmationTemplate({ name, businessName, serviceName, professionalName, locationName, date, time, paidAmount }) {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:560px;margin:auto;padding:24px">
      <h1 style="font-size:22px;color:#15803d">Your appointment is confirmed</h1>
      <p>Hello ${escapeHtml(name)}, your appointment with ${escapeHtml(businessName)} is confirmed.</p>
      <p><strong>Service:</strong> ${escapeHtml(serviceName)}<br>
      <strong>Professional:</strong> ${escapeHtml(professionalName || "To be assigned")}<br>
      <strong>Location:</strong> ${escapeHtml(locationName)}<br>
      <strong>Date:</strong> ${escapeHtml(date)}<br>
      <strong>Time:</strong> ${escapeHtml(time)}</p>
      ${paidAmount > 0 ? `<p>Deposit paid: $${escapeHtml(Number(paidAmount).toFixed(2))}</p>` : ""}
      <p>Thank you for booking with Booksaa.</p>
    </div>`;
}
