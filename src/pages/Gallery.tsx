import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Play, ChevronLeft, ChevronRight, Filter, Star, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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

  const categories = [
    { value: 'all', label: 'All Media', icon: ImageIcon },
    { value: 'events', label: 'Events', icon: Star },
    { value: 'activities', label: 'Activities', icon: ImageIcon },
    { value: 'team', label: 'Team', icon: ImageIcon },
    { value: 'beneficiaries', label: 'Beneficiaries', icon: ImageIcon },
    { value: 'general', label: 'General', icon: ImageIcon },
  ];

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
    document.body.style.overflow = 'auto';
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, currentIndex, filteredItems.length]);

  const currentItem = filteredItems[currentIndex];

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

      {/* Category Filter */}
      <section className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
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
        </div>
      </section>

      {/* Gallery Grid - Masonry Layout */}
      <section className="container mx-auto px-4 py-12">
        {filteredItems.length === 0 && !loading ? (
          <div className="text-center py-20">
            <ImageIcon className="h-24 w-24 mx-auto mb-4 text-gray-300" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Media Found</h3>
            <p className="text-gray-500">Try selecting a different category</p>
          </div>
        ) : (
          <>
            {/* Masonry Grid using CSS Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-[280px]">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`group relative overflow-hidden rounded-lg shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer ${
                    item.is_featured ? 'ring-4 ring-yellow-400 sm:col-span-2 sm:row-span-2' : ''
                  } ${
                    index % 7 === 0 ? 'lg:row-span-2' : ''
                  }`}
                  onClick={() => openLightbox(index)}
                >
                  {/* Image/Video Thumbnail */}
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

                  {/* Overlay */}
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

            {/* Loading Spinner for Infinite Scroll */}
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

      {/* Lightbox Modal */}
      {lightboxOpen && currentItem && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6 text-white" />
          </button>

          {/* Previous Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-4 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>

          {/* Next Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-4 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>

          {/* Content */}
          <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-8">
            {/* Media Container */}
            <div className="max-w-6xl w-full max-h-[80vh] flex items-center justify-center mb-4">
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
                  autoPlay
                  className="max-w-full max-h-[80vh] rounded-lg"
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>

            {/* Info */}
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
