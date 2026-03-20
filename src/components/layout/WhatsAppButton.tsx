import { MessageCircle } from 'lucide-react';
import { OFFICIAL_WHATSAPP } from '@/constants/team';

const WhatsAppButton = () => {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('नमस्ते, मुझे मेरी पहल ट्रस्ट के बारे में जानकारी चाहिए।');
    window.open(`https://wa.me/91${OFFICIAL_WHATSAPP}?text=${message}`, '_blank');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50 flex items-center justify-center"
      aria-label="WhatsApp संपर्क करें"
    >
      <MessageCircle className="h-6 w-6" />
    </button>
  );
};

export default WhatsAppButton;