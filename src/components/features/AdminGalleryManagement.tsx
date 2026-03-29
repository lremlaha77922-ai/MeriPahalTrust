import { useState, useEffect } from 'react';
import { Upload, Trash2, Image as ImageIcon, Video, Plus, Eye, Download, Edit } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

const AdminGalleryManagement = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [filter, setFilter] = useState<'all' | 'photo' | 'video'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    media_type: 'photo' as 'photo' | 'video',
    category: 'general',
    is_featured: false,
    display_order: 0,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

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
      toast.error('Failed to load gallery: ' + error.message);
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
        toast.error('Please upload only photo or video files');
        return;
      }

      // Validate file size (max 50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        toast.error('File size must be less than 50MB');
        return;
      }

      // Set media type based on file
      setFormData(prev => ({
        ...prev,
        media_type: isImage ? 'photo' : 'video'
      }));
      
      setSelectedFile(file);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    try {
      setUploading(true);

      // Upload file to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery-media')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gallery-media')
        .getPublicUrl(filePath);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      const uploadedBy = user?.email || 'Admin';

      // Insert into database
      const { error: insertError } = await supabase
        .from('gallery')
        .insert({
          ...formData,
          media_url: publicUrl,
          thumbnail_url: publicUrl,
          uploaded_by: uploadedBy
        });

      if (insertError) throw insertError;

      toast.success('Successfully added to gallery');
      resetForm();
      fetchGalleryItems();
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
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
    setPreviewUrl('');
  };

  const handleDelete = async (id: string, mediaUrl: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      // Delete from database
      const { error: deleteError } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Delete from storage
      const urlParts = mediaUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      if (fileName) {
        await supabase.storage
          .from('gallery-media')
          .remove([fileName]);
      }

      toast.success('Successfully deleted');
      fetchGalleryItems();
      setShowPreview(false);
    } catch (error: any) {
      toast.error('Delete failed: ' + error.message);
    }
  };

  const filteredItems = items.filter(item => {
    if (filter !== 'all' && item.media_type !== filter) return false;
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Photo & Video Gallery Management</h1>
          <p className="text-gray-600 mt-1">Upload, view, and manage gallery items</p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-trust-blue hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Media
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm">Total Items</p>
          <p className="text-3xl font-bold text-trust-blue">{items.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm">Photos</p>
          <p className="text-3xl font-bold text-green-600">
            {items.filter(i => i.media_type === 'photo').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm">Videos</p>
          <p className="text-3xl font-bold text-blue-600">
            {items.filter(i => i.media_type === 'video').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm">Featured</p>
          <p className="text-3xl font-bold text-amber-600">
            {items.filter(i => i.is_featured).length}
          </p>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upload New Media</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter title"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="events">Events</SelectItem>
                    <SelectItem value="activities">Activities</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="beneficiaries">Beneficiaries</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Enter description (optional)"
                />
              </div>

              <div>
                <Label htmlFor="file">Upload File *</Label>
                <div className="mt-2">
                  <Input
                    id="file"
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    required
                  />
                  {selectedFile && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  placeholder="0"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="h-4 w-4 text-trust-blue border-gray-300 rounded"
                />
                <Label htmlFor="featured" className="mb-0">Mark as Featured</Label>
              </div>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                {formData.media_type === 'photo' ? (
                  <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded" />
                ) : (
                  <video src={previewUrl} controls className="max-h-64 mx-auto rounded" />
                )}
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                type="submit"
                disabled={uploading}
                className="bg-trust-blue hover:bg-blue-700"
              >
                {uploading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-bounce" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload & Save
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Filter by Type</Label>
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Media</SelectItem>
                <SelectItem value="photo">Photos Only</SelectItem>
                <SelectItem value="video">Videos Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Filter by Category</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="events">Events</SelectItem>
                <SelectItem value="activities">Activities</SelectItem>
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="beneficiaries">Beneficiaries</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <p className="text-sm text-gray-600">
              Showing {filteredItems.length} of {items.length} items
            </p>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-blue mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading gallery...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative aspect-video bg-gray-200">
                {item.media_type === 'photo' ? (
                  <img
                    src={item.thumbnail_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <Video className="h-16 w-16 text-white" />
                  </div>
                )}
                {item.is_featured && (
                  <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                    FEATURED
                  </span>
                )}
                <span className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {item.media_type === 'photo' ? 'Photo' : 'Video'}
                </span>
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description || 'No description'}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span className="capitalize">{item.category}</span>
                  <span>Order: {item.display_order}</span>
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedItem(item);
                      setShowPreview(true);
                    }}
                    className="flex-1"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(item.id, item.media_url)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredItems.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">No items found</p>
          <p className="text-gray-400 text-sm mt-2">Add new photos or videos to get started</p>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Media Preview</DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-4">
                {selectedItem.media_type === 'photo' ? (
                  <img
                    src={selectedItem.media_url}
                    alt={selectedItem.title}
                    className="w-full max-h-96 object-contain mx-auto"
                  />
                ) : (
                  <video
                    src={selectedItem.media_url}
                    controls
                    className="w-full max-h-96 mx-auto"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Title</p>
                  <p className="font-medium">{selectedItem.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-medium capitalize">{selectedItem.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium capitalize">{selectedItem.media_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Uploaded By</p>
                  <p className="font-medium">{selectedItem.uploaded_by}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="font-medium">{selectedItem.description || 'No description'}</p>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Close
                </Button>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => window.open(selectedItem.media_url, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(selectedItem.id, selectedItem.media_url)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminGalleryManagement;
