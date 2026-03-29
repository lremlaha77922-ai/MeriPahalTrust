import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/contexts/AdminContext';
import { toast } from 'sonner';
import {
  ChevronRight, Star, Heart, ShoppingCart, Share2, Truck, RefreshCw,
  Shield, Check, X, ZoomIn, ChevronLeft, ChevronRight as ChevronRightIcon,
  MapPin, Calendar, Package, Facebook, Twitter, Linkedin, Copy,
  ThumbsUp, User, AlertCircle, Plus, Minus, Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  sku: string;
  stock_quantity: number;
  images: string[];
  variants: Array<{
    type: string;
    options: Array<{
      value: string;
      stock: number;
      price_adjustment?: number;
    }>;
  }>;
  specifications: Record<string, any>;
  tags: string[];
  average_rating: number;
  review_count: number;
  view_count: number;
  is_featured: boolean;
  is_bestseller: boolean;
  created_at: string;
}

interface Review {
  id: string;
  user_id: string;
  product_id: string;
  order_id: string | null;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  is_verified: boolean;
  helpful_count: number;
  created_at: string;
  user_profile?: {
    username: string;
  };
}

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAdmin();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [pincode, setPincode] = useState('');
  const [deliveryEstimate, setDeliveryEstimate] = useState<string | null>(null);
  const [checkingPincode, setCheckingPincode] = useState(false);
  
  // Review form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);

  const imageRef = useRef<HTMLImageElement>(null);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchProduct();
      trackProductView();
    }
  }, [slug]);

  useEffect(() => {
    if (product) {
      fetchReviews();
      fetchRelatedProducts();
      if (user) {
        checkUserPurchase();
        fetchUserReview();
      }
      addToRecentlyViewed();
    }
  }, [product, user]);

  const trackProductView = async () => {
    if (!slug) return;
    
    const { error } = await supabase
      .from('products')
      .update({ view_count: supabase.sql`view_count + 1` })
      .eq('slug', slug);
    
    if (error) console.error('Failed to track view:', error);
  };

  const fetchProduct = async () => {
    if (!slug) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      
      setProduct(data);
      
      // Initialize selected variants
      if (data.variants && data.variants.length > 0) {
        const initialVariants: Record<string, string> = {};
        data.variants.forEach((variant: any) => {
          if (variant.options && variant.options.length > 0) {
            initialVariants[variant.type] = variant.options[0].value;
          }
        });
        setSelectedVariants(initialVariants);
      }
    } catch (error: any) {
      console.error('Fetch product error:', error);
      toast.error('Product not found');
      navigate('/shop');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!product) return;
    
    const { data } = await supabase
      .from('product_reviews')
      .select(`
        *,
        user_profile:user_profiles(username)
      `)
      .eq('product_id', product.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) setReviews(data);
  };

  const fetchRelatedProducts = async () => {
    if (!product) return;
    
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('category_id', product.category_id)
      .neq('id', product.id)
      .limit(8);

    if (data) setRelatedProducts(data);
  };

  const checkUserPurchase = async () => {
    if (!user || !product) return;
    
    const { data } = await supabase
      .from('order_items')
      .select('id')
      .eq('product_id', product.id)
      .eq('order_id', supabase.sql`(SELECT id FROM orders WHERE user_id = ${user.id})`)
      .limit(1);

    setHasPurchased(!!data && data.length > 0);
  };

  const fetchUserReview = async () => {
    if (!user || !product) return;
    
    const { data } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .single();

    if (data) setUserReview(data);
  };

  const addToRecentlyViewed = () => {
    if (!product) return;
    
    const recentKey = 'recentlyViewed';
    const recent = JSON.parse(localStorage.getItem(recentKey) || '[]');
    const filtered = recent.filter((id: string) => id !== product.id);
    filtered.unshift(product.id);
    localStorage.setItem(recentKey, JSON.stringify(filtered.slice(0, 10)));
  };

  const calculateFinalPrice = () => {
    if (!product) return 0;
    
    let finalPrice = product.price;
    
    // Apply variant price adjustments
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((variant: any) => {
        const selectedValue = selectedVariants[variant.type];
        const option = variant.options.find((opt: any) => opt.value === selectedValue);
        if (option && option.price_adjustment) {
          finalPrice += option.price_adjustment;
        }
      });
    }
    
    return finalPrice;
  };

  const getCurrentStock = () => {
    if (!product) return 0;
    
    // If no variants, return base stock
    if (!product.variants || product.variants.length === 0) {
      return product.stock_quantity;
    }
    
    // Check stock for selected variant
    let stock = product.stock_quantity;
    product.variants.forEach((variant: any) => {
      const selectedValue = selectedVariants[variant.type];
      const option = variant.options.find((opt: any) => opt.value === selectedValue);
      if (option && typeof option.stock === 'number') {
        stock = Math.min(stock, option.stock);
      }
    });
    
    return stock;
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    const maxStock = getCurrentStock();
    
    if (newQuantity < 1) {
      toast.error('Minimum quantity is 1');
      return;
    }
    
    if (newQuantity > maxStock) {
      toast.error(`Only ${maxStock} items available`);
      return;
    }
    
    setQuantity(newQuantity);
  };

  const addToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/admin');
      return;
    }

    if (getCurrentStock() === 0) {
      toast.error('Product is out of stock');
      return;
    }

    try {
      const variant = Object.keys(selectedVariants).length > 0 ? selectedVariants : null;
      
      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: product!.id,
          quantity,
          variant,
        });

      if (error) {
        if (error.code === '23505') {
          const { error: updateError } = await supabase
            .from('cart_items')
            .update({ 
              quantity: supabase.sql`quantity + ${quantity}`,
              variant 
            })
            .eq('user_id', user.id)
            .eq('product_id', product!.id);
          
          if (!updateError) {
            toast.success('Cart updated');
          }
        } else {
          throw error;
        }
      } else {
        toast.success('Added to cart');
      }
    } catch (error: any) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add to cart');
    }
  };

  const buyNow = async () => {
    await addToCart();
    navigate('/cart');
  };

  const addToWishlist = async () => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      navigate('/admin');
      return;
    }

    const { error } = await supabase
      .from('wishlist')
      .insert({ user_id: user.id, product_id: product!.id });

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

  const checkPincode = async () => {
    if (pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    setCheckingPincode(true);
    
    // Simulate delivery check (in production, integrate with shipping API)
    setTimeout(() => {
      const days = Math.floor(Math.random() * 5) + 3; // 3-7 days
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + days);
      
      setDeliveryEstimate(deliveryDate.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }));
      setCheckingPincode(false);
      toast.success(`Delivery available to ${pincode}`);
    }, 1000);
  };

  const submitReview = async () => {
    if (!user) {
      toast.error('Please login to write a review');
      return;
    }

    if (!reviewComment.trim()) {
      toast.error('Please write a review');
      return;
    }

    try {
      setSubmittingReview(true);
      const { error } = await supabase
        .from('product_reviews')
        .insert({
          user_id: user.id,
          product_id: product!.id,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
          is_verified: hasPurchased,
        });

      if (error) throw error;

      toast.success('Review submitted successfully!');
      setReviewDialogOpen(false);
      setReviewTitle('');
      setReviewComment('');
      setReviewRating(5);
      fetchReviews();
      fetchUserReview();
      fetchProduct(); // Refresh to update ratings
    } catch (error: any) {
      console.error('Submit review error:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const shareProduct = (platform: string) => {
    const url = window.location.href;
    const text = `Check out ${product?.name} on Desi Didi Mart!`;
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
        setShareDialogOpen(false);
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      setShareDialogOpen(false);
    }
  };

  const handleImageZoom = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-trust-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const discount = product.mrp > product.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const currentStock = getCurrentStock();
  const finalPrice = calculateFinalPrice();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-trust-blue">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/shop" className="hover:text-trust-blue">Shop</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 font-semibold line-clamp-1">{product.name}</span>
          </div>
        </div>
      </section>

      {/* Product Details */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div 
              className="relative bg-white rounded-lg overflow-hidden shadow-lg group"
              onMouseMove={handleImageZoom}
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
            >
              <img
                ref={imageRef}
                src={product.images[currentImageIndex] || 'https://via.placeholder.com/600'}
                alt={product.name}
                className="w-full h-[500px] object-contain cursor-zoom-in"
                style={
                  isZooming
                    ? {
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                        transform: 'scale(2)',
                      }
                    : undefined
                }
              />
              
              <button
                onClick={() => setLightboxOpen(true)}
                className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Maximize2 className="h-5 w-5 text-gray-700" />
              </button>

              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : product.images.length - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev < product.images.length - 1 ? prev + 1 : 0)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </>
              )}

              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-lg shadow-lg">
                  {discount}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === index
                        ? 'border-trust-blue shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Brand */}
            <div>
              {product.brand && (
                <p className="text-gray-600 mb-2">
                  Brand: <span className="font-semibold text-trust-blue">{product.brand}</span>
                </p>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              {product.short_description && (
                <p className="text-gray-600">{product.short_description}</p>
              )}
            </div>

            {/* Rating */}
            {product.average_rating > 0 && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center bg-green-600 text-white px-3 py-1 rounded font-semibold">
                  {product.average_rating.toFixed(1)}
                  <Star className="h-4 w-4 ml-1 fill-current" />
                </div>
                <span className="text-gray-600">
                  {product.review_count.toLocaleString()} {product.review_count === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            )}

            {/* Price */}
            <div className="border-t border-b py-4">
              <div className="flex items-baseline space-x-3 mb-2">
                <span className="text-4xl font-bold text-gray-900">
                  ₹{finalPrice.toLocaleString()}
                </span>
                {product.mrp > finalPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ₹{product.mrp.toLocaleString()}
                    </span>
                    <span className="text-xl text-green-600 font-semibold">
                      {discount}% off
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600">Inclusive of all taxes</p>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4">
                {product.variants.map((variant: any) => (
                  <div key={variant.type}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {variant.type}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {variant.options.map((option: any) => {
                        const isSelected = selectedVariants[variant.type] === option.value;
                        const isOutOfStock = option.stock === 0;
                        
                        return (
                          <button
                            key={option.value}
                            onClick={() => !isOutOfStock && setSelectedVariants(prev => ({ ...prev, [variant.type]: option.value }))}
                            disabled={isOutOfStock}
                            className={`px-4 py-2 rounded-lg border-2 font-semibold transition-all ${
                              isSelected
                                ? 'border-trust-blue bg-trust-blue text-white'
                                : isOutOfStock
                                ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'border-gray-300 hover:border-trust-blue'
                            }`}
                          >
                            {option.value}
                            {isOutOfStock && <X className="inline h-4 w-4 ml-1" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stock Status */}
            <div className={`flex items-center space-x-2 ${
              currentStock === 0 ? 'text-red-600' : currentStock < 10 ? 'text-orange-600' : 'text-green-600'
            }`}>
              {currentStock === 0 ? (
                <>
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-semibold">Out of Stock</span>
                </>
              ) : currentStock < 10 ? (
                <>
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-semibold">Only {currentStock} left in stock!</span>
                </>
              ) : (
                <>
                  <Check className="h-5 w-5" />
                  <span className="font-semibold">In Stock</span>
                </>
              )}
            </div>

            {/* Quantity Selector */}
            {currentStock > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <span className="px-6 py-3 font-semibold text-lg min-w-[4rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= currentStock}
                      className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">
                    Max: {currentStock}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={addToCart}
                  disabled={currentStock === 0}
                  size="lg"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  onClick={buyNow}
                  disabled={currentStock === 0}
                  size="lg"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Buy Now
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={addToWishlist}
                  variant="outline"
                  size="lg"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Add to Wishlist
                </Button>
                <Button
                  onClick={() => setShareDialogOpen(true)}
                  variant="outline"
                  size="lg"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Delivery Check */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Truck className="h-5 w-5 text-trust-blue" />
                <h3 className="font-semibold text-gray-900">Delivery Options</h3>
              </div>
              
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="flex-1"
                />
                <Button
                  onClick={checkPincode}
                  disabled={checkingPincode || pincode.length !== 6}
                >
                  {checkingPincode ? 'Checking...' : 'Check'}
                </Button>
              </div>
              
              {deliveryEstimate && (
                <div className="mt-3 flex items-center space-x-2 text-green-600">
                  <Check className="h-5 w-5" />
                  <span className="font-semibold">
                    Estimated delivery by {deliveryEstimate}
                  </span>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <Truck className="h-5 w-5 text-trust-blue flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Free Delivery</p>
                  <p className="text-xs text-gray-600">On orders above ₹500</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <RefreshCw className="h-5 w-5 text-trust-blue flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">7 Days Return</p>
                  <p className="text-xs text-gray-600">Easy return policy</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-trust-blue flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">100% Authentic</p>
                  <p className="text-xs text-gray-600">Original products</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Package className="h-5 w-5 text-trust-blue flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Secure Packaging</p>
                  <p className="text-xs text-gray-600">Safe delivery</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Description */}
          <div className="border-b p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Description</h2>
            <div className="prose max-w-none text-gray-700">
              {product.description || product.short_description}
            </div>
          </div>

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="border-b p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Specifications</h2>
              <table className="w-full">
                <tbody className="divide-y">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <tr key={key}>
                      <td className="py-3 text-gray-600 font-semibold w-1/3">{key}</td>
                      <td className="py-3 text-gray-900">{String(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Return Policy */}
          <div className="border-b p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Return & Exchange Policy</h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p>7 days easy return and exchange policy</p>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p>Product must be unused and in original packaging</p>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p>Free return pickup available</p>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p>Refund will be processed within 5-7 business days</p>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
              {user && !userReview && (
                <Button onClick={() => setReviewDialogOpen(true)}>
                  Write a Review
                </Button>
              )}
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <Star className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 mb-4">No reviews yet. Be the first to review!</p>
                {user && !userReview && (
                  <Button onClick={() => setReviewDialogOpen(true)}>
                    Write a Review
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b pb-6 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {review.user_profile?.username || 'Anonymous'}
                          </p>
                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            {review.is_verified && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                Verified Purchase
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {review.title && (
                      <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                    )}
                    
                    <p className="text-gray-700 mb-3">{review.comment}</p>

                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mb-3">
                        {review.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`Review ${idx + 1}`}
                            className="w-20 h-20 object-cover rounded"
                          />
                        ))}
                      </div>
                    )}

                    <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-trust-blue">
                      <ThumbsUp className="h-4 w-4" />
                      <span>Helpful ({review.helpful_count})</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/product/${relatedProduct.slug}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all"
                >
                  <img
                    src={relatedProduct.images?.[0] || 'https://via.placeholder.com/200'}
                    alt={relatedProduct.name}
                    className="w-full h-40 object-cover rounded-t-lg"
                  />
                  <div className="p-3">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-trust-blue font-bold">
                      ₹{relatedProduct.price.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] p-0">
          <div className="relative">
            <img
              src={product.images[currentImageIndex] || 'https://via.placeholder.com/800'}
              alt={product.name}
              className="w-full h-auto max-h-[85vh] object-contain"
            />
            
            {product.images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : product.images.length - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex(prev => prev < product.images.length - 1 ? prev + 1 : 0)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"
                >
                  <ChevronRightIcon className="h-6 w-6" />
                </button>
              </>
            )}
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full">
              {currentImageIndex + 1} / {product.images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share this product</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button
              onClick={() => shareProduct('facebook')}
              variant="outline"
              className="flex items-center justify-center space-x-2"
            >
              <Facebook className="h-5 w-5 text-blue-600" />
              <span>Facebook</span>
            </Button>
            <Button
              onClick={() => shareProduct('twitter')}
              variant="outline"
              className="flex items-center justify-center space-x-2"
            >
              <Twitter className="h-5 w-5 text-blue-400" />
              <span>Twitter</span>
            </Button>
            <Button
              onClick={() => shareProduct('linkedin')}
              variant="outline"
              className="flex items-center justify-center space-x-2"
            >
              <Linkedin className="h-5 w-5 text-blue-700" />
              <span>LinkedIn</span>
            </Button>
            <Button
              onClick={() => shareProduct('copy')}
              variant="outline"
              className="flex items-center justify-center space-x-2"
            >
              <Copy className="h-5 w-5 text-gray-600" />
              <span>Copy Link</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setReviewRating(rating)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        rating <= reviewRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Title (Optional)</label>
              <Input
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="Summary of your review"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Review</label>
              <Textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={5}
              />
            </div>

            {hasPurchased && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800 flex items-center">
                  <Check className="h-4 w-4 mr-2" />
                  Your review will be marked as "Verified Purchase"
                </p>
              </div>
            )}

            <Button
              onClick={submitReview}
              disabled={submittingReview || !reviewComment.trim()}
              className="w-full"
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductDetail;
