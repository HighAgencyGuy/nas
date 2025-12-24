import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhatsAppButtonProps {
  message?: string;
  className?: string;
}

export function WhatsAppButton({ message = "Hello, I'm interested in your vehicles.", className }: WhatsAppButtonProps) {
  const phoneNumber = "2348035644916";
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-pulse-gold",
        "md:px-6 md:py-4",
        className
      )}
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="hidden md:inline font-semibold">Chat with us</span>
    </a>
  );
}
