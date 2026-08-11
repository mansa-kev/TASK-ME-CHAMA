import { Store, ShoppingCart, Search, Filter, X, Check, ArrowRight, PackageCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiFetch } from '../api';
import toast from 'react-hot-toast';

interface InventoryItem {
  id: number;
  name: string;
  price: number;
  category: string;
  status: string;
}

export function MarketplaceModule() {
  const [searchTerm, setSearchTerm] = useState('');
  const [marketplaceItems, setMarketplaceItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<InventoryItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/inventoryItems');
      setMarketplaceItems(data || []);
    } catch (error) {
      toast.error('Failed to load marketplace items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleBuyNow = async (item: InventoryItem) => {
    if (!confirm(`Are you sure you want to finance/buy ${item.name} for ${formatCurrency(item.price)}?`)) return;

    try {
      // 1. Create a loan
      await apiFetch('/loans', {
        method: 'POST',
        body: JSON.stringify({ productName: item.name })
      });

      // 2. Mark item as assigned
      await apiFetch(`/inventoryItems/${item.id}/assign`, {
        method: 'PUT'
      });

      toast.success(`Successfully financed ${item.name}! Check your Loans module.`);
      fetchItems();
    } catch (error) {
      toast.error('Failed to process asset financing');
    }
  };

  const handleAddToCart = (item: InventoryItem) => {
    setCartItems(prev => [...prev, item]);
    toast.success(`${item.name} added to cart`);
  };

  const handleRemoveFromCart = (index: number) => {
    setCartItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleCheckoutCart = async () => {
    if (cartItems.length === 0) return;
    setIsCheckingOut(true);
    try {
      for (const item of cartItems) {
        await apiFetch('/loans', {
          method: 'POST',
          body: JSON.stringify({ productName: item.name })
        }).catch(() => null);

        await apiFetch(`/inventoryItems/${item.id}/assign`, {
          method: 'PUT'
        }).catch(() => null);
      }
      toast.success(`Order placed! ${cartItems.length} items submitted for Chama asset financing.`);
      setCartItems([]);
      setIsCartOpen(false);
      fetchItems();
    } catch (err) {
      toast.error('Failed to complete checkout');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(value);
  };

  const categories = ['All', 'Electronics', 'Vehicles', 'Real Estate', 'Household'];

  const filteredItems = marketplaceItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !categoryFilter || categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="space-y-6 animation-fade-in relative pb-28 sm:pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2.5 sm:gap-3">
            <Store className="text-brand-accent w-6 h-6 sm:w-8 sm:h-8 shrink-0" />
            Member Marketplace
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Buy assets outright or finance them through Chama Asset Loans.</p>
        </div>
        <div className="relative z-10 flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-brand-primary w-full bg-gray-50/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button 
            onClick={() => setIsCartOpen(true)}
            className="h-10 px-4 bg-brand-primary text-white rounded-xl flex items-center gap-2 hover:bg-brand-primary-dark transition-colors relative shrink-0 text-xs sm:text-sm font-bold shadow-sm">
            <ShoppingCart className="w-4 h-4" />
            <span>Cart ({cartItems.length})</span>
            {cartItems.length > 0 && (
              <span className="w-2 h-2 bg-brand-accent rounded-full animate-ping" />
            )}
          </button>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1 flex items-center gap-1 shrink-0">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {categories.map((cat) => {
          const isSelected = (!categoryFilter && cat === 'All') || categoryFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat === 'All' ? '' : cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                isSelected
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {loading ? (
           <div className="col-span-full py-12 text-center text-gray-500">Loading items...</div>
        ) : filteredItems.map((item, idx) => {
          const isAvailable = item.status === 'AVAILABLE';
          return (
          <div key={idx} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative flex flex-col">
            {!isAvailable && (
              <div className="absolute top-3 right-3 bg-red-100 text-red-600 px-2 py-1 rounded text-[10px] font-extrabold z-10">Out of Stock</div>
            )}
            {isAvailable && (
              <div className="absolute top-3 right-3 bg-brand-green/10 text-brand-green px-2 py-1 rounded text-[10px] font-extrabold z-10">In Stock</div>
            )}
            
            <div className="h-40 sm:h-48 bg-gray-50 flex items-center justify-center text-6xl sm:text-7xl group-hover:scale-105 transition-transform duration-300">
              {item.category === 'Electronics' ? '📺' : item.category === 'Vehicles' ? '🛵' : item.category === 'Real Estate' ? '🏡' : '📦'}
            </div>
            
            <div className="p-4 sm:p-5 flex-1 flex flex-col">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.category}</p>
              <h4 className="font-extrabold text-gray-900 text-sm sm:text-base mt-1 mb-3 line-clamp-2">{item.name}</h4>
              
              <div className="space-y-1.5 mb-4 mt-auto bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-gray-500">Cash Price:</span>
                  <span className="font-extrabold text-brand-green">{formatCurrency(item.price)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-gray-500">3-Month Flex:</span>
                  <span className="font-extrabold text-brand-primary">{formatCurrency(item.price * 1.05)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-gray-500">Installments:</span>
                  <span className="font-extrabold text-brand-accent">{formatCurrency(item.price * 1.1)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => handleBuyNow(item)}
                  disabled={!isAvailable} 
                  className="flex-1 bg-brand-primary text-white font-bold text-xs sm:text-sm py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-primary-dark transition-colors shadow-sm"
                >
                  Finance Asset
                </button>
                <button 
                  onClick={() => handleAddToCart(item)}
                  disabled={!isAvailable} 
                  className="w-11 h-10 border border-gray-200 text-gray-600 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  title="Add to Cart"
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )})}

        {!loading && filteredItems.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">
            <Store className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="font-medium">No products found matching your search filter.</p>
          </div>
        )}
      </div>

      {/* Shopping Cart Drawer / Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-brand-primary" />
                <h3 className="font-extrabold text-gray-900 text-base">Your Shopping Cart</h3>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 py-4 space-y-3 overflow-y-auto">
              {cartItems.length > 0 ? (
                cartItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="min-w-0 flex-1 pr-2">
                      <h4 className="font-bold text-xs sm:text-sm text-gray-900 truncate">{item.name}</h4>
                      <p className="text-xs font-black text-brand-primary mt-0.5">{formatCurrency(item.price)}</p>
                    </div>
                    <button 
                      onClick={() => handleRemoveFromCart(idx)}
                      className="text-red-500 hover:text-red-700 p-1.5 text-xs font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center text-gray-400 space-y-2">
                  <ShoppingCart className="w-12 h-12 mx-auto text-gray-300" />
                  <p className="text-sm font-medium">Your cart is currently empty</p>
                  <p className="text-xs text-gray-400">Add products from the marketplace to finance them.</p>
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="pt-4 border-t border-gray-100 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-gray-600">Total Asset Value:</span>
                  <span className="font-black text-base text-gray-900">{formatCurrency(cartTotal)}</span>
                </div>
                <button
                  type="button"
                  disabled={isCheckingOut}
                  onClick={handleCheckoutCart}
                  className="w-full py-3.5 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-md"
                >
                  {isCheckingOut ? (
                    'Processing Order...'
                  ) : (
                    <>
                      <PackageCheck className="w-4 h-4" /> Apply for Chama Asset Financing ({formatCurrency(cartTotal)})
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
