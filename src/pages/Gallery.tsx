import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  X, Play, ChevronLeft, ChevronRight, Filter, Star, Image as ImageIcon,
  Pause, Maximize, Minimize, Settings, Zap, Clock, Snail, Volume2, VolumeX, Mic, MicOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  media_type: 'photo' | 'video';
  media_url: string;
  thumbnail_url: string;
  category: string;
  is_featured: boolean;
  display_order: number;
  uploaded_by: string;
  created_at: string;
}

const ITEMS_PER_PAGE = 12;

type TransitionEffect = 'fade' | 'slide' | 'zoom' | 'flip';
type SlideSpeed = 'slow' | 'normal' | 'fast';
type NarrationLanguage = 'en-US' | 'hi-IN';

const SPEED_VALUES: Record<SlideSpeed, number> = {
  slow: 5000,
  normal: 3000,
  fast: 1500,
};

const LANGUAGE_NAMES: Record<NarrationLanguage, string> = {
  'en-US': 'English',
  'hi-IN': 'हिंदी (Hindi)',
};

const Gallery = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const observerTarget = useRef<HTMLDivElement>(null);
  
  // Slideshow controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [slideSpeed, setSlideSpeed] = useState<SlideSpeed>('normal');
  const [transitionEffect, setTransitionEffect] = useState<TransitionEffect>('fade');
  const [showSettings, setShowSettings] = useState(false);
  const slideshowInterval = useRef<NodeJS.Timeout | null>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  
  // Voice narration controls
  const [narrationEnabled, setNarrationEnabled] = useState(false);
  const [narrationVolume, setNarrationVolume] = useState(0.8);
  const [narrationLanguage, setNarrationLanguage] = useState<NarrationLanguage>('en-US');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const categories = [
    { value: 'all', label: 'All Media', icon: ImageIcon },
    { value: 'events', label: 'Events', icon: Star },
    { value: 'activities', label: 'Activities', icon: ImageIcon },
    { value: 'team', label: 'Team', icon: ImageIcon },
    { value: 'beneficiaries', label: 'Beneficiaries', icon: ImageIcon },
    { value: 'general', label: 'General', icon: ImageIcon },
  ];

  // Check speech synthesis support
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSpeechSupported(true);
      // Load voices
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    } else {
      setSpeechSupported(false);
      console.warn('Speech synthesis not supported in this browser');
    }
    
    return () => {
      // Clean up speech on unmount
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Fetch initial items
  useEffect(() => {
    fetchGalleryItems();
  }, []);

  // Filter items when category changes
  useEffect(() => {
    filterByCategory();
  }, [items, selectedCategory]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loading, page]);

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })
        .range(0, ITEMS_PER_PAGE - 1);

      if (error) throw error;
      
      setItems(data || []);
      setHasMore((data?.length || 0) === ITEMS_PER_PAGE);
      setPage(1);
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    try {
      setLoading(true);
      const start = page * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })
        .range(start, end);

      if (error) throw error;

      if (data && data.length > 0) {
        setItems((prev) => [...prev, ...data]);
        setPage((prev) => prev + 1);
        setHasMore(data.length === ITEMS_PER_PAGE);
      } else {
        setHasMore(false);
      }
    } catch (error: any) {
      console.error('Load more error:', error);
      toast.error('Failed to load more items');
    } finally {
      setLoading(false);
    }
  };

  const filterByCategory = () => {
    if (selectedCategory === 'all') {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter((item) => item.category === selectedCategory));
    }
  };

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    stopSlideshow();
    stopNarration();
    document.body.style.overflow = 'auto';
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
  };

  // Slideshow functionality
  const startSlideshow = () => {
    setIsPlaying(true);
    if (!lightboxOpen && filteredItems.length > 0) {
      openLightbox(0);
    }
  };

  const stopSlideshow = () => {
    setIsPlaying(false);
    if (slideshowInterval.current) {
      clearInterval(slideshowInterval.current);
      slideshowInterval.current = null;
    }
  };

  // Voice narration functions
  const speakText = (text: string, lang: NarrationLanguage) => {
    if (!speechSupported || !text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    
    // Find voice for selected language
    const voice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.lang = lang;
    utterance.volume = narrationVolume;
    utterance.rate = slideSpeed === 'slow' ? 0.8 : slideSpeed === 'fast' ? 1.2 : 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopNarration = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleNarration = () => {
    const newState = !narrationEnabled;
    setNarrationEnabled(newState);
    
    if (!newState) {
      stopNarration();
    } else if (currentItem) {
      narrateCurrentItem();
    }
  };

  const narrateCurrentItem = () => {
    if (!narrationEnabled || !currentItem) return;

    const text = `${currentItem.title}. ${currentItem.description || ''}`;
    speakText(text, narrationLanguage);
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await fullscreenRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error('Failed to enter fullscreen:', err);
        toast.error('Fullscreen not supported');
      }
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Narrate when item changes
  useEffect(() => {
    if (lightboxOpen && narrationEnabled && currentItem) {
      // Small delay to allow transition
      const timer = setTimeout(() => {
        narrateCurrentItem();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentIndex, lightboxOpen, narrationEnabled, narrationLanguage]);

  // Auto-advance slideshow
  useEffect(() => {
    if (isPlaying && lightboxOpen) {
      slideshowInterval.current = setInterval(() => {
        goToNext();
      }, SPEED_VALUES[slideSpeed]);
    } else if (slideshowInterval.current) {
      clearInterval(slideshowInterval.current);
      slideshowInterval.current = null;
    }

    return () => {
      if (slideshowInterval.current) {
        clearInterval(slideshowInterval.current);
      }
    };
  }, [isPlaying, lightboxOpen, slideSpeed, currentIndex]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') {
        closeLightbox();
        stopSlideshow();
      }
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, currentIndex, filteredItems.length, isPlaying]);

  const currentItem = filteredItems[currentIndex];

  // Get transition class based on effect
  const getTransitionClass = () => {
    switch (transitionEffect) {
      case 'fade': return 'animate-fadeIn';
      case 'slide': return 'animate-slideIn';
      case 'zoom': return 'animate-zoomIn';
      case 'flip': return 'animate-flipIn';
      default: return 'animate-fadeIn';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-trust-blue to-blue-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Photo & Video Gallery</h1>
          <p className="text-xl text-gray-100 max-w-2xl mx-auto">
            Explore our work through stunning photos and videos showcasing our journey, events, and achievements
          </p>
        </div>
      </section>

      {/* Category Filter & Slideshow Button */}
      <section className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide flex-1">
              <Filter className="h-5 w-5 text-gray-600 flex-shrink-0" />
              {categories.map((category) => (
                <Button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  variant={selectedCategory === category.value ? 'default' : 'outline'}
                  size="sm"
                  className={`flex-shrink-0 ${
                    selectedCategory === category.value
                      ? 'bg-trust-blue hover:bg-blue-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <category.icon className="h-4 w-4 mr-2" />
                  {category.label}
                </Button>
              ))}
            </div>
            
            {/* Slideshow Button */}
            {filteredItems.length > 0 && (
              <Button
                onClick={startSlideshow}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white flex-shrink-0"
              >
                <Play className="h-4 w-4 mr-2" />
                Slideshow
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="container mx-auto px-4 py-12">
        {filteredItems.length === 0 && !loading ? (
          <div className="text-center py-20">
            <ImageIcon className="h-24 w-24 mx-auto mb-4 text-gray-300" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Media Found</h3>
            <p className="text-gray-500">Try selecting a different category</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-[280px]">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`group relative overflow-hidden rounded-lg shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer ${
                    item.is_featured ? 'ring-4 ring-yellow-400 sm:col-span-2 sm:row-span-2' : ''
                  } ${index % 7 === 0 ? 'lg:row-span-2' : ''}`}
                  onClick={() => openLightbox(index)}
                >
                  <div className="w-full h-full">
                    {item.media_type === 'photo' ? (
                      <img
                        src={item.thumbnail_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="relative w-full h-full bg-gray-900">
                        <img
                          src={item.thumbnail_url}
                          alt={item.title}
                          className="w-full h-full object-cover opacity-70 group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play className="h-8 w-8 text-trust-blue ml-1" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="font-bold text-lg mb-1 line-clamp-2">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-200 line-clamp-2">{item.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs bg-white/20 px-2 py-1 rounded capitalize">
                          {item.category}
                        </span>
                        {item.is_featured && (
                          <span className="flex items-center text-xs bg-yellow-500 text-black px-2 py-1 rounded font-bold">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div ref={observerTarget} className="py-8 text-center">
              {loading && (
                <div className="inline-block">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-blue"></div>
                  <p className="text-gray-600 mt-2">Loading more...</p>
                </div>
              )}
              {!hasMore && filteredItems.length > 0 && (
                <p className="text-gray-500">You've reached the end of the gallery</p>
              )}
            </div>
          </>
        )}
      </section>

      {/* Lightbox Modal with Slideshow */}
      {lightboxOpen && currentItem && (
        <div 
          ref={fullscreenRef}
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
        >
          {/* Top Controls */}
          <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
                aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
              >
                {isPlaying ? <Pause className="h-6 w-6 text-white" /> : <Play className="h-6 w-6 text-white ml-1" />}
              </button>

              {speechSupported && (
                <button
                  onClick={toggleNarration}
                  className={`w-12 h-12 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors ${
                    narrationEnabled 
                      ? 'bg-green-500/30 hover:bg-green-500/40' 
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                  aria-label={narrationEnabled ? 'Disable narration' : 'Enable narration'}
                >
                  {narrationEnabled ? (
                    isSpeaking ? <Mic className="h-6 w-6 text-white animate-pulse" /> : <Mic className="h-6 w-6 text-white" />
                  ) : (
                    <MicOff className="h-6 w-6 text-white" />
                  )}
                </button>
              )}

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
                aria-label="Settings"
              >
                <Settings className="h-6 w-6 text-white" />
              </button>

              {(isPlaying || narrationEnabled) && (
                <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium flex items-center space-x-3">
                  {isPlaying && (
                    <div className="flex items-center space-x-1">
                      {slideSpeed === 'slow' && <Snail className="h-4 w-4" />}
                      {slideSpeed === 'normal' && <Clock className="h-4 w-4" />}
                      {slideSpeed === 'fast' && <Zap className="h-4 w-4" />}
                      <span className="capitalize">{slideSpeed}</span>
                    </div>
                  )}
                  {isPlaying && narrationEnabled && <span className="text-white/50">•</span>}
                  {narrationEnabled && (
                    <div className="flex items-center space-x-1">
                      <Volume2 className="h-4 w-4" />
                      <span>{Math.round(narrationVolume * 100)}%</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={toggleFullscreen}
                className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? <Minimize className="h-6 w-6 text-white" /> : <Maximize className="h-6 w-6 text-white" />}
              </button>

              <button
                onClick={closeLightbox}
                className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
                aria-label="Close lightbox"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="absolute top-20 left-4 z-50 bg-black/90 backdrop-blur-md rounded-lg p-6 w-96 text-white max-h-[80vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">Slideshow Settings</h3>
              
              <div className="space-y-6">
                {/* Slideshow Settings */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-300 uppercase">Slideshow</h4>
                  
                  <div>
                    <Label className="text-sm text-gray-300 mb-2 block">Transition Speed</Label>
                    <Select value={slideSpeed} onValueChange={(value: SlideSpeed) => setSlideSpeed(value)}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700 text-white">
                        <SelectItem value="slow">Slow (5s)</SelectItem>
                        <SelectItem value="normal">Normal (3s)</SelectItem>
                        <SelectItem value="fast">Fast (1.5s)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-300 mb-2 block">Transition Effect</Label>
                    <Select value={transitionEffect} onValueChange={(value: TransitionEffect) => setTransitionEffect(value)}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700 text-white">
                        <SelectItem value="fade">Fade</SelectItem>
                        <SelectItem value="slide">Slide</SelectItem>
                        <SelectItem value="zoom">Zoom</SelectItem>
                        <SelectItem value="flip">Flip</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Voice Narration Settings */}
                {speechSupported && (
                  <div className="space-y-4 pt-4 border-t border-white/20">
                    <h4 className="text-sm font-semibold text-gray-300 uppercase flex items-center">
                      <Volume2 className="h-4 w-4 mr-2" />
                      Voice Narration
                    </h4>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-gray-300">Enable Narration</Label>
                      <button
                        onClick={toggleNarration}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          narrationEnabled ? 'bg-green-500' : 'bg-white/20'
                        }`}
                        aria-label={narrationEnabled ? 'Disable narration' : 'Enable narration'}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            narrationEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {narrationEnabled && (
                      <>
                        <div>
                          <Label className="text-sm text-gray-300 mb-3 block flex items-center justify-between">
                            <span>Volume</span>
                            <span className="text-white font-medium">{Math.round(narrationVolume * 100)}%</span>
                          </Label>
                          <div className="flex items-center space-x-3">
                            <VolumeX className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <Slider
                              value={[narrationVolume * 100]}
                              onValueChange={(value) => setNarrationVolume(value[0] / 100)}
                              max={100}
                              step={5}
                              className="flex-1"
                            />
                            <Volume2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm text-gray-300 mb-2 block">Narration Language</Label>
                          <Select value={narrationLanguage} onValueChange={(value: NarrationLanguage) => setNarrationLanguage(value)}>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-gray-700 text-white">
                              <SelectItem value="en-US">English</SelectItem>
                              <SelectItem value="hi-IN">हिंदी (Hindi)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                          <p className="text-xs text-blue-200">
                            <strong className="flex items-center mb-1">
                              <Mic className="h-3 w-3 mr-1" />
                              Accessibility Feature
                            </strong>
                            Voice narration reads item titles and descriptions aloud, making the gallery accessible to visually impaired users.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {!speechSupported && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                    <p className="text-xs text-amber-200">
                      Voice narration is not supported in your browser. Please use a modern browser like Chrome, Firefox, or Edge.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-white/20">
                <p className="text-xs text-gray-400">
                  <strong>Keyboard Shortcuts:</strong><br />
                  Space: Play/Pause Slideshow<br />
                  ← →: Navigate Items<br />
                  F: Toggle Fullscreen<br />
                  Esc: Exit Lightbox
                </p>
              </div>
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-4 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            aria-label="Previous item"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-4 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            aria-label="Next item"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>

          <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-8">
            <div 
              className={`max-w-6xl w-full max-h-[80vh] flex items-center justify-center mb-4 ${getTransitionClass()}`}
              key={currentIndex}
            >
              {currentItem.media_type === 'photo' ? (
                <img
                  src={currentItem.media_url}
                  alt={currentItem.title}
                  className="max-w-full max-h-[80vh] object-contain rounded-lg"
                />
              ) : (
                <video
                  src={currentItem.media_url}
                  controls
                  autoPlay={isPlaying}
                  className="max-w-full max-h-[80vh] rounded-lg"
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>

            <div className="max-w-3xl w-full bg-black/50 backdrop-blur-sm rounded-lg p-6 text-white">
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-2xl font-bold">{currentItem.title}</h2>
                {currentItem.is_featured && (
                  <span className="flex items-center bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                    <Star className="h-4 w-4 mr-1" />
                    Featured
                  </span>
                )}
              </div>
              {currentItem.description && (
                <p className="text-gray-300 mb-3">{currentItem.description}</p>
              )}
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span className="capitalize bg-white/10 px-3 py-1 rounded">
                  {currentItem.category}
                </span>
                <span>
                  {currentIndex + 1} / {filteredItems.length}
                </span>
              </div>

              {isPlaying && (
                <div className="mt-4">
                  <div className="w-full bg-white/20 rounded-full h-1 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all"
                      style={{
                        animation: `progress ${SPEED_VALUES[slideSpeed]}ms linear infinite`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Section */}
      <section className="bg-white py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-4xl font-bold text-trust-blue">{items.length}</p>
              <p className="text-gray-600 mt-1">Total Items</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-green-600">
                {items.filter((i) => i.media_type === 'photo').length}
              </p>
              <p className="text-gray-600 mt-1">Photos</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600">
                {items.filter((i) => i.media_type === 'video').length}
              </p>
              <p className="text-gray-600 mt-1">Videos</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-yellow-600">
                {items.filter((i) => i.is_featured).length}
              </p>
              <p className="text-gray-600 mt-1">Featured</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Gallery;
