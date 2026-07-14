// Replace this value here if Luvin Home's official WhatsApp number changes.
export const WHATSAPP_NUMBER = "6282298887298";

const DEFAULT_WHATSAPP_MESSAGE =
  "Hello Luvin Home, I would like to know more about your collection.";

export function createWhatsAppLink(message = DEFAULT_WHATSAPP_MESSAGE) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const INSTAGRAM_LINK = "https://www.instagram.com/luvinhome.id";
