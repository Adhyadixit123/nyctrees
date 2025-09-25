import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProductCard } from '@/components/ProductCard';
import { CheckoutFlow } from '@/components/CheckoutFlow';
import { OrderComplete } from '@/components/OrderComplete';
import { CartButton } from '@/components/CartButton';
import { ShopifyProductService } from '@/services/shopifyService';
import { useCart } from '@/hooks/useCart';
import { Product, CheckoutStep } from '@/types/checkout';
import { Menu, X, ShoppingBag, User, Search, Heart } from 'lucide-react';

type AppState = 'product' | 'checkout' | 'complete';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('product');
  const { updateProductSelection, setAllAddOns, isLoading, error } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [checkoutSteps, setCheckoutSteps] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Load the specific products from Shopify
    const loadProducts = async () => {
      setLoadingProducts(true);
      try {
        // Load the first product: https://admin.shopify.com/store/brooklyn-christmas-tree-delivery/products/7222219636816
        const baseProductId = 'gid://shopify/Product/7222219636816';
        const baseProduct = await ShopifyProductService.getProduct(baseProductId);

        // Load the second product: https://admin.shopify.com/store/brooklyn-christmas-tree-delivery/products/7222219309136
        const secondProductId = 'gid://shopify/Product/7222219309136';
        const secondProduct = await ShopifyProductService.getProduct(secondProductId);

        const loadedProducts: Product[] = [];

        if (baseProduct) {
          loadedProducts.push(baseProduct);
        }

        if (secondProduct) {
          loadedProducts.push(secondProduct);
        }

        if (loadedProducts.length > 0) {
          setProducts(loadedProducts);
          setSelectedProduct(loadedProducts[0]); // Set the first product as default
        } else {
          console.error('No products found');
          setProducts([]);
          setSelectedProduct(null);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts([]);
        setSelectedProduct(null);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    // Create the 5-step checkout flow (skip tree selection since it's done on main page)
    const createCheckoutSteps = async () => {
      try {
        // Define the 6 specific checkout steps (including order summary)
        const steps = [
          {
            id: 1,
            title: 'Tree Stand',
            description: 'Select a sturdy tree stand for your tree',
            addOns: [],
            collectionId: 'gid://shopify/Collection/155577745488'
          },
          {
            id: 2,
            title: 'Tree Installation',
            description: 'Professional tree installation services',
            addOns: [],
            collectionId: null
          },
          {
            id: 3,
            title: 'Certificate of Insurance',
            description: 'Insurance certificate for your tree installation',
            addOns: [],
            collectionId: null
          },
          {
            id: 4,
            title: 'Delivery Date',
            description: 'Choose your preferred delivery date',
            addOns: [],
            collectionId: null
          },
          {
            id: 5,
            title: 'Delivery Date Time Notes',
            description: 'Specify delivery time preferences and special notes',
            addOns: [],
            collectionId: null
          },
          {
            id: 6,
            title: 'Order Summary',
            description: 'Review your selections before proceeding to checkout',
            addOns: [],
            collectionId: null
          }
        ];

        setCheckoutSteps(steps);
      } catch (error) {
        console.error('Error creating checkout steps:', error);
        setCheckoutSteps([]);
      }
    };

    createCheckoutSteps();
  }, []);

  const handleProductChange = (product: Product) => {
    setSelectedProduct(product);
  };

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white w-full">
      {/* Main Content - iframe friendly, no header/footer, no side paddings */}
      <main className="w-full bg-white">
        {appState === 'product' && (
          <div className="w-full py-4">
            <div className="w-full">
              <div className="text-center">
                {loadingProducts ? (
                  <div className="text-lg text-gray-600">Loading your Christmas tree selection...</div>
                ) : error ? (
                  <div className="text-lg text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
                    Error: {error}
                  </div>
                ) : products.length > 0 ? (
                  <div className="w-full flex justify-center">
                    <ProductCard
                      product={selectedProduct || products[0]}
                      onAddToCart={handleAddToCart}
                      availableProducts={products}
                      showBaseProductSelector={true}
                    />
                  </div>
                ) : (
                  <div className="text-lg text-red-600">Failed to load product</div>
                )}
              </div>
            </div>
          </div>
        )}

        {appState === 'checkout' && checkoutSteps.length > 0 && (
          <CheckoutFlow
            steps={checkoutSteps}
            onComplete={handleCheckoutComplete}
            onBack={handleBackToProduct}
          />
        )}

        {appState === 'complete' && (
          <OrderComplete onNewOrder={handleNewOrder} />
        )}
      </main>

      {/* No footer in iframe mode */}
    </div>
  );
};

export default Index;
