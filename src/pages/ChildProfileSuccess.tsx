import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, MessageSquare, Clock, Heart, ArrowRight, Settings } from "lucide-react";
import CulturalFooter from "@/components/CulturalFooter";

export default function ChildProfileSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const childName = searchParams.get('name') || 'Anak';
  const age = parseInt(searchParams.get('age') || '6');
  
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Animate content appearance
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Age-appropriate conversation previews
  const getConversationPreviews = (age: number) => {
    if (age <= 6) {
      return [
        { topic: "Hewan Lucu", preview: "Kaka mau cerita tentang kelinci yang suka melompat..." },
        { topic: "Warna Pelangi", preview: "Wah, kamu suka warna apa? Kaka suka biru kayak langit..." },
        { topic: "Dongeng Islami", preview: "Ada cerita tentang Nabi yang baik hati nih..." }
      ];
    } else if (age <= 10) {
      return [
        { topic: "Sains Seru", preview: "Tau nggak kenapa langit biru? Kaka jelasin yuk..." },
        { topic: "Cerita Sahabat", preview: "Kaka mau cerita tentang persahabatan yang indah..." },
        { topic: "Matematika Asyik", preview: "Yuk belajar hitung-hitungan sambil main..." }
      ];
    } else {
      return [
        { topic: "Cita-cita", preview: "Kamu mau jadi apa kalau udah besar nanti?" },
        { topic: "Hobi & Minat", preview: "Cerita dong tentang hal yang kamu suka..." },
        { topic: "Pelajaran Sekolah", preview: "Ada PR yang susah? Kaka bantu jelasin..." }
      ];
    }
  };

  const conversationPreviews = getConversationPreviews(age);

  const safetyFeatures = [
    {
      icon: Shield,
      title: "Semua percakapan dipantau",
      description: "Kaka selalu pastikan obrolan aman untuk anak"
    },
    {
      icon: Heart,
      title: "Konten sesuai nilai Islam",
      description: "Setiap cerita mengajarkan akhlak yang baik"
    },
    {
      icon: Clock,
      title: "Waktu bermain terkendali",
      description: `${age <= 6 ? '30' : age <= 10 ? '45' : '60'} menit per hari untuk keseimbangan`
    }
  ];

  const handleStartChat = () => {
    console.log('Navigating from success page to child-selection');
    // Add a small delay to ensure database consistency
    setTimeout(() => {
      navigate('/child-selection');
    }, 100);
  };

  const handleSettings = () => {
    navigate('/family-dashboard');
  };

  const handleGoToDashboard = () => {
    console.log('Navigating to family dashboard');
    setTimeout(() => {
      navigate('/family-dashboard');
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-cultural p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Celebration Header */}
        <div className={`text-center transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="text-6xl mb-4 animate-bounce-gentle">🎉</div>
          <h1 className="text-3xl font-bold text-emerald-800 mb-2">
            {childName} siap bertemu Kaka!
          </h1>
          <p className="text-lg text-emerald-700 mb-6">
            Kaka udah nggak sabar ketemu {childName}! Ayo mulai petualangan belajar yang seru bersama.
          </p>
        </div>

        {/* Conversation Previews */}
        <Card className={`p-6 border-2 border-emerald-200 transition-all duration-700 delay-200 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="text-xl font-semibold text-emerald-800 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Topik Seru yang Menanti
          </h2>
          <div className="space-y-3">
            {conversationPreviews.map((conv, index) => (
              <div key={index} className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                    {conv.topic}
                  </Badge>
                </div>
                <p className="text-sm text-emerald-700 italic">"{conv.preview}"</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Safety Assurances */}
        <Card className={`p-6 border-2 border-blue-200 transition-all duration-700 delay-400 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="text-xl font-semibold text-blue-800 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Jaminan Keamanan untuk {childName}
          </h2>
          <div className="space-y-4">
            {safetyFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <feature.icon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-800">{feature.title}</h3>
                  <p className="text-sm text-blue-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className={`space-y-3 transition-all duration-700 delay-600 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Button 
            onClick={handleStartChat}
            className="w-full h-14 text-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg"
          >
            <span className="mr-2">Yuk, {childName} kenalan sama Kaka sekarang!</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleGoToDashboard}
            className="w-full h-12 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          >
            <Settings className="w-4 h-4 mr-2" />
            Lihat Dashboard Keluarga
          </Button>
        </div>

        {/* Kaka's Message */}
        <Card className={`p-4 bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-200 transition-all duration-700 delay-800 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-300 rounded-full flex items-center justify-center text-xl">
              🐨
            </div>
            <div>
              <p className="text-orange-800 font-medium">
                "Selamat datang di keluarga Kaka, {childName}! Kaka siap jadi teman belajar yang asyik."
              </p>
              <p className="text-sm text-orange-600 mt-1">- Kaka, Kakak Digital Kesayangan</p>
            </div>
          </div>
        </Card>
      </div>

      <CulturalFooter />
    </div>
  );
}