import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProductCard } from '@/components/ProductCard';
import { CheckoutFlow } from '@/components/CheckoutFlow';
import { CartDebug } from '@/components/CartDebug';
import { OrderComplete } from '@/components/OrderComplete';
import { CartButton } from '@/components/CartButton';
import { ShopifyProductService } from '@/services/shopifyService';
import { useCart } from '@/hooks/useCart';
import { Product, CheckoutStep } from '@/types/checkout';

type AppState = 'product' | 'checkout' | 'complete';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('product');
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const { updateProductSelection, setAllAddOns, isLoading, error } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [checkoutSteps, setCheckoutSteps] = useState<any[]>([]);

  useEffect(() => {
    // Load the specific base product from Shopify
    const loadBaseProduct = async () => {
      setLoadingProducts(true);
      try {
        // Load the specific base product: https://admin.shopify.com/store/brooklyn-christmas-tree-delivery/products/7222219636816
        const baseProductId = 'gid://shopify/Product/7222219636816';
        const baseProduct = await ShopifyProductService.getProduct(baseProductId);

        if (baseProduct) {
          setProducts([baseProduct]);
        } else {
          console.error('Base product not found');
          setProducts([]);
        }
      } catch (error) {
        console.error('Error loading base product:', error);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadBaseProduct();
  }, []);

  useEffect(() => {
    // Create specific checkout steps based on the provided collection URLs
    const createCheckoutSteps = async () => {
      try {
        // Define the specific collections for each step
        const collections = [
          {
            id: 'gid://shopify/Collection/168930279504', // Second page collection
            title: 'Essential Accessories',
            description: 'Complete your setup with these essential accessories'
          },
          {
            id: 'gid://shopify/Collection/267463098448', // Third page collection
            title: 'Audio Enhancement',
            description: 'Enhance your listening experience'
          },
          {
            id: 'gid://shopify/Collection/169354854480', // Fourth page collection
            title: 'Care & Maintenance',
            description: 'Keep your headphones in perfect condition'
          }
        ];

        // Create checkout steps based on these specific collections
        const dynamicSteps = collections.map((collection, index) => ({
          id: index + 1,
          title: collection.title,
          description: collection.description,
          addOns: [], // Will be populated from the collection
          collectionId: collection.id
        }));

        setCheckoutSteps(dynamicSteps);
      } catch (error) {
        console.error('Error creating checkout steps:', error);
        setCheckoutSteps([]);
      }
    };

    createCheckoutSteps();
  }, []);

  const handleAddToCart = async (product: Product, variantId: string) => {
    await updateProductSelection(product, variantId);
    setAppState('checkout');
  };

  const handleCartClick = () => {
    setAppState('checkout');
  };

  const handleStoreClick = () => {
    const storeDomain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN;
    if (storeDomain) {
      window.open(`https://${storeDomain}`, '_blank');
    }
  };

  const handleCheckoutComplete = () => {
    setAppState('complete');
  };

  const handleBackToProduct = () => {
    setAppState('product');
  };

  const handleNewOrder = () => {
    setAppState('product');
  };

  const handleStepChange = (step: number, total: number) => {
    setCurrentStep(step);
    setTotalSteps(total);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-border bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-black">
                Shopify
              </h1>
              <nav className="hidden md:flex items-center gap-6">
                <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                  Products
                </a>
                <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                  Collections
                </a>
                <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                  About
                </a>
                <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                  Contact
                </a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              {/* Progress indicator for checkout flow */}
              {appState === 'checkout' && checkoutSteps.length > 0 && (
                <div className="hidden md:flex items-center gap-3">
                  <Badge variant="secondary" className="px-3 py-1">
                    Step {currentStep + 1} of {totalSteps}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {totalSteps - currentStep - 1} more steps to checkout
                  </span>
                </div>
              )}
              <CartButton
                onCartClick={handleCartClick}
                onStoreClick={handleStoreClick}
              />
              {appState !== 'product' && (
                <button
                  onClick={handleBackToProduct}
                  className="text-sm text-gray-600 hover:text-black transition-colors"
                >
                  ← Back to Products
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {appState === 'product' && (
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Premium Product Selection
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Choose your perfect product and customize your order with our curated collections of accessories and add-ons.
                </p>
              </div>

              <div className="text-center">
                {loadingProducts ? (
                  <div className="text-lg text-gray-600">Loading your product selection...</div>
                ) : error ? (
                  <div className="text-lg text-red-600 bg-red-50 p-4 rounded border border-red-200">
                    Error: {error}
                  </div>
                ) : products.length > 0 ? (
                  <div className="max-w-md mx-auto">
                    <ProductCard
                      product={products[0]}
                      onAddToCart={handleAddToCart}
                    />
                  </div>
                ) : (
                  <div className="text-lg text-red-600">Failed to load product</div>
                )}
              </div>

              {/* Debug Panel */}
              <CartDebug />
            </div>
          </div>
        )}

        {appState === 'checkout' && checkoutSteps.length > 0 && (
          <CheckoutFlow
            steps={checkoutSteps}
            onComplete={handleCheckoutComplete}
            onBack={handleBackToProduct}
            onStepChange={handleStepChange}
          />
        )}

        {appState === 'complete' && (
          <OrderComplete onNewOrder={handleNewOrder} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Products</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">All Products</a></li>
                <li><a href="#" className="hover:text-gray-900">Featured</a></li>
                <li><a href="#" className="hover:text-gray-900">New Arrivals</a></li>
                <li><a href="#" className="hover:text-gray-900">Best Sellers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Collections</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Electronics</a></li>
                <li><a href="#" className="hover:text-gray-900">Clothing</a></li>
                <li><a href="#" className="hover:text-gray-900">Home & Garden</a></li>
                <li><a href="#" className="hover:text-gray-900">Sports</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Help Center</a></li>
                <li><a href="#" className="hover:text-gray-900">Contact Us</a></li>
                <li><a href="#" className="hover:text-gray-900">Shipping Info</a></li>
                <li><a href="#" className="hover:text-gray-900">Returns</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">About Us</a></li>
                <li><a href="#" className="hover:text-gray-900">Careers</a></li>
                <li><a href="#" className="hover:text-gray-900">Press</a></li>
                <li><a href="#" className="hover:text-gray-900">Partners</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2024 Shopify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
