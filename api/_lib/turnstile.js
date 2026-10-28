/**
 * Server-side Turnstile verification. In production a missing secret is a
 * configuration error (503), never an open door. Local development without a
 * secret skips the check so forms remain usable.
 */
export async function verifyTurnstile(req, token) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    const production = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
    return production ? { ok: false, status: 503 } : { ok: true };
  }
  if (!token) return { ok: false, status: 400 };

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: String(token),
        remoteip: String(req.headers["x-forwarded-for"] || "").split(",")[0].trim(),
      }),
    });
    const result = await response.json();
    return result?.success === true ? { ok: true } : { ok: false, status: 400 };
  } catch {
    return { ok: false, status: 503 };
  }
}
