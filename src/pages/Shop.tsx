import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/contexts/AdminContext';
import { useSearchParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Search, SlidersHorizontal, X, ChevronDown, Grid3x3, List, Star,
  Heart, ShoppingCart, Eye, Filter, TrendingUp, DollarSign, Calendar,
  Sparkles, Package, ArrowUpDown, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  mrp: number;
  discount_percent: number;
  category_id: string;
  brand: string;
  images: string[];
  stock_quantity: number;
  average_rating: number;
  review_count: number;
  view_count: number;
  is_featured: boolean;
  is_bestseller: boolean;
  specifications: Record<string, any>;
  tags: string[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'popularity' | 'price-asc' | 'price-desc' | 'rating' | 'newest';

const ITEMS_PER_PAGE = 20;

const Shop = () => {
  const { user } = useAdmin();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [searchSuggestions, setSSearchSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('category') ? [searchParams.get('category')!] : []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [minRating, setMinRating] = useState<number>(0);
  const [minDiscount, setMinDiscount] = useState<number>(0);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(searchParams.get('featured') === 'true');
  const [showBestsellersOnly, setShowBestsellersOnly] = useState(searchParams.get('bestseller') === 'true');

  // UI states
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Available brands (dynamically fetched)
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchProducts(true);
  }, []);

  useEffect(() => {
    // Reset and refetch when filters change
    setProducts([]);
    setPage(0);
    setHasMore(true);
    fetchProducts(true);
  }, [selectedCategories, selectedBrands, priceRange, minRating, minDiscount, showFeaturedOnly, showBestsellersOnly, sortBy, searchQuery]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchProducts(false);
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

  // Search suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        fetchSearchSuggestions();
      } else {
        setSSearchSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('name');
    
    if (data) setCategories(data);
  };

  const fetchBrands = async () => {
    const { data } = await supabase
      .from('products')
      .select('brand')
      .eq('is_active', true)
      .not('brand', 'is', null);
    
    if (data) {
      const brands = [...new Set(data.map(p => p.brand).filter(Boolean))].sort();
      setAvailableBrands(brands as string[]);
    }
  };

  const fetchSearchSuggestions = async () => {
    const { data } = await supabase
      .from('products')
      .select('id, name, slug, price, images')
      .eq('is_active', true)
      .ilike('name', `%${searchQuery}%`)
      .limit(5);
    
    if (data) setSSearchSuggestions(data);
  };

  const fetchProducts = async (reset: boolean) => {
    try {
      setLoading(true);
      const currentPage = reset ? 0 : page;
      const start = currentPage * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      // Apply filters
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      if (selectedCategories.length > 0) {
        query = query.in('category_id', selectedCategories);
      }

      if (selectedBrands.length > 0) {
        query = query.in('brand', selectedBrands);
      }

      query = query.gte('price', priceRange[0]).lte('price', priceRange[1]);

      if (minRating > 0) {
        query = query.gte('average_rating', minRating);
      }

      if (minDiscount > 0) {
        query = query.gte('discount_percent', minDiscount);
      }

      if (showFeaturedOnly) {
        query = query.eq('is_featured', true);
      }

      if (showBestsellersOnly) {
        query = query.eq('is_bestseller', true);
      }

      // Apply sorting
      switch (sortBy) {
        case 'price-asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price-desc':
          query = query.order('price', { ascending: false });
          break;
        case 'rating':
          query = query.order('average_rating', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'popularity':
        default:
          query = query.order('view_count', { ascending: false });
          break;
      }

      const { data, error } = await query.range(start, end);

      if (error) throw error;

      if (reset) {
        setProducts(data || []);
      } else {
        setProducts(prev => [...prev, ...(data || [])]);
      }

      setHasMore((data?.length || 0) === ITEMS_PER_PAGE);
      setPage(currentPage + 1);
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!user) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    const { error } = await supabase
      .from('wishlist')
      .insert({ user_id: user.id, product_id: productId });

    if (error) {
      if (error.code === '23505') {
        toast.info('Already in wishlist');
      } else {
        toast.error('Failed to add to wishlist');
      }
    } else {
      toast.success('Added to wishlist');
    }
  };

  const addToCart = async (productId: string) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    const { error } = await supabase
      .from('cart_items')
      .insert({ user_id: user.id, product_id: productId, quantity: 1 });

    if (error) {
      if (error.code === '23505') {
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: supabase.sql`quantity + 1` })
          .eq('user_id', user.id)
          .eq('product_id', productId);
        
        if (!updateError) {
          toast.success('Cart updated');
        }
      } else {
        toast.error('Failed to add to cart');
      }
    } else {
      toast.success('Added to cart');
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([0, 10000]);
    setMinRating(0);
    setMinDiscount(0);
    setShowFeaturedOnly(false);
    setShowBestsellersOnly(false);
    setSearchQuery('');
    setSearchParams({});
  };

  const FilterSection = () => (
    <div className="space-y-6">
      {/* Search within results */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3 flex items-center">
          <Search className="h-4 w-4 mr-2" />
          Search
        </h3>
        <Input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3 flex items-center">
          <Package className="h-4 w-4 mr-2" />
          Categories
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
              <Checkbox
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => toggleCategory(category.id)}
              />
              <span className="text-sm text-gray-700">{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3 flex items-center">
          <DollarSign className="h-4 w-4 mr-2" />
          Price Range
        </h3>
        <div className="space-y-3">
          <Slider
            min={0}
            max={10000}
            step={100}
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Brands */}
      {availableBrands.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-900 mb-3 flex items-center">
            <Sparkles className="h-4 w-4 mr-2" />
            Brand
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableBrands.map((brand) => (
              <label key={brand} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                <Checkbox
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={() => toggleBrand(brand)}
                />
                <span className="text-sm text-gray-700">{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Rating */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3 flex items-center">
          <Star className="h-4 w-4 mr-2" />
          Minimum Rating
        </h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
              <Checkbox
                checked={minRating === rating}
                onCheckedChange={() => setMinRating(minRating === rating ? 0 : rating)}
              />
              <div className="flex items-center">
                {[...Array(rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-2 text-sm text-gray-700">& Up</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Discount */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3 flex items-center">
          <TrendingUp className="h-4 w-4 mr-2" />
          Minimum Discount
        </h3>
        <div className="space-y-2">
          {[50, 40, 30, 20, 10].map((discount) => (
            <label key={discount} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
              <Checkbox
                checked={minDiscount === discount}
                onCheckedChange={() => setMinDiscount(minDiscount === discount ? 0 : discount)}
              />
              <span className="text-sm text-gray-700">{discount}% or more</span>
            </label>
          ))}
        </div>
      </div>

      {/* Special Filters */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3">Special</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
            <Checkbox
              checked={showFeaturedOnly}
              onCheckedChange={(checked) => setShowFeaturedOnly(checked as boolean)}
            />
            <span className="text-sm text-gray-700">Featured Products</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
            <Checkbox
              checked={showBestsellersOnly}
              onCheckedChange={(checked) => setShowBestsellersOnly(checked as boolean)}
            />
            <span className="text-sm text-gray-700">Bestsellers</span>
          </label>
        </div>
      </div>

      {/* Clear Filters */}
      <Button
        onClick={clearAllFilters}
        variant="outline"
        className="w-full"
      >
        <X className="h-4 w-4 mr-2" />
        Clear All Filters
      </Button>
    </div>
  );

  const ProductCard = ({ product }: { product: Product }) => {
    const discount = product.mrp > product.price 
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;
    
    const primaryImage = product.images && product.images.length > 0 
      ? product.images[0] 
      : 'https://via.placeholder.com/300x300?text=No+Image';

    if (viewMode === 'list') {
      return (
        <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all p-4 flex gap-4">
          <div className="relative w-48 h-48 flex-shrink-0">
            <Link to={`/product/${product.slug}`}>
              <img
                src={primaryImage}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </Link>
            {discount > 0 && (
              <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                {discount}% OFF
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col">
            <Link to={`/product/${product.slug}`}>
              <h3 className="font-semibold text-lg text-gray-900 mb-2 hover:text-trust-blue">
                {product.name}
              </h3>
            </Link>
            
            {product.short_description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {product.short_description}
              </p>
            )}

            {product.average_rating > 0 && (
              <div className="flex items-center mb-3">
                <div className="flex items-center bg-green-600 text-white px-2 py-0.5 rounded text-sm font-semibold mr-2">
                  {product.average_rating.toFixed(1)}
                  <Star className="h-3 w-3 ml-1 fill-current" />
                </div>
                <span className="text-sm text-gray-500">
                  ({product.review_count.toLocaleString()})
                </span>
              </div>
            )}

            <div className="flex items-baseline space-x-2 mb-3">
              <span className="text-2xl font-bold text-gray-900">
                ₹{product.price.toLocaleString()}
              </span>
              {product.mrp > product.price && (
                <>
                  <span className="text-sm text-gray-500 line-through">
                    ₹{product.mrp.toLocaleString()}
                  </span>
                  <span className="text-sm text-green-600 font-semibold">
                    {discount}% off
                  </span>
                </>
              )}
            </div>

            <div className="flex gap-2 mt-auto">
              <Button
                onClick={() => addToCart(product.id)}
                disabled={product.stock_quantity === 0}
                className="flex-1 bg-trust-blue hover:bg-blue-700"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              <Button
                onClick={() => addToWishlist(product.id)}
                variant="outline"
                size="icon"
              >
                <Heart className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setQuickViewProduct(product)}
                variant="outline"
                size="icon"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-sm hover:shadow-xl transition-all group">
        <div className="relative overflow-hidden">
          <Link to={`/product/${product.slug}`}>
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </Link>
          
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              {discount}% OFF
            </div>
          )}

          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => addToWishlist(product.id)}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-pink-50"
            >
              <Heart className="h-5 w-5 text-pink-600" />
            </button>
            <button
              onClick={() => setQuickViewProduct(product)}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-trust-blue hover:text-white"
            >
              <Eye className="h-5 w-5" />
            </button>
          </div>

          {product.stock_quantity === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <Link to={`/product/${product.slug}`}>
            <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 hover:text-trust-blue">
              {product.name}
            </h3>
          </Link>

          {product.average_rating > 0 && (
            <div className="flex items-center mb-3">
              <div className="flex items-center bg-green-600 text-white px-2 py-0.5 rounded text-sm font-semibold mr-2">
                {product.average_rating.toFixed(1)}
                <Star className="h-3 w-3 ml-1 fill-current" />
              </div>
              <span className="text-sm text-gray-500">
                ({product.review_count.toLocaleString()})
              </span>
            </div>
          )}

          <div className="flex items-baseline space-x-2 mb-3">
            <span className="text-2xl font-bold text-gray-900">
              ₹{product.price.toLocaleString()}
            </span>
            {product.mrp > product.price && (
              <>
                <span className="text-sm text-gray-500 line-through">
                  ₹{product.mrp.toLocaleString()}
                </span>
              </>
            )}
          </div>

          <Button
            onClick={() => addToCart(product.id)}
            disabled={product.stock_quantity === 0}
            className="w-full bg-trust-blue hover:bg-blue-700"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shop All Products</h1>
              <p className="text-gray-600 mt-1">
                Showing {products.length} {products.length === 1 ? 'product' : 'products'}
              </p>
            </div>

            {/* Search with suggestions */}
            <div className="relative flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="pl-10 pr-4"
                />
              </div>
              
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-y-auto">
                  {searchSuggestions.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.slug}`}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b last:border-0"
                    >
                      <img
                        src={product.images?.[0] || 'https://via.placeholder.com/60'}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                        <p className="text-trust-blue font-bold text-sm">₹{product.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <section className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Filter Button */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Refine your product search
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSection />
                </div>
              </SheetContent>
            </Sheet>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-gray-600" />
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Popularity
                    </div>
                  </SelectItem>
                  <SelectItem value="price-asc">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Price: Low to High
                    </div>
                  </SelectItem>
                  <SelectItem value="price-desc">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Price: High to Low
                    </div>
                  </SelectItem>
                  <SelectItem value="rating">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-2" />
                      Customer Rating
                    </div>
                  </SelectItem>
                  <SelectItem value="newest">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Newest First
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
              >
                <Grid3x3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                <Filter className="h-5 w-5 text-gray-600" />
              </div>
              <FilterSection />
            </div>
          </aside>

          {/* Products Grid/List */}
          <div className="flex-1">
            {products.length === 0 && !loading ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Package className="h-24 w-24 mx-auto mb-4 text-gray-300" />
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No Products Found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search query</p>
                <Button onClick={clearAllFilters}>
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <>
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : 'space-y-4'
                }>
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Infinite Scroll Loader */}
                <div ref={observerTarget} className="py-8 text-center">
                  {loading && (
                    <div className="inline-block">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-blue"></div>
                      <p className="text-gray-600 mt-2">Loading more products...</p>
                    </div>
                  )}
                  {!hasMore && products.length > 0 && (
                    <p className="text-gray-500">You've reached the end of the catalog</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      <Dialog open={!!quickViewProduct} onOpenChange={() => setQuickViewProduct(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {quickViewProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{quickViewProduct.name}</DialogTitle>
              </DialogHeader>
              
              <div className="grid md:grid-cols-2 gap-6 mt-4">
                <div>
                  <img
                    src={quickViewProduct.images?.[0] || 'https://via.placeholder.com/400'}
                    alt={quickViewProduct.name}
                    className="w-full rounded-lg"
                  />
                </div>

                <div className="space-y-4">
                  {quickViewProduct.average_rating > 0 && (
                    <div className="flex items-center">
                      <div className="flex items-center bg-green-600 text-white px-3 py-1 rounded font-semibold mr-2">
                        {quickViewProduct.average_rating.toFixed(1)}
                        <Star className="h-4 w-4 ml-1 fill-current" />
                      </div>
                      <span className="text-sm text-gray-500">
                        ({quickViewProduct.review_count.toLocaleString()} reviews)
                      </span>
                    </div>
                  )}

                  <div className="flex items-baseline space-x-3">
                    <span className="text-3xl font-bold text-gray-900">
                      ₹{quickViewProduct.price.toLocaleString()}
                    </span>
                    {quickViewProduct.mrp > quickViewProduct.price && (
                      <>
                        <span className="text-lg text-gray-500 line-through">
                          ₹{quickViewProduct.mrp.toLocaleString()}
                        </span>
                        <span className="text-lg text-green-600 font-semibold">
                          {Math.round(((quickViewProduct.mrp - quickViewProduct.price) / quickViewProduct.mrp) * 100)}% off
                        </span>
                      </>
                    )}
                  </div>

                  {quickViewProduct.short_description && (
                    <p className="text-gray-600">{quickViewProduct.short_description}</p>
                  )}

                  {quickViewProduct.brand && (
                    <div>
                      <span className="text-sm text-gray-500">Brand: </span>
                      <span className="font-semibold">{quickViewProduct.brand}</span>
                    </div>
                  )}

                  <div className={`inline-block px-3 py-1 rounded ${
                    quickViewProduct.stock_quantity > 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {quickViewProduct.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                  </div>

                  <div className="space-y-3 pt-4">
                    <Button
                      onClick={() => addToCart(quickViewProduct.id)}
                      disabled={quickViewProduct.stock_quantity === 0}
                      className="w-full bg-trust-blue hover:bg-blue-700 text-white font-semibold py-3"
                      size="lg"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
                    </Button>
                    
                    <div className="flex gap-3">
                      <Button
                        onClick={() => addToWishlist(quickViewProduct.id)}
                        variant="outline"
                        className="flex-1"
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Add to Wishlist
                      </Button>
                      
                      <Link to={`/product/${quickViewProduct.slug}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          View Full Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Shop;
