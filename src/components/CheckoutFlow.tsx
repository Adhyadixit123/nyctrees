import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Plus, ArrowLeft, ArrowRight, Star, ExternalLink, ShoppingBag } from 'lucide-react';
import { CheckoutStep, AddOn } from '@/types/checkout';
import { useCart } from '@/hooks/useCart';
import { ShopifyProductService, ShopifyCartService } from '@/services/shopifyService';
import { ProductCard } from '@/components/ProductCard';

interface CheckoutFlowProps {
  steps: CheckoutStep[];
  onComplete: () => void;
  onBack: () => void;
}

export function CheckoutFlow({ steps, onComplete, onBack }: CheckoutFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepProducts, setStepProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const { shopifyCart, addAddOn, removeAddOn, getOrderSummary, getCheckoutUrl, isLoading } = useCart();

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const orderSummary = getOrderSummary();
  const checkoutUrl = getCheckoutUrl();

  // Load products for current step based on collection ID
  useEffect(() => {
    const loadStepProducts = async () => {
      if (!currentStepData?.collectionId || currentStep >= steps.length - 1) {
        setStepProducts([]);
        return;
      }

      setLoadingProducts(true);
      try {
        console.log('Loading products for collection:', currentStepData.collectionId);
        const products = await ShopifyProductService.getProductsByCollection(currentStepData.collectionId);
        setStepProducts(products.slice(0, 4)); // Show up to 4 products per step
        console.log('Loaded products:', products.length);
      } catch (error) {
        console.error('Error loading step products:', error);
        setStepProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadStepProducts();
  }, [currentStep, currentStepData, steps]);

  const isAddOnSelected = (addOnId: string) => {
    // For now, add-ons are handled locally since Shopify doesn't have add-on concept
    return false;
  };

  const handleAddOnToggle = (addOnId: string) => {
    if (isAddOnSelected(addOnId)) {
      removeAddOn(addOnId);
    } else {
      addAddOn(addOnId);
    }
  };

  const handleProductAddToCart = async (product: any, variantId: string) => {
    // Add product to Shopify cart
    if (shopifyCart?.id) {
      await ShopifyCartService.addToCart(shopifyCart.id, variantId);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - redirect to Shopify checkout
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        onComplete();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  // Check if current step is the cart summary step (last step)
  const isCartSummaryStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">
              {isCartSummaryStep ? 'Review Your Order' : 'Customize Your Order'}
            </h1>
            <Badge variant="secondary">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {isCartSummaryStep ? (
              // Cart Summary Step
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Order Summary
                </h2>
                <p className="text-muted-foreground text-lg mb-8">
                  Review your selections before proceeding to checkout
                </p>

                {orderSummary && orderSummary.items.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Your Items:</h3>
                    {orderSummary.items.map((item, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          <span className="font-bold">${item.price.toFixed(2)}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Your cart is empty. Please add some products first.
                  </div>
                )}
              </div>
            ) : (
              // Collection Steps
              <>
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-foreground mb-2">
                    {currentStepData.title}
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    {currentStepData.description}
                  </p>
                </div>

                {/* Step Products */}
                {loadingProducts ? (
                  <div className="text-center py-8">Loading collection products...</div>
                ) : stepProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stepProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleProductAddToCart}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No products found in this collection.
                  </div>
                )}

                <div className="grid gap-4">
                  {currentStepData.addOns.map((addOn) => (
                    <AddOnCard
                      key={addOn.id}
                      addOn={addOn}
                      isSelected={isAddOnSelected(addOn.id)}
                      onToggle={() => handleAddOnToggle(addOn.id)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {currentStep === 0 ? 'Back to Product' : 'Previous'}
              </Button>

              <Button
                onClick={handleNext}
                className="bg-gradient-primary hover:opacity-90 text-primary-foreground flex items-center gap-2 px-8"
                disabled={isCartSummaryStep && (!orderSummary || orderSummary.items.length === 0)}
              >
                {isCartSummaryStep ? 'Proceed to Checkout' : 'Continue'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 shadow-lg">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderSummary && (
                  <>
                    {orderSummary.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                          )}
                        </div>
                        <span className="font-medium">${item.price.toFixed(2)}</span>
                      </div>
                    ))}

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${orderSummary.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>${orderSummary.tax.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>${orderSummary.total.toFixed(2)}</span>
                      </div>
                    </div>

                    {checkoutUrl && currentStep === steps.length - 1 && (
                      <div className="pt-4">
                        <Button
                          onClick={() => window.location.href = checkoutUrl}
                          className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Complete Purchase
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AddOnCardProps {
  addOn: AddOn;
  isSelected: boolean;
  onToggle: () => void;
}

function AddOnCard({ addOn, isSelected, onToggle }: AddOnCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all duration-normal hover:shadow-md ${
        isSelected
          ? 'ring-2 ring-primary bg-primary/5'
          : 'hover:border-primary/50'
      }`}
      onClick={onToggle}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{addOn.name}</h3>
              {addOn.popular && (
                <Badge className="bg-warning text-warning-foreground text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Popular
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{addOn.description}</p>
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg text-foreground">
                ${addOn.price}
              </span>
              <div className="flex items-center gap-2">
                {isSelected ? (
                  <CheckCircle className="w-5 h-5 text-primary" />
                ) : (
                  <Plus className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
