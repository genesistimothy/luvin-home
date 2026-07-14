// Replace this value here if Luvin Home's official WhatsApp number changes.
export const WHATSAPP_NUMBER = "6282298887298";

const DEFAULT_WHATSAPP_MESSAGE =
  "Hello Luvin Home, I would like to know more about your collection.";

export function createWhatsAppLink(message = DEFAULT_WHATSAPP_MESSAGE, number = WHATSAPP_NUMBER) {
  const safeNumber = /^\d{8,18}$/.test(String(number)) ? String(number) : WHATSAPP_NUMBER;
  return `https://wa.me/${safeNumber}?text=${encodeURIComponent(message)}`;
}

export const INSTAGRAM_LINK = "https://www.instagram.com/luvinhome.id";
