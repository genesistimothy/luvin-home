import { MessageCircle } from "lucide-react";

export default function FloatingWhatsApp({ whatsAppLink }) {
  return (
    <a
      href={whatsAppLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Luvin Home on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full border border-cream/30 bg-umber text-cream shadow-[0_16px_45px_rgba(62,44,35,0.22)] transition duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-clay"
    >
      <MessageCircle size={26} />
    </a>
  );
}
