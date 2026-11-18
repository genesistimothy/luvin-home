const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Any country: optional + prefix, 8-15 digits. Spaces, dashes, dots and
// parentheses are separators, so national and international formats both pass.
const PHONE_RE = /^\+?\d{8,15}$/;
const PHONE_SEPARATORS = /[\s().-]/g;

export function isValidEmail(value) {
  return EMAIL_RE.test(String(value || "").trim());
}

export function isValidPhone(value) {
  return PHONE_RE.test(String(value || "").trim().replace(PHONE_SEPARATORS, ""));
}

export function isValidContact(value) {
  const trimmed = String(value || "").trim();
  return isValidEmail(trimmed) || isValidPhone(trimmed);
}
