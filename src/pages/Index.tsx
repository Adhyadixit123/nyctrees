import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { CheckoutFlow } from '@/components/CheckoutFlow';
import { OrderComplete } from '@/components/OrderComplete';
import { CartButton } from '@/components/CartButton';
import { useCart } from '@/hooks/useCart';
import { mockProduct, checkoutSteps, getAllAddOns } from '@/data/mockData';
import { ShopifyProductService } from '@/services/shopifyService';
import { Product } from '@/types/checkout';

type AppState = 'product' | 'checkout' | 'complete';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('product');
  const { updateProductSelection, setAllAddOns, isLoading } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    // Initialize all add-ons for cart calculations
    setAllAddOns(getAllAddOns());

    // Load products from Shopify
    const loadProducts = async () => {
      setLoadingProducts(true);
      try {
        const shopifyProducts = await ShopifyProductService.getProductsByCollection();
        setProducts(shopifyProducts);
      } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to mock data if Shopify fails
        setProducts([mockProduct]);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, [setAllAddOns]);

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AudioTech Store
            </h1>
            <div className="flex items-center gap-4">
              <CartButton
                onCartClick={handleCartClick}
                onStoreClick={handleStoreClick}
              />
              {appState !== 'product' && (
                <button
                  onClick={handleBackToProduct}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
                <h2 className="text-4xl font-bold text-foreground mb-4">
                  Premium Audio Experience
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Discover our flagship wireless headphones with cutting-edge technology
                  and customize your perfect setup with our intelligent add-on system.
                </p>
              </div>

              <div className="text-center">
                {loadingProducts ? (
                  <div className="text-lg">Loading products from Shopify...</div>
                ) : products.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.slice(0, 6).map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-lg text-red-500">Failed to load products</div>
                )}
              </div>
            </div>
          </div>
        )}

        {appState === 'checkout' && (
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

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>Shopify-Compatible Checkout System | Built for Seamless Integration</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
