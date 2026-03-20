import { useState, useEffect } from 'react';
import { Upload, Trash2, Image as ImageIcon, Video, Plus } from 'lucide-react';
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
  is_featured: boolean;
  display_order: number;
  created_at: string;
}

const AdminGalleryManagement = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    media_type: 'photo' as 'photo' | 'video',
    category: 'general',
    is_featured: false,
    display_order: 0,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast.error('गैलरी लोड करने में त्रुटि: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        toast.error('केवल फोटो या वीडियो फाइल अपलोड करें');
        return;
      }

      // Set media type based on file
      setFormData(prev => ({
        ...prev,
        media_type: isImage ? 'photo' : 'video'
      }));
      
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('फाइल चुनें');
      return;
    }

    try {
      setUploading(true);

      // Upload file to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `gallery/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('swastha-documents')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('swastha-documents')
        .getPublicUrl(filePath);

      // Insert into database
      const { error: insertError } = await supabase
        .from('gallery')
        .insert({
          ...formData,
          media_url: publicUrl,
          thumbnail_url: publicUrl,
          uploaded_by: 'Admin'
        });

      if (insertError) throw insertError;

      toast.success('गैलरी में जोड़ा गया');
      setShowAddForm(false);
      setFormData({
        title: '',
        description: '',
        media_type: 'photo',
        category: 'general',
        is_featured: false,
        display_order: 0,
      });
      setSelectedFile(null);
      fetchGalleryItems();
    } catch (error: any) {
      toast.error('अपलोड में त्रुटि: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, mediaUrl: string) => {
    if (!confirm('क्या आप वाकई इसे हटाना चाहते हैं?')) return;

    try {
      // Delete from database
      const { error: deleteError } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Delete from storage (optional, handle errors gracefully)
      const path = mediaUrl.split('/gallery/')[1];
      if (path) {
        await supabase.storage
          .from('swastha-documents')
          .remove([`gallery/${path}`]);
      }

      toast.success('हटा दिया गया');
      fetchGalleryItems();
    } catch (error: any) {
      toast.error('हटाने में त्रुटि: ' + error.message);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">गैलरी प्रबंधन</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center bg-trust-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          नया जोड़ें
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-6 rounded-lg">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                शीर्षक *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                श्रेणी
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue"
              >
                <option value="general">सामान्य</option>
                <option value="events">कार्यक्रम</option>
                <option value="activities">गतिविधियां</option>
                <option value="team">टीम</option>
                <option value="beneficiaries">लाभार्थी</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                विवरण
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                फाइल चुनें *
              </label>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-1">
                  चयनित: {selectedFile.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                प्रदर्शन क्रम
              </label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="h-4 w-4 text-trust-blue border-gray-300 rounded"
              />
              <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                फीचर्ड आइटम
              </label>
            </div>
          </div>

          <div className="mt-4 flex space-x-3">
            <button
              type="submit"
              disabled={uploading}
              className="bg-trust-blue text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? 'अपलोड हो रहा है...' : 'सेव करें'}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
            >
              रद्द करें
            </button>
          </div>
        </form>
      )}

      {/* Gallery Items List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-blue mx-auto"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4">
              <div className="relative aspect-video bg-gray-200 rounded mb-3">
                {item.media_type === 'photo' ? (
                  <img
                    src={item.thumbnail_url}
                    alt={item.title}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                {item.is_featured && (
                  <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                    Featured
                  </span>
                )}
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {item.media_type === 'photo' ? (
                    <ImageIcon className="inline h-3 w-3 mr-1" />
                  ) : (
                    <Video className="inline h-3 w-3 mr-1" />
                  )}
                  {item.category}
                </span>
                <button
                  onClick={() => handleDelete(item.id, item.media_url)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p>कोई आइटम नहीं है। नया जोड़ें।</p>
        </div>
      )}
    </div>
  );
};

export default AdminGalleryManagement;
