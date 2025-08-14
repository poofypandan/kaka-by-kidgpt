import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useChildMode } from '@/components/ChildModeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Gamepad2, Music, Palette, Globe, Play, Star, Heart } from 'lucide-react';

export default function Activities() {
  const [searchParams] = useSearchParams();
  const { currentChild, isChildMode } = useChildMode();
  const navigate = useNavigate();
  const defaultTab = searchParams.get('tab') || 'stories';

  useEffect(() => {
    if (!isChildMode || !currentChild) {
      navigate('/child-selection');
    }
  }, [isChildMode, currentChild, navigate]);

  const stories = [
    {
      id: 1,
      title: "Malin Kundang",
      description: "Cerita tentang anak durhaka dari Sumatera Barat",
      duration: "8 menit",
      difficulty: "Mudah",
      region: "Sumatera Barat",
      image: "🌊"
    },
    {
      id: 2,
      title: "Sangkuriang",
      description: "Legenda Gunung Tangkuban Perahu dari Jawa Barat",
      duration: "10 menit",
      difficulty: "Sedang",
      region: "Jawa Barat",
      image: "🏔️"
    },
    {
      id: 3,
      title: "Timun Mas",
      description: "Gadis kecil yang melawan raksasa jahat",
      duration: "6 menit",
      difficulty: "Mudah",
      region: "Jawa Tengah",
      image: "🥒"
    },
    {
      id: 4,
      title: "Legenda Danau Toba",
      description: "Asal mula danau terbesar di Indonesia",
      duration: "12 menit",
      difficulty: "Sedang",
      region: "Sumatera Utara",
      image: "🐟"
    }
  ];

  const games = [
    {
      id: 1,
      title: "Tebak Nama Pulau",
      description: "Kenali pulau-pulau di Indonesia",
      type: "Kuis",
      level: "Pemula",
      icon: "🏝️"
    },
    {
      id: 2,
      title: "Congklak Digital",
      description: "Permainan tradisional Indonesia",
      type: "Strategi",
      level: "Menengah",
      icon: "🎯"
    },
    {
      id: 3,
      title: "Puzzle Batik",
      description: "Susun pola batik Indonesia",
      type: "Puzzle",
      level: "Pemula",
      icon: "🧩"
    },
    {
      id: 4,
      title: "Petualangan Wayang",
      description: "Belajar tokoh wayang dengan seru",
      type: "Petualangan",
      level: "Menengah",
      icon: "🎭"
    }
  ];

  const songs = [
    {
      id: 1,
      title: "Burung Kakak Tua",
      description: "Lagu anak klasik Indonesia",
      duration: "2:30",
      type: "Tradisional",
      icon: "🦜"
    },
    {
      id: 2,
      title: "Gundul-Gundul Pacul",
      description: "Lagu daerah Jawa Tengah",
      duration: "1:45",
      type: "Daerah",
      icon: "🎵"
    },
    {
      id: 3,
      title: "Rasa Sayange",
      description: "Lagu dari Maluku yang terkenal",
      duration: "3:00",
      type: "Daerah",
      icon: "❤️"
    },
    {
      id: 4,
      title: "Lir Ilir",
      description: "Lagu tradisional karya Sunan Kalijaga",
      duration: "2:15",
      type: "Spiritual",
      icon: "🌸"
    }
  ];

  const drawingActivities = [
    {
      id: 1,
      title: "Mewarnai Batik",
      description: "Warnai motif batik Indonesia",
      type: "Mewarnai",
      difficulty: "Mudah",
      icon: "🎨"
    },
    {
      id: 2,
      title: "Gambar Rumah Adat",
      description: "Belajar menggambar rumah tradisional",
      type: "Menggambar",
      difficulty: "Sedang",
      icon: "🏠"
    },
    {
      id: 3,
      title: "Kreasi Wayang",
      description: "Buat wayang kertas sendiri",
      type: "Kerajinan",
      difficulty: "Sedang",
      icon: "✂️"
    },
    {
      id: 4,
      title: "Mandala Indonesia",
      description: "Buat pola mandala dengan motif Nusantara",
      type: "Pola",
      difficulty: "Sulit",
      icon: "🔄"
    }
  ];

  const geographyActivities = [
    {
      id: 1,
      title: "Peta Indonesia",
      description: "Jelajahi 34 provinsi Indonesia",
      type: "Eksplorasi",
      level: "Semua",
      icon: "🗺️"
    },
    {
      id: 2,
      title: "Ibu Kota Provinsi",
      description: "Pelajari ibu kota setiap provinsi",
      type: "Kuis",
      level: "Menengah",
      icon: "🏛️"
    },
    {
      id: 3,
      title: "Makanan Khas Daerah",
      description: "Kenali kuliner Nusantara",
      type: "Pengetahuan",
      level: "Pemula",
      icon: "🍛"
    },
    {
      id: 4,
      title: "Tarian Tradisional",
      description: "Pelajari tarian dari berbagai daerah",
      type: "Budaya",
      level: "Semua",
      icon: "💃"
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'mudah':
      case 'pemula':
        return 'bg-green-100 text-green-700';
      case 'sedang':
      case 'menengah':
        return 'bg-yellow-100 text-yellow-700';
      case 'sulit':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  if (!currentChild) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b-4 border-rainbow shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/child-home')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
            
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-800">Aktivitas Seru</h1>
              <img 
                src="/lovable-uploads/3c6d677b-f566-47d7-8a38-d8f86401741b.png" 
                alt="Kaka Logo" 
                className="h-8 w-16 object-contain"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 p-1 rounded-xl shadow-lg">
            <TabsTrigger value="stories" className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Cerita</span>
            </TabsTrigger>
            <TabsTrigger value="games" className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              <Gamepad2 className="h-4 w-4" />
              <span className="hidden sm:inline">Game</span>
            </TabsTrigger>
            <TabsTrigger value="songs" className="flex items-center gap-2 data-[state=active]:bg-pink-500 data-[state=active]:text-white">
              <Music className="h-4 w-4" />
              <span className="hidden sm:inline">Lagu</span>
            </TabsTrigger>
            <TabsTrigger value="drawing" className="flex items-center gap-2 data-[state=active]:bg-yellow-500 data-[state=active]:text-white">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Seni</span>
            </TabsTrigger>
            <TabsTrigger value="geography" className="flex items-center gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Geografi</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stories" className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">🏛️ Cerita Nusantara</h2>
              <p className="text-gray-600">Dengarkan cerita rakyat dari seluruh Indonesia</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stories.map((story) => (
                <Card key={story.id} className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-white/90">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="text-4xl mb-2">{story.image}</div>
                      <Badge variant="outline" className="bg-blue-50">
                        {story.region}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{story.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-3">{story.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {story.duration}
                        </Badge>
                        <Badge className={`text-xs ${getDifficultyColor(story.difficulty)}`}>
                          {story.difficulty}
                        </Badge>
                      </div>
                      <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                        <Play className="h-3 w-3 mr-1" />
                        Dengar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="games" className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">🎮 Permainan Edukatif</h2>
              <p className="text-gray-600">Bermain sambil belajar budaya Indonesia</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {games.map((game) => (
                <Card key={game.id} className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-white/90">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="text-4xl mb-2">{game.icon}</div>
                      <Badge variant="outline" className="bg-purple-50">
                        {game.type}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{game.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-3">{game.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge className={`text-xs ${getDifficultyColor(game.level)}`}>
                        {game.level}
                      </Badge>
                      <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
                        <Star className="h-3 w-3 mr-1" />
                        Main
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="songs" className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">🎵 Lagu Anak Indonesia</h2>
              <p className="text-gray-600">Bernyanyi bersama lagu-lagu tradisional</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {songs.map((song) => (
                <Card key={song.id} className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-white/90">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="text-4xl mb-2">{song.icon}</div>
                      <Badge variant="outline" className="bg-pink-50">
                        {song.type}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{song.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-3">{song.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {song.duration}
                      </Badge>
                      <Button size="sm" className="bg-pink-500 hover:bg-pink-600">
                        <Heart className="h-3 w-3 mr-1" />
                        Nyanyikan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="drawing" className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">🎨 Seni & Kreativitas</h2>
              <p className="text-gray-600">Berkreasi dengan seni tradisional Indonesia</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {drawingActivities.map((activity) => (
                <Card key={activity.id} className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-white/90">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="text-4xl mb-2">{activity.icon}</div>
                      <Badge variant="outline" className="bg-yellow-50">
                        {activity.type}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{activity.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-3">{activity.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge className={`text-xs ${getDifficultyColor(activity.difficulty)}`}>
                        {activity.difficulty}
                      </Badge>
                      <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600">
                        <Palette className="h-3 w-3 mr-1" />
                        Buat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="geography" className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">🗺️ Jelajahi Indonesia</h2>
              <p className="text-gray-600">Kenali keindahan dan keragaman Nusantara</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {geographyActivities.map((activity) => (
                <Card key={activity.id} className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-white/90">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="text-4xl mb-2">{activity.icon}</div>
                      <Badge variant="outline" className="bg-green-50">
                        {activity.type}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{activity.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-3">{activity.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge className={`text-xs ${getDifficultyColor(activity.level)}`}>
                        {activity.level}
                      </Badge>
                      <Button size="sm" className="bg-green-500 hover:bg-green-600">
                        <Globe className="h-3 w-3 mr-1" />
                        Jelajah
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}