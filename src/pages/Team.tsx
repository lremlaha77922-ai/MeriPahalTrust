import { Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TEAM_MEMBERS } from '@/constants/team';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const Team = () => {
  const teamRef = useScrollReveal();

  const handleWhatsAppClick = (mobile: string, name: string) => {
    const message = encodeURIComponent(`नमस्ते ${name} जी, मुझे मेरी पहल ट्रस्ट के बारे में जानकारी चाहिए।`);
    window.open(`https://wa.me/91${mobile}?text=${message}`, '_blank');
  };

  const handleCallClick = (mobile: string) => {
    window.location.href = `tel:+91${mobile}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-trust-blue to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 animate-fade-in-up">
            हमारी टीम
          </h1>
          <p className="text-xl text-center text-gray-100 max-w-3xl mx-auto animate-fade-in-up delay-200">
            अनुभवी और समर्पित नेतृत्व
          </p>
        </div>
      </section>

      {/* Team Members */}
      <section className="py-16">
        <div className="container mx-auto px-4" ref={teamRef.ref}>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {TEAM_MEMBERS.map((member, index) => (
              <div
                key={index}
                className={`bg-white rounded-lg shadow-lg overflow-hidden hover-lift image-zoom-container transition-all duration-500 ${
                  teamRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="relative h-64 bg-gradient-to-br from-trust-blue to-blue-600 image-zoom">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl hover-scale">
                      <span className="text-4xl font-bold text-trust-blue">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <h3 className="text-white font-bold text-xl">{member.name}</h3>
                    <p className="text-gray-200 text-sm">{member.designation}</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <Phone className="h-4 w-4 text-trust-blue" />
                    <span className="text-gray-700 font-medium">+91 {member.mobile}</span>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button
                      onClick={() => handleWhatsAppClick(member.mobile, member.name)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white hover-scale"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      WhatsApp पर संपर्क करें
                    </Button>
                    <Button
                      onClick={() => handleCallClick(member.mobile)}
                      variant="outline"
                      className="w-full border-trust-blue text-trust-blue hover:bg-trust-lightblue hover-scale"
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      कॉल करें
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-trust-lightblue p-8 rounded-lg text-center hover-lift">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              हमसे संपर्क करें
            </h2>
            <p className="text-gray-700 mb-6">
              किसी भी प्रश्न या सहायता के लिए हमारी टीम से संपर्क करें। हम सोमवार से शनिवार, सुबह 9:00 बजे से शाम 6:00 बजे तक उपलब्ध हैं।
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => handleWhatsAppClick('7073741421', 'टीम')}
                className="bg-green-500 hover:bg-green-600 text-white hover-scale"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Official WhatsApp
              </Button>
              <Button
                onClick={() => handleCallClick('7073741421')}
                className="bg-trust-blue hover:bg-blue-800 text-white hover-scale"
              >
                <Phone className="mr-2 h-4 w-4" />
                Official Call
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Team;
