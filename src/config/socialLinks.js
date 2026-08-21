import { Instagram, MessageCircle } from "lucide-react";

// Scalable list of live social accounts. To add a channel once it's actually
// active (YouTube, Facebook, LinkedIn, Pinterest, ...), add one entry here —
// no component changes needed. Entries with no href are skipped automatically.
export function getSocialLinks({ whatsAppLink, instagramUrl }) {
  return [
    { id: "whatsapp", label: "WhatsApp", href: whatsAppLink, Icon: MessageCircle },
    { id: "instagram", label: "Instagram", href: instagramUrl, Icon: Instagram },
  ].filter((link) => link.href);
}
