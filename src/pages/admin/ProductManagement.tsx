import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Plus, Search, Edit2, Trash2, Eye, EyeOff, Star, Package,
  Tag, BarChart3, Image, Save, X, ChevronDown, ChevronUp,
  Loader2, ArrowLeft, RefreshCw, Toggle, Percent, Link as LinkIcon,
  Check, AlertCircle, Filter, SlidersHorizontal, Archive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface VariantOption {
  value: string;
  stock: number;
  price_adjustment: number;
}

interface Variant {
  type: string;
  options: VariantOption[];
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  mrp: number;
  discount_percent: number;
  category_id: string | null;
  brand: string;
  sku: string;
  stock_quantity: number;
  images: string[];
  variants: Variant[];
  specifications: Record<string, string>;
  tags: string[];
  average_rating: number;
  review_count: number;
  view_count: number;
  is_featured: boolean;
  is_bestseller: boolean;
  is_active: boolean;
  created_at: string;
  categories?: { name: string };
}

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  short_description: '',
  price: '',
  mrp: '',
  discount_percent: '',
  category_id: '',
  brand: '',
  sku: '',
  stock_quantity: '',
  images: [''],
  variants: [] as Variant[],
  specifications: [{ key: '', value: '' }],
  tags: '',
  is_featured: false,
  is_bestseller: false,
  is_active: true,
};

