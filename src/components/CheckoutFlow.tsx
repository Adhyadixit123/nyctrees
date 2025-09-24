import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Plus, ArrowLeft, ArrowRight, Star, ExternalLink } from 'lucide-react';
import { CheckoutStep, AddOn } from '@/types/checkout';
import { useCart } from '@/hooks/useCart';

interface CheckoutFlowProps {
  steps: CheckoutStep[];
  onComplete: () => void;
  onBack: () => void;
}

export function CheckoutFlow({ steps, onComplete, onBack }: CheckoutFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { shopifyCart, addAddOn, removeAddOn, getOrderSummary, getCheckoutUrl, isLoading } = useCart();

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const orderSummary = getOrderSummary();
  const checkoutUrl = getCheckoutUrl();

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

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // For Shopify integration, redirect to Shopify checkout
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">Customize Your Order</h1>
            <Badge variant="secondary">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Add-ons Selection */}
          <div className="lg:col-span-2 space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {currentStepData.title}
              </h2>
              <p className="text-muted-foreground text-lg">
                {currentStepData.description}
              </p>
            </div>

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
              >
                {currentStep === steps.length - 1 ? 'Complete Order' : 'Continue'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Order Summary */}
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
                        <span className="font-medium">${item.price}</span>
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

                    {checkoutUrl && (
                      <div className="pt-4">
                        <Button
                          onClick={() => window.location.href = checkoutUrl}
                          className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Proceed to Shopify Checkout
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
