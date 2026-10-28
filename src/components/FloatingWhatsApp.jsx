import { MessageCircle } from "lucide-react";

export default function FloatingWhatsApp({ whatsAppLink }) {
  return (
    <a
      href={whatsAppLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Luvin Home on WhatsApp"
      className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-[calc(1.25rem+env(safe-area-inset-right))] z-40 inline-flex h-14 w-14 items-center justify-center rounded-full border border-cream/30 bg-umber text-cream shadow-[0_16px_45px_rgba(62,44,35,0.22)] transition-[transform,background-color] duration-200 ease-[var(--ease-premium)] motion-safe:hover:-translate-y-0.5 motion-safe:hover:scale-105 hover:bg-clay motion-safe:active:scale-95"
    >
      <MessageCircle size={26} />
    </a>
  );
}