const CATEGORY_COLORS: Record<string, string> = {
  'health-wellness': 'bg-green-100 text-green-800',
  'kitchen-home':    'bg-orange-100 text-orange-800',
  'beauty-skincare': 'bg-pink-100 text-pink-800',
  'food-nutrition':  'bg-yellow-100 text-yellow-800',
  'baby-kids':       'bg-blue-100 text-blue-800',
};

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const ProductManagement = () => {
  const { user } = useAdmin();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Sheet / dialog
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Form state
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!user) { navigate('/admin'); return; }
    fetchProducts();
    fetchCategories();
  }, [user]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, slug)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch products error:', error);
      toast.error('Failed to load products');
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('display_order');
    if (data) setCategories(data);
  };

  // ── FILTERING ──
  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];

  const filteredProducts = products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q);
    const matchCat = filterCategory === 'all' || p.category_id === filterCategory;
    const matchBrand = filterBrand === 'all' || p.brand === filterBrand;
    const matchStatus =
      filterStatus === 'all' ? true :
      filterStatus === 'active' ? p.is_active :
      filterStatus === 'inactive' ? !p.is_active :
      filterStatus === 'featured' ? p.is_featured :
      filterStatus === 'bestseller' ? p.is_bestseller :
      filterStatus === 'out_of_stock' ? p.stock_quantity === 0 : true;
    return matchSearch && matchCat && matchBrand && matchStatus;
  });

  // ── FORM HELPERS ──
  const openAddSheet = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setSheetOpen(true);
  };

  const openEditSheet = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      short_description: product.short_description || '',
      price: String(product.price),
      mrp: String(product.mrp || ''),
      discount_percent: String(product.discount_percent || ''),
      category_id: product.category_id || '',
      brand: product.brand || '',
      sku: product.sku || '',
      stock_quantity: String(product.stock_quantity || 0),
      images: product.images?.length > 0 ? product.images : [''],
      variants: product.variants || [],
      specifications: Object.entries(product.specifications || {}).map(([key, value]) => ({ key, value: String(value) })),
      tags: (product.tags || []).join(', '),
      is_featured: product.is_featured,
      is_bestseller: product.is_bestseller,
      is_active: product.is_active,
    });
    setSheetOpen(true);
  };

  const handleNameChange = (name: string) => {
    setForm(f => ({
      ...f,
      name,
      slug: editingProduct ? f.slug : slugify(name),
    }));
  };

  const handlePriceChange = (price: string, mrp?: string) => {
    const p = parseFloat(price) || 0;
    const m = parseFloat(mrp ?? form.mrp) || 0;
    const discount = m > p && m > 0 ? Math.round(((m - p) / m) * 100) : 0;
    setForm(f => ({ ...f, price, discount_percent: String(discount) }));
  };

  // ── IMAGE MANAGEMENT ──
  const addImageUrl = () => setForm(f => ({ ...f, images: [...f.images, ''] }));
  const removeImageUrl = (idx: number) =>
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  const updateImageUrl = (idx: number, url: string) =>
    setForm(f => {
      const images = [...f.images];
      images[idx] = url;
      return { ...f, images };
    });

  // ── VARIANT MANAGEMENT ──
  const addVariant = () =>
    setForm(f => ({
      ...f,
      variants: [...f.variants, { type: '', options: [{ value: '', stock: 0, price_adjustment: 0 }] }],
    }));

  const removeVariant = (vi: number) =>
    setForm(f => ({ ...f, variants: f.variants.filter((_, i) => i !== vi) }));

  const updateVariantType = (vi: number, type: string) =>
    setForm(f => {
      const variants = [...f.variants];
      variants[vi] = { ...variants[vi], type };
      return { ...f, variants };
    });

  const addVariantOption = (vi: number) =>
    setForm(f => {
      const variants = [...f.variants];
      variants[vi] = {
        ...variants[vi],
        options: [...variants[vi].options, { value: '', stock: 0, price_adjustment: 0 }],
      };
      return { ...f, variants };
    });

  const removeVariantOption = (vi: number, oi: number) =>
    setForm(f => {
      const variants = [...f.variants];
      variants[vi] = {
        ...variants[vi],
        options: variants[vi].options.filter((_, i) => i !== oi),
      };
      return { ...f, variants };
    });

  const updateVariantOption = (vi: number, oi: number, field: keyof VariantOption, val: string) =>
    setForm(f => {
      const variants = [...f.variants];
      const options = [...variants[vi].options];
      options[oi] = {
        ...options[oi],
        [field]: field === 'value' ? val : Number(val),
      };
      variants[vi] = { ...variants[vi], options };
      return { ...f, variants };
    });

  // ── SPECIFICATIONS ──
  const addSpec = () =>
    setForm(f => ({ ...f, specifications: [...f.specifications, { key: '', value: '' }] }));

  const removeSpec = (i: number) =>
    setForm(f => ({ ...f, specifications: f.specifications.filter((_, j) => j !== i) }));

  const updateSpec = (i: number, field: 'key' | 'value', val: string) =>
    setForm(f => {
      const specs = [...f.specifications];
      specs[i] = { ...specs[i], [field]: val };
      return { ...f, specifications: specs };
    });

  // ── SAVE ──
  const saveProduct = async () => {
    if (!form.name.trim() || !form.price) {
      toast.error('Name and price are required');
      return;
    }
    if (!form.slug.trim()) {
      toast.error('Slug is required');
      return;
    }

    setSaving(true);

    const specsObj: Record<string, string> = {};
    form.specifications.forEach(({ key, value }) => {
      if (key.trim()) specsObj[key.trim()] = value.trim();
    });

    const cleanImages = form.images.filter(u => u.trim());
    const cleanTags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    const cleanVariants = form.variants.filter(v => v.type.trim());

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      short_description: form.short_description.trim(),
      price: parseFloat(form.price) || 0,
      mrp: parseFloat(form.mrp) || parseFloat(form.price) || 0,
      discount_percent: parseInt(form.discount_percent) || 0,
      category_id: form.category_id || null,
      brand: form.brand.trim(),
      sku: form.sku.trim(),
      stock_quantity: parseInt(form.stock_quantity) || 0,
      images: cleanImages,
      variants: cleanVariants,
      specifications: specsObj,
      tags: cleanTags,
      is_featured: form.is_featured,
      is_bestseller: form.is_bestseller,
      is_active: form.is_active,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (editingProduct) {
      ({ error } = await supabase.from('products').update(payload).eq('id', editingProduct.id));
    } else {
      ({ error } = await supabase.from('products').insert({ ...payload, created_at: new Date().toISOString() }));
    }

    if (error) {
      console.error('Save product error:', error);
      if (error.code === '23505') {
        toast.error('A product with this slug or SKU already exists');
      } else {
        toast.error('Failed to save product');
      }
    } else {
      toast.success(editingProduct ? 'Product updated' : 'Product added');
      setSheetOpen(false);
      fetchProducts();
    }
    setSaving(false);
  };

  // ── DELETE ──
  const confirmDelete = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const deleteProduct = async () => {
    if (!productToDelete) return;
    setDeleting(productToDelete.id);
    const { error } = await supabase.from('products').update({ is_active: false }).eq('id', productToDelete.id);
    if (error) {
      toast.error('Failed to deactivate product');
    } else {
      toast.success('Product deactivated');
      fetchProducts();
    }
    setDeleting(null);
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  // ── QUICK TOGGLE ──
  const toggleField = async (product: Product, field: 'is_featured' | 'is_bestseller' | 'is_active') => {
    const { error } = await supabase
      .from('products')
      .update({ [field]: !product[field] })
      .eq('id', product.id);
    if (error) {
      toast.error('Update failed');
    } else {
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, [field]: !p[field] } : p));
    }
  };

  const statsCards = [
    { label: 'Total Products', value: products.length, color: 'text-blue-600', bg: 'bg-blue-50', icon: Package },
    { label: 'Active', value: products.filter(p => p.is_active).length, color: 'text-green-600', bg: 'bg-green-50', icon: Check },
    { label: 'Featured', value: products.filter(p => p.is_featured).length, color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Star },
    { label: 'Out of Stock', value: products.filter(p => p.stock_quantity === 0).length, color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Dashboard
              </Button>
              <div className="h-5 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Product Management</h1>
                <p className="text-xs text-gray-500">{filteredProducts.length} of {products.length} products</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchProducts}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button onClick={openAddSheet} className="bg-trust-blue hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {statsCards.map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4 flex items-center space-x-3`}>
              <s.icon className={`h-8 w-8 ${s.color}`} />
              <div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-600">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border p-4 mb-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, brand, SKU..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterBrand} onValueChange={setFilterBrand}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="All Brands" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {brands.map(b => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="bestseller">Bestseller</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>

              {(search || filterCategory !== 'all' || filterBrand !== 'all' || filterStatus !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setSearch(''); setFilterCategory('all'); setFilterBrand('all'); setFilterStatus('all'); }}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-white rounded-xl border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-trust-blue" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-bold text-gray-700 mb-2">No Products Found</h3>
              <p className="text-gray-500 mb-4">
                {search || filterCategory !== 'all' ? 'Try adjusting your filters' : 'Add your first product'}
              </p>
              <Button onClick={openAddSheet}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    {['Product', 'Category / Brand', 'Price', 'Stock', 'Rating', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map(product => {
                    const catSlug = categories.find(c => c.id === product.category_id)?.slug || '';
                    const catColor = CATEGORY_COLORS[catSlug] || 'bg-gray-100 text-gray-700';

                    return (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        {/* Product */}
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                              {product.images?.[0] ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-gray-900 line-clamp-1">{product.name}</p>
                              <p className="text-xs text-gray-400 font-mono mt-0.5">{product.sku || '—'}</p>
                              <div className="flex gap-1 mt-1">
                                {product.is_featured && (
                                  <span className="bg-yellow-100 text-yellow-700 text-xs px-1.5 py-0.5 rounded font-semibold">Featured</span>
                                )}
                                {product.is_bestseller && (
                                  <span className="bg-orange-100 text-orange-700 text-xs px-1.5 py-0.5 rounded font-semibold">Bestseller</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category / Brand */}
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            {product.categories?.name && (
                              <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${catColor}`}>
                                {product.categories.name}
                              </span>
                            )}
                            {product.brand && (
                              <p className="text-xs text-gray-500">{product.brand}</p>
                            )}
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-bold text-sm text-gray-900">₹{product.price.toLocaleString()}</p>
                            {product.mrp > product.price && (
                              <p className="text-xs text-gray-400 line-through">₹{product.mrp.toLocaleString()}</p>
                            )}
                            {product.discount_percent > 0 && (
                              <span className="text-xs text-green-600 font-semibold">
                                {product.discount_percent}% off
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Stock */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-full ${
                            product.stock_quantity === 0
                              ? 'bg-red-100 text-red-700'
                              : product.stock_quantity < 10
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {product.stock_quantity === 0 ? 'Out of Stock' : `${product.stock_quantity} units`}
                          </span>
                        </td>

                        {/* Rating */}
                        <td className="px-4 py-3">
                          {product.average_rating > 0 ? (
                            <div className="flex items-center space-x-1">
                              <div className="flex items-center bg-green-600 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                                {product.average_rating.toFixed(1)}
                                <Star className="h-2.5 w-2.5 ml-0.5 fill-current" />
                              </div>
                              <span className="text-xs text-gray-400">({product.review_count})</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">No reviews</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleField(product, 'is_active')}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              product.is_active ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                            title={product.is_active ? 'Active — click to deactivate' : 'Inactive — click to activate'}
                          >
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow ${
                              product.is_active ? 'translate-x-4' : 'translate-x-0.5'
                            }`} />
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => toggleField(product, 'is_featured')}
                              title={product.is_featured ? 'Remove Featured' : 'Mark Featured'}
                              className={`p-1.5 rounded-lg transition-colors ${
                                product.is_featured
                                  ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                  : 'text-gray-400 hover:bg-gray-100'
                              }`}
                            >
                              <Star className={`h-4 w-4 ${product.is_featured ? 'fill-current' : ''}`} />
                            </button>
                            <button
                              onClick={() => openEditSheet(product)}
                              className="p-1.5 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-trust-blue transition-colors"
                              title="Edit product"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => confirmDelete(product)}
                              disabled={deleting === product.id}
                              className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                              title="Deactivate product"
                            >
                              {deleting === product.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Archive className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ─────────── ADD / EDIT SHEET ─────────── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto" side="right">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="text-lg font-bold">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-6 py-5">

            {/* ── BASIC INFO ── */}
            <FormSection title="Basic Information" icon={Package}>
              <div className="grid grid-cols-1 gap-4">
                <Field label="Product Name *">
                  <Input
                    value={form.name}
                    onChange={e => handleNameChange(e.target.value)}
                    placeholder="e.g. Organic Turmeric Powder"
                  />
                </Field>

                <Field label="URL Slug *">
                  <Input
                    value={form.slug}
                    onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                    placeholder="organic-turmeric-powder"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">Used in product URL — must be unique</p>
                </Field>

                <Field label="Short Description">
                  <Input
                    value={form.short_description}
                    onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))}
                    placeholder="One-line summary shown in listings"
                  />
                </Field>

                <Field label="Full Description">
                  <Textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Detailed product description..."
                    rows={4}
                  />
                </Field>
              </div>
            </FormSection>

            {/* ── CATEGORY & BRAND ── */}
            <FormSection title="Category & Brand" icon={Tag}>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Category">
                  <Select
                    value={form.category_id}
                    onValueChange={v => setForm(f => ({ ...f, category_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Category</SelectItem>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Brand">
                  <Input
                    value={form.brand}
                    onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                    placeholder="e.g. Patanjali"
                  />
                </Field>

                <Field label="SKU">
                  <Input
                    value={form.sku}
                    onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                    placeholder="PAT-TUR-001"
                    className="font-mono text-sm"
                  />
                </Field>

                <Field label="Tags (comma separated)">
                  <Input
                    value={form.tags}
                    onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                    placeholder="organic, health, turmeric"
                  />
                </Field>
              </div>
            </FormSection>

            {/* ── PRICING ── */}
            <FormSection title="Pricing" icon={Percent}>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Selling Price (₹) *">
                  <Input
                    type="number"
                    value={form.price}
                    onChange={e => handlePriceChange(e.target.value)}
                    placeholder="199"
                    min="0"
                  />
                </Field>

                <Field label="MRP (₹)">
                  <Input
                    type="number"
                    value={form.mrp}
                    onChange={e => {
                      const mrp = e.target.value;
                      const p = parseFloat(form.price) || 0;
                      const m = parseFloat(mrp) || 0;
                      const discount = m > p && m > 0 ? Math.round(((m - p) / m) * 100) : 0;
                      setForm(f => ({ ...f, mrp, discount_percent: String(discount) }));
                    }}
                    placeholder="299"
                    min="0"
                  />
                </Field>

                <Field label="Discount %">
                  <div className="relative">
                    <Input
                      type="number"
                      value={form.discount_percent}
                      onChange={e => setForm(f => ({ ...f, discount_percent: e.target.value }))}
                      placeholder="33"
                      min="0"
                      max="100"
                      className="pr-8"
                    />
                    <Percent className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  </div>
                  {form.price && form.mrp && parseFloat(form.mrp) > parseFloat(form.price) && (
                    <p className="text-xs text-green-600 mt-1 font-semibold">
                      Save ₹{(parseFloat(form.mrp) - parseFloat(form.price)).toFixed(0)}
                    </p>
                  )}
                </Field>

                <Field label="Stock Quantity">
                  <Input
                    type="number"
                    value={form.stock_quantity}
                    onChange={e => setForm(f => ({ ...f, stock_quantity: e.target.value }))}
                    placeholder="100"
                    min="0"
                  />
                </Field>
              </div>
            </FormSection>

            {/* ── IMAGES ── */}
            <FormSection title="Product Images" icon={Image}>
              <p className="text-xs text-gray-500 mb-3">Add image URLs (Unsplash, CDN, etc.). First image is the main display image.</p>
              <div className="space-y-3">
                {form.images.map((url, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                      {url.trim() ? (
                        <img src={url} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = ''; }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <Input
                      value={url}
                      onChange={e => updateImageUrl(idx, e.target.value)}
                      placeholder={`Image URL ${idx + 1}`}
                      className="flex-1 text-sm font-mono"
                    />
                    {form.images.length > 1 && (
                      <button
                        onClick={() => removeImageUrl(idx)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                {form.images.length < 8 && (
                  <Button type="button" variant="outline" size="sm" onClick={addImageUrl}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Image URL
                  </Button>
                )}
              </div>
            </FormSection>

            {/* ── VARIANTS ── */}
            <FormSection title="Variants (Size / Color / Weight)" icon={SlidersHorizontal}>
              <p className="text-xs text-gray-500 mb-3">Define product variants like size options, colors, or weight variants — each with its own stock and price adjustment.</p>

              {form.variants.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed">
                  <p className="text-sm text-gray-500 mb-3">No variants added</p>
                  <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variant Group
                  </Button>
                </div>
              ) : (
                <div className="space-y-5">
                  {form.variants.map((variant, vi) => (
                    <div key={vi} className="bg-gray-50 rounded-xl border p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <Input
                          value={variant.type}
                          onChange={e => updateVariantType(vi, e.target.value)}
                          placeholder="Variant type (e.g. Size, Color, Weight)"
                          className="flex-1 font-semibold bg-white"
                        />
                        <button
                          onClick={() => removeVariant(vi)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-500 px-1">
                          <span className="col-span-5">Option Value</span>
                          <span className="col-span-3">Stock</span>
                          <span className="col-span-3">Price +/-</span>
                          <span className="col-span-1"></span>
                        </div>
                        {variant.options.map((option, oi) => (
                          <div key={oi} className="grid grid-cols-12 gap-2 items-center">
                            <Input
                              value={option.value}
                              onChange={e => updateVariantOption(vi, oi, 'value', e.target.value)}
                              placeholder="e.g. 200g"
                              className="col-span-5 h-8 text-sm"
                            />
                            <Input
                              type="number"
                              value={option.stock}
                              onChange={e => updateVariantOption(vi, oi, 'stock', e.target.value)}
                              placeholder="0"
                              min="0"
                              className="col-span-3 h-8 text-sm"
                            />
                            <div className="col-span-3 relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                              <Input
                                type="number"
                                value={option.price_adjustment}
                                onChange={e => updateVariantOption(vi, oi, 'price_adjustment', e.target.value)}
                                placeholder="0"
                                className="pl-5 h-8 text-sm"
                              />
                            </div>
                            {variant.options.length > 1 && (
                              <button
                                onClick={() => removeVariantOption(vi, oi)}
                                className="col-span-1 p-1 text-red-400 hover:text-red-600"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => addVariantOption(vi)}
                          className="text-xs h-7 mt-1"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Option
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Variant Group
                  </Button>
                </div>
              )}
            </FormSection>

            {/* ── SPECIFICATIONS ── */}
            <FormSection title="Specifications" icon={BarChart3}>
              <div className="space-y-2">
                {form.specifications.map((spec, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input
                      value={spec.key}
                      onChange={e => updateSpec(i, 'key', e.target.value)}
                      placeholder="Property (e.g. Weight)"
                      className="flex-1 h-8 text-sm"
                    />
                    <Input
                      value={spec.value}
                      onChange={e => updateSpec(i, 'value', e.target.value)}
                      placeholder="Value (e.g. 200g)"
                      className="flex-1 h-8 text-sm"
                    />
                    <button
                      onClick={() => removeSpec(i)}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <Button type="button" variant="ghost" size="sm" onClick={addSpec} className="text-xs h-7">
                  <Plus className="h-3 w-3 mr-1" />
                  Add Specification
                </Button>
              </div>
            </FormSection>

            {/* ── TOGGLES ── */}
            <FormSection title="Display Settings" icon={Star}>
              <div className="space-y-3">
                {[
                  { key: 'is_active', label: 'Active (visible in shop)', desc: 'Customers can browse and buy this product' },
                  { key: 'is_featured', label: 'Featured Product', desc: 'Highlighted in featured sections and home page' },
                  { key: 'is_bestseller', label: 'Bestseller Badge', desc: 'Shows bestseller badge on product card' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{label}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                    <button
                      onClick={() => setForm(f => ({ ...f, [key]: !f[key as keyof typeof f] }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        form[key as keyof typeof form] ? 'bg-trust-blue' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
                        form[key as keyof typeof form] ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </FormSection>

          </div>

          <SheetFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveProduct} disabled={saving} className="bg-trust-blue hover:bg-blue-700">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {editingProduct ? 'Update Product' : 'Add Product'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Product</DialogTitle>
            <DialogDescription>
              This will hide <strong>{productToDelete?.name}</strong> from the shop. You can reactivate it anytime from the product list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={deleteProduct} disabled={!!deleting}>
              {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Archive className="h-4 w-4 mr-2" />}
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ── Helper components ──────────────────────────

const FormSection = ({
  title, icon: Icon, children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) => (
  <div className="bg-gray-50 rounded-xl border p-5">
    <div className="flex items-center space-x-2 mb-4">
      <Icon className="h-4 w-4 text-trust-blue" />
      <h3 className="font-bold text-sm text-gray-900">{title}</h3>
    </div>
    {children}
  </div>
);

const Field = ({
  label, children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">{label}</Label>
    {children}
  </div>
);

export default ProductManagement;
