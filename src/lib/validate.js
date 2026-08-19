const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?\d{8,15}$/;

export function isValidEmail(value) {
  return EMAIL_RE.test(String(value || "").trim());
}

export function isValidContact(value) {
  const trimmed = String(value || "").trim();
  return isValidEmail(trimmed) || PHONE_RE.test(trimmed.replace(/[\s-]/g, ""));
}
