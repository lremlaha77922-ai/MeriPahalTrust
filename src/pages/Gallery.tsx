import { useState, useEffect } from 'react';
import { Image as ImageIcon, Video, Camera, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  media_type: 'photo' | 'video';
  media_url: string;
  thumbnail_url: string;
  category: string;
  created_at: string;
}

const Gallery = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'photo' | 'video'>('all');
  const [category, setCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    fetchGalleryItems();
  }, [filter, category]);

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('gallery')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('media_type', filter);
      }

      if (category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast.error('गैलरी लोड करने में त्रुटि: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: 'सभी' },
    { value: 'general', label: 'सामान्य' },
    { value: 'events', label: 'कार्यक्रम' },
    { value: 'activities', label: 'गतिविधियां' },
    { value: 'team', label: 'टीम' },
    { value: 'beneficiaries', label: 'लाभार्थी' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-trust-blue to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-4">
            <Camera className="h-12 w-12 mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold">फोटो गैलरी और वीडियो</h1>
          </div>
          <p className="text-xl text-center text-gray-100 max-w-3xl mx-auto">
            हमारे कार्यों और गतिविधियों की झलकियां
          </p>
        </div>
      </section>

      {/* Filters */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Media Type Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === 'all'
                    ? 'bg-trust-blue text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                सभी
              </button>
              <button
                onClick={() => setFilter('photo')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center ${
                  filter === 'photo'
                    ? 'bg-trust-blue text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                फोटो
              </button>
              <button
                onClick={() => setFilter('video')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center ${
                  filter === 'video'
                    ? 'bg-trust-blue text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Video className="h-4 w-4 mr-2" />
                वीडियो
              </button>
            </div>

            {/* Category Filter */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-blue mx-auto"></div>
            <p className="text-gray-600 mt-4">लोड हो रहा है...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">कोई आइटम नहीं मिला</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-transform hover:scale-105"
                onClick={() => setSelectedItem(item)}
              >
                <div className="relative aspect-square bg-gray-200">
                  {item.media_type === 'photo' ? (
                    <img
                      src={item.thumbnail_url || item.media_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <Video className="h-16 w-16 text-white" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                    {item.media_type === 'photo' ? 'फोटो' : 'वीडियो'}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for viewing full image/video */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-xl font-bold"
            >
              ✕ बंद करें
            </button>
            {selectedItem.media_type === 'photo' ? (
              <img
                src={selectedItem.media_url}
                alt={selectedItem.title}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
            ) : (
              <video
                src={selectedItem.media_url}
                controls
                className="w-full h-auto max-h-[80vh] rounded-lg"
              />
            )}
            <div className="mt-4 text-white">
              <h2 className="text-2xl font-bold mb-2">{selectedItem.title}</h2>
              {selectedItem.description && (
                <p className="text-gray-300">{selectedItem.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
