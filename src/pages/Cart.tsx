import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/contexts/AdminContext';
import { toast } from 'sonner';
import {
  ShoppingCart, Trash2, Heart, Plus, Minus, Tag, ArrowRight,
  Package, Truck, AlertCircle, ChevronRight, Percent, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  variant: any;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    mrp: number;
    images: string[];
    stock_quantity: number;
    is_active: boolean;
  };
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  mrp: number;
  images: string[];
  average_rating: number;
  review_count: number;
}

const FREE_DELIVERY_THRESHOLD = 500;
const DELIVERY_CHARGE = 50;

const Cart = () => {
  const { user } = useAdmin();
  const navigate = useNavigate();
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  
  // Recommended products for empty cart
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/admin');
      return;
    }
    fetchCartItems();
    fetchRecommendedProducts();
  }, [user]);

  const fetchCartItems = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCartItems(data || []);
    } catch (error: any) {
      console.error('Fetch cart error:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedProducts = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('id, name, slug, price, mrp, images, average_rating, review_count')
        .eq('is_active', true)
        .eq('is_featured', true)
        .limit(4);

      if (data) setRecommendedProducts(data);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number, stockLimit: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > stockLimit) {
      toast.error(`Only ${stockLimit} items available in stock`);
      return;
    }

    try {
      setUpdatingItem(itemId);
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
        .eq('id', itemId);

      if (error) throw error;

      setCartItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
      toast.success('Cart updated');
    } catch (error: any) {
      console.error('Update quantity error:', error);
      toast.error('Failed to update quantity');
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setCartItems(prev => prev.filter(item => item.id !== itemId));
      setItemToDelete(null);
      toast.success('Item removed from cart');
    } catch (error: any) {
      console.error('Remove item error:', error);
      toast.error('Failed to remove item');
    }
  };

  const moveToWishlist = async (item: CartItem) => {
    if (!user) return;

    try {
      // Add to wishlist
      const { error: wishlistError } = await supabase
        .from('wishlist')
        .insert({ user_id: user.id, product_id: item.product_id });

      if (wishlistError && wishlistError.code !== '23505') {
        throw wishlistError;
      }

      // Remove from cart
      await removeItem(item.id);

      toast.success('Moved to wishlist');
    } catch (error: any) {
      console.error('Move to wishlist error:', error);
      toast.error('Failed to move to wishlist');
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    try {
      setCouponLoading(true);
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast.error('Invalid coupon code');
        return;
      }

      // Check if coupon is still valid
      if (data.valid_until && new Date(data.valid_until) < new Date()) {
        toast.error('Coupon has expired');
        return;
      }

      // Check usage limit
      if (data.usage_limit && data.used_count >= data.usage_limit) {
        toast.error('Coupon usage limit exceeded');
        return;
      }

      // Check minimum order amount
      const subtotal = calculateSubtotal();
      if (data.min_order_amount && subtotal < data.min_order_amount) {
        toast.error(`Minimum order of ₹${data.min_order_amount} required for this coupon`);
        return;
      }

      setAppliedCoupon(data);
      toast.success('Coupon applied successfully!');
    } catch (error: any) {
      console.error('Apply coupon error:', error);
      toast.error('Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.info('Coupon removed');
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      if (item.product) {
        return sum + (item.product.price * item.quantity);
      }
      return sum;
    }, 0);
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;

    const subtotal = calculateSubtotal();
    let discount = 0;

    if (appliedCoupon.discount_type === 'percentage') {
      discount = (subtotal * appliedCoupon.discount_value) / 100;
    } else if (appliedCoupon.discount_type === 'fixed') {
      discount = appliedCoupon.discount_value;
    }

    // Apply max discount limit if exists
    if (appliedCoupon.max_discount && discount > appliedCoupon.max_discount) {
      discount = appliedCoupon.max_discount;
    }

    return Math.min(discount, subtotal);
  };

  const calculateDeliveryCharge = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const delivery = calculateDeliveryCharge();
    return subtotal - discount + delivery;
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Check stock availability
    const outOfStock = cartItems.find(item => 
      !item.product?.is_active || item.quantity > item.product?.stock_quantity
    );

    if (outOfStock) {
      toast.error('Some items are out of stock. Please update your cart.');
      return;
    }

    navigate('/checkout', {
      state: {
        couponCode: appliedCoupon?.code,
        discount: calculateDiscount(),
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-trust-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-lg p-12">
              <ShoppingCart className="h-32 w-32 mx-auto mb-6 text-gray-300" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
              <p className="text-gray-600 mb-8">
                Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
              </p>
              <Link to="/shop">
                <Button size="lg" className="bg-trust-blue hover:bg-blue-700">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Continue Shopping
                </Button>
              </Link>
            </div>

            {recommendedProducts.length > 0 && (
              <div className="mt-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">You Might Like</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {recommendedProducts.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.slug}`}
                      className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all group"
                    >
                      <img
                        src={product.images?.[0] || 'https://via.placeholder.com/200'}
                        alt={product.name}
                        className="w-full h-40 object-cover rounded-t-lg group-hover:scale-105 transition-transform"
                      />
                      <div className="p-3">
                        <h4 className="font-semibold text-sm line-clamp-2 mb-2">{product.name}</h4>
                        <p className="text-trust-blue font-bold">₹{product.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Link to="/" className="hover:text-trust-blue">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 font-semibold">Shopping Cart</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-1">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Free Delivery Banner */}
            {calculateSubtotal() < FREE_DELIVERY_THRESHOLD && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Truck className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-800">
                      Add ₹{(FREE_DELIVERY_THRESHOLD - calculateSubtotal()).toFixed(2)} more for FREE delivery!
                    </p>
                    <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${(calculateSubtotal() / FREE_DELIVERY_THRESHOLD) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cart Items List */}
            <div className="space-y-3">
              {cartItems.map((item) => {
                if (!item.product) return null;

                const discount = item.product.mrp > item.product.price
                  ? Math.round(((item.product.mrp - item.product.price) / item.product.mrp) * 100)
                  : 0;

                const isOutOfStock = !item.product.is_active || item.product.stock_quantity === 0;
                const isLowStock = item.product.stock_quantity < 5 && item.product.stock_quantity > 0;

                return (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <Link to={`/product/${item.product.slug}`} className="flex-shrink-0">
                        <img
                          src={item.product.images?.[0] || 'https://via.placeholder.com/120'}
                          alt={item.product.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      </Link>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.product.slug}`}>
                          <h3 className="font-semibold text-gray-900 hover:text-trust-blue line-clamp-2">
                            {item.product.name}
                          </h3>
                        </Link>

                        {item.variant && (
                          <p className="text-sm text-gray-600 mt-1">
                            Variant: {JSON.stringify(item.variant)}
                          </p>
                        )}

                        <div className="flex items-baseline space-x-2 mt-2">
                          <span className="text-xl font-bold text-gray-900">
                            ₹{item.product.price.toLocaleString()}
                          </span>
                          {item.product.mrp > item.product.price && (
                            <>
                              <span className="text-sm text-gray-500 line-through">
                                ₹{item.product.mrp.toLocaleString()}
                              </span>
                              <span className="text-sm text-green-600 font-semibold">
                                {discount}% off
                              </span>
                            </>
                          )}
                        </div>

                        {/* Stock Status */}
                        {isOutOfStock ? (
                          <div className="flex items-center text-red-600 text-sm mt-2">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Out of Stock
                          </div>
                        ) : isLowStock ? (
                          <div className="flex items-center text-orange-600 text-sm mt-2">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Only {item.product.stock_quantity} left
                          </div>
                        ) : null}

                        {/* Actions */}
                        <div className="flex items-center gap-4 mt-3">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1, item.product.stock_quantity)}
                              disabled={updatingItem === item.id || item.quantity <= 1}
                              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1, item.product.stock_quantity)}
                              disabled={updatingItem === item.id || item.quantity >= item.product.stock_quantity}
                              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Move to Wishlist */}
                          <button
                            onClick={() => moveToWishlist(item)}
                            className="flex items-center text-sm text-gray-600 hover:text-pink-600 transition-colors"
                          >
                            <Heart className="h-4 w-4 mr-1" />
                            Save for Later
                          </button>

                          {/* Remove */}
                          <button
                            onClick={() => setItemToDelete(item.id)}
                            className="flex items-center text-sm text-gray-600 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="flex-shrink-0 text-right">
                        <p className="text-xl font-bold text-gray-900">
                          ₹{(item.product.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Continue Shopping */}
            <Link to="/shop">
              <Button variant="outline" className="w-full">
                <Package className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

              {/* Coupon Code */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Apply Coupon Code
                </label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Tag className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-800">{appliedCoupon.code}</p>
                        <p className="text-xs text-green-600">
                          {appliedCoupon.discount_type === 'percentage'
                            ? `${appliedCoupon.discount_value}% off`
                            : `₹${appliedCoupon.discount_value} off`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-green-600 hover:text-green-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1"
                    />
                    <Button
                      onClick={applyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="bg-trust-blue hover:bg-blue-700"
                    >
                      {couponLoading ? 'Applying...' : 'Apply'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 border-t pt-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span className="font-semibold">₹{calculateSubtotal().toLocaleString()}</span>
                </div>

                {appliedCoupon && calculateDiscount() > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center">
                      <Percent className="h-4 w-4 mr-1" />
                      Coupon Discount
                    </span>
                    <span className="font-semibold">- ₹{calculateDiscount().toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-700">
                  <span className="flex items-center">
                    <Truck className="h-4 w-4 mr-1" />
                    Delivery Charges
                  </span>
                  {calculateDeliveryCharge() === 0 ? (
                    <span className="font-semibold text-green-600">FREE</span>
                  ) : (
                    <span className="font-semibold">₹{calculateDeliveryCharge()}</span>
                  )}
                </div>

                <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-trust-blue">₹{calculateTotal().toLocaleString()}</span>
                </div>

                {appliedCoupon && calculateDiscount() > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800 font-semibold">
                      You're saving ₹{calculateDiscount().toLocaleString()} on this order!
                    </p>
                  </div>
                )}
              </div>

              {/* Checkout Button */}
              <Button
                onClick={proceedToCheckout}
                className="w-full bg-trust-blue hover:bg-blue-700 text-white font-semibold py-3"
                size="lg"
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              {/* Safe Shopping Badge */}
              <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Package className="h-4 w-4" />
                <span>Safe and Secure Payments</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Item from Cart?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this item from your cart? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => itemToDelete && removeItem(itemToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Cart;
