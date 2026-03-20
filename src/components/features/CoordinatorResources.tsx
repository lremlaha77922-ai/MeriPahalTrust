import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SwasthaResource, SwasthaCoordinator } from '@/types';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  FileText, 
  Video, 
  BookOpen, 
  Award,
  Search,
  Filter,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  coordinator: SwasthaCoordinator;
}

const CoordinatorResources = ({ coordinator }: Props) => {
  const [resources, setResources] = useState<SwasthaResource[]>([]);
  const [filteredResources, setFilteredResources] = useState<SwasthaResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchResources();
  }, [coordinator]);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('swastha_resources')
        .select('*')
        .eq('is_active', true)
        .in('visibility', ['all', coordinator.coordinator_type])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
      setFilteredResources(data || []);
    } catch (error) {
      console.error('Fetch resources error:', error);
      toast.error('Resources लोड करने में त्रुटि');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...resources];

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.resource_type === typeFilter);
    }

    setFilteredResources(filtered);
  }, [searchTerm, typeFilter, resources]);

  const handleDownload = async (resource: SwasthaResource) => {
    try {
      // Increment download count
      await supabase
        .from('swastha_resources')
        .update({ download_count: resource.download_count + 1 })
        .eq('id', resource.id);

      // Open file
      window.open(resource.file_url, '_blank');
      toast.success('Resource downloaded');
      fetchResources();
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download में त्रुटि');
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-6 w-6 text-red-600" />;
      case 'guideline':
        return <BookOpen className="h-6 w-6 text-blue-600" />;
      case 'training_material':
        return <Award className="h-6 w-6 text-purple-600" />;
      default:
        return <FileText className="h-6 w-6 text-gray-600" />;
    }
  };

  const resourceTypeLabels: Record<string, string> = {
    training_material: 'Training Material',
    guideline: 'Guideline',
    policy_document: 'Policy Document',
    manual: 'Manual',
    video: 'Video',
    other: 'Other',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Resource Library</h2>
        <p className="text-purple-100">Training materials, guidelines, and important documents</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Types</option>
            <option value="training_material">Training Material</option>
            <option value="guideline">Guideline</option>
            <option value="policy_document">Policy Document</option>
            <option value="manual">Manual</option>
            <option value="video">Video</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          {filteredResources.length} resources available
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No resources found
          </div>
        ) : (
          filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white rounded-lg shadow-md hover-lift overflow-hidden border border-gray-200"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  {getResourceIcon(resource.resource_type)}
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {resourceTypeLabels[resource.resource_type]}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{resource.title}</h3>
                {resource.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{resource.description}</p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>{resource.download_count} downloads</span>
                  {resource.file_size_kb && (
                    <span>{(resource.file_size_kb / 1024).toFixed(1)} MB</span>
                  )}
                </div>
                <Button
                  onClick={() => handleDownload(resource)}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <p className="text-sm text-gray-700">
          <strong>Note:</strong> सभी training materials और guidelines को ध्यान से पढ़ें और अपने कार्य में लागू करें। 
          यदि कोई नया resource चाहिए तो admin से संपर्क करें।
        </p>
      </div>
    </div>
  );
};

export default CoordinatorResources;
