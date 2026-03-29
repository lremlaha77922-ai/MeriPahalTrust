import { useState, useEffect } from 'react';
import { 
  Search, ShoppingCart, Heart, User, Menu, ChevronDown, Star, 
  TrendingUp, Zap, Gift, Package, Filter, SlidersHorizontal, X,
  Phone, MapPin, Truck, Shield, ArrowRight, ChevronRight, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/contexts/AdminContext';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  price: number;
  mrp: number;
  discount_percent: number;
  images: string[];
  average_rating: number;
  review_count: number;
  is_featured: boolean;
  is_bestseller: boolean;
  stock_quantity: number;
}

const DesiDidiMart = () => {
  const { user } = useAdmin();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestsellerProducts, setBestsellerProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchFeaturedProducts();
    fetchBestsellerProducts();
    if (user) {
      fetchCartCount();
      fetchWishlistCount();
    }
  }, [user]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .is('parent_id', null)
      .order('display_order', { ascending: true })
      .limit(8);
    
    if (data) setCategories(data);
  };

  const fetchFeaturedProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .limit(8);
    
    if (data) setFeaturedProducts(data);
  };

  const fetchBestsellerProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('is_bestseller', true)
      .limit(12);
    
    if (data) setBestsellerProducts(data);
  };

  const fetchCartCount = async () => {
    if (!user) return;
    const { count } = await supabase
      .from('cart_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    
    setCartCount(count || 0);
  };

  const fetchWishlistCount = async () => {
    if (!user) return;
    const { count } = await supabase
      .from('wishlist')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    
    setWishlistCount(count || 0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
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
      fetchWishlistCount();
    }
  };

  const addToCart = async (productId: string) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    const { error } = await supabase
      .from('cart_items')
      .insert({ user_id: user.id, product_id: productId, quantity: 1 })
      .select();

    if (error) {
      if (error.code === '23505') {
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: supabase.sql`quantity + 1` })
          .eq('user_id', user.id)
          .eq('product_id', productId);
        
        if (!updateError) {
          toast.success('Cart updated');
          fetchCartCount();
        }
      } else {
        toast.error('Failed to add to cart');
      }
    } else {
      toast.success('Added to cart');
      fetchCartCount();
    }
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const discount = product.mrp > product.price 
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;
    
    const primaryImage = product.images && product.images.length > 0 
      ? product.images[0] 
      : 'https://via.placeholder.com/300x300?text=No+Image';

    return (
      <div className="bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden border border-gray-100">
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
          
          {product.is_featured && (
            <div className="absolute top-3 right-3 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </div>
          )}

          <button
            onClick={() => addToWishlist(product.id)}
            className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-pink-50"
          >
            <Heart className="h-5 w-5 text-pink-600" />
          </button>

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
          
          {product.short_description && (
            <p className="text-sm text-gray-600 line-clamp-1 mb-3">
              {product.short_description}
            </p>
          )}

          <div className="flex items-center mb-3">
            {product.average_rating > 0 && (
              <div className="flex items-center bg-green-600 text-white px-2 py-0.5 rounded text-sm font-semibold mr-2">
                {product.average_rating.toFixed(1)}
                <Star className="h-3 w-3 ml-1 fill-current" />
              </div>
            )}
            {product.review_count > 0 && (
              <span className="text-sm text-gray-500">
                ({product.review_count.toLocaleString()})
              </span>
            )}
          </div>

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

          <Button
            onClick={() => addToCart(product.id)}
            disabled={product.stock_quantity === 0}
            className="w-full bg-trust-blue hover:bg-blue-700 text-white font-semibold"
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
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link to="/desi-didi-mart" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-600 to-rose-600 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Desi Didi Mart</h1>
                <p className="text-xs text-gray-600">100% देसी • 100% शुद्ध</p>
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="Search for products, brands and more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-12 h-11 border-gray-300 focus:border-trust-blue"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 h-11 px-6 bg-trust-blue text-white rounded-r-md hover:bg-blue-700 transition-colors"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </form>

            {/* Right Menu */}
            <div className="flex items-center space-x-6">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="hidden md:flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span className="font-semibold">{user.username}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/account/profile" className="cursor-pointer">My Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/account/orders" className="cursor-pointer">My Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/account/wishlist" className="cursor-pointer">Wishlist</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/account/addresses" className="cursor-pointer">Addresses</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/admin">
                  <Button variant="ghost" className="hidden md:flex items-center space-x-2 font-semibold">
                    <User className="h-5 w-5" />
                    <span>Login</span>
                  </Button>
                </Link>
              )}

              <Link to="/account/wishlist" className="hidden md:flex items-center space-x-2 hover:text-pink-600 transition-colors relative">
                <Heart className="h-6 w-6" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
                <span className="font-semibold">Wishlist</span>
              </Link>

              <Link to="/cart" className="flex items-center space-x-2 hover:text-trust-blue transition-colors relative">
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-trust-blue text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
                <span className="font-semibold hidden md:inline">Cart</span>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Search Bar - Mobile */}
          <form onSubmit={handleSearch} className="md:hidden pb-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-10 px-4 bg-trust-blue text-white rounded-r-md"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Categories Bar */}
          <div className="hidden md:flex items-center space-x-6 py-3 border-t overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/shop?category=${category.slug}`}
                className="flex-shrink-0 font-semibold text-gray-700 hover:text-trust-blue transition-colors whitespace-nowrap"
              >
                {category.name}
              </Link>
            ))}
            <Link to="/shop" className="flex-shrink-0 font-semibold text-trust-blue flex items-center">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden" onClick={() => setShowMobileMenu(false)}>
          <div className="bg-white w-80 h-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold">Menu</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowMobileMenu(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-4 space-y-4">
              {user ? (
                <>
                  <Link to="/account/profile" className="block py-2 font-semibold" onClick={() => setShowMobileMenu(false)}>
                    My Profile
                  </Link>
                  <Link to="/account/orders" className="block py-2 font-semibold" onClick={() => setShowMobileMenu(false)}>
                    My Orders
                  </Link>
                  <Link to="/account/wishlist" className="block py-2 font-semibold" onClick={() => setShowMobileMenu(false)}>
                    Wishlist
                  </Link>
                </>
              ) : (
                <Link to="/admin" className="block py-2 font-semibold" onClick={() => setShowMobileMenu(false)}>
                  Login / Sign Up
                </Link>
              )}
              
              <div className="border-t pt-4">
                <h4 className="font-bold mb-3">Categories</h4>
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/shop?category=${category.slug}`}
                    className="block py-2 text-gray-700"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <Gift className="h-4 w-4 mr-2" />
                <span className="text-sm font-semibold">Special Offer • 30-40% OFF</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                देसी दीदी मार्ट में आपका स्वागत है
              </h1>
              <p className="text-xl mb-6 text-pink-100">
                100% शुद्ध देसी उत्पाद • बाजार से 30-40% सस्ता • महिला सशक्तिकरण की पहल
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/shop">
                  <Button size="lg" className="bg-white text-pink-600 hover:bg-pink-50 font-bold">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Shop Now
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-pink-600">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop"
                alt="Shopping"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-white py-4 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <Truck className="h-8 w-8 text-trust-blue flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Free Delivery</p>
                <p className="text-xs text-gray-600">On orders above ₹500</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">100% Authentic</p>
                <p className="text-xs text-gray-600">Pure desi products</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Gift className="h-8 w-8 text-pink-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Mega Discounts</p>
                <p className="text-xs text-gray-600">30-40% off MRP</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-8 w-8 text-orange-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">24/7 Support</p>
                <p className="text-xs text-gray-600">Always here to help</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Shop by Category</h2>
              <Link to="/shop">
                <Button variant="outline" className="hidden md:flex">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/shop?category=${category.slug}`}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all group text-center"
                >
                  <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Package className="h-10 w-10 text-pink-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-trust-blue transition-colors">
                    {category.name}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <Zap className="h-8 w-8 text-yellow-500" />
                <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
              </div>
              <Link to="/shop?featured=true">
                <Button variant="outline" className="hidden md:flex">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bestsellers */}
      {bestsellerProducts.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <h2 className="text-3xl font-bold text-gray-900">Bestsellers</h2>
              </div>
              <Link to="/shop?bestseller=true">
                <Button variant="outline" className="hidden md:flex">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {bestsellerProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Info Banner */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Desi Didi Mart?
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mt-8">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                <Shield className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">100% Authentic</h3>
                <p className="text-white/90">All products are pure and desi</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                <Gift className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Best Prices</h3>
                <p className="text-white/90">30-40% cheaper than market</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                <Heart className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Women Empowerment</h3>
                <p className="text-white/90">Supporting local women artisans</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-white py-12 border-t">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Start Shopping?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Explore our wide range of authentic desi products at unbeatable prices. Join thousands of satisfied customers!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop">
              <Button size="lg" className="bg-trust-blue hover:bg-blue-700">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Browse Products
              </Button>
            </Link>
            <a href="https://wa.me/917073741421" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline">
                <Phone className="mr-2 h-5 w-5" />
                Contact Us
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DesiDidiMart;
