import { useState, useCallback } from 'react';
import { Product, AddOn } from '@/types/checkout';
import { ShopifyCartService } from '@/services/shopifyService';

export function useCart() {
  const [cartId, setCartId] = useState<string | null>(null);
  const [shopifyCart, setShopifyCart] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [allAddOns, setAllAddOns] = useState<AddOn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCart = useCallback(async (id: string) => {
    try {
      const cart = await ShopifyCartService.getCart(id);
      if (cart) {
        setShopifyCart(cart);
        setError(null);
      } else {
        setError('Failed to load cart');
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setError('Error loading cart');
    }
  }, []);

  const updateProductSelection = useCallback(async (product: Product, variantId: string) => {
    setSelectedProduct(product);
    setIsLoading(true);
    setError(null);

    try {
      console.log('Updating product selection with variantId:', variantId);
      console.log('Product variants:', product.variants);

      // The variantId passed from ProductCard should already be the Shopify variant ID
      // Let's use it directly since it's coming from the Shopify API
      const actualVariantId = variantId;

      console.log('Using Shopify variant ID:', actualVariantId);

      // Create or update cart with the selected product
      if (cartId) {
        console.log('Adding to existing cart:', cartId);
        const success = await ShopifyCartService.addToCart(cartId, actualVariantId, 1);
        if (success) {
          console.log('Product added to cart successfully');
          await loadCart(cartId);
          console.log('Cart reloaded after adding product');
        } else {
          console.error('Failed to add product to cart');
          setError('Failed to add product to cart');
        }
      } else {
        console.log('Creating new cart...');
        const newCartId = await ShopifyCartService.createCart(actualVariantId, 1);
        if (newCartId) {
          console.log('New cart created:', newCartId);
          setCartId(newCartId);
          await loadCart(newCartId);
          console.log('Cart loaded after creation');
        } else {
          console.error('Failed to create cart');
          setError('Failed to create cart');
        }
      }
    } catch (error: any) {
      console.error('Error updating product selection:', error);
      setError(error.message || 'Error updating product selection');
    } finally {
      setIsLoading(false);
    }
  }, [cartId, loadCart]);

  const addAddOn = useCallback(async (addOnId: string) => {
    // For now, we'll handle add-ons locally since Shopify doesn't have add-on concept
    // In a real implementation, you might want to use line item properties or metafields
    console.log('Add-on functionality would be implemented here:', addOnId);
  }, [cartId, shopifyCart]);

  const removeAddOn = useCallback(async (addOnId: string) => {
    // For now, we'll handle add-ons locally since Shopify doesn't have add-on concept
    console.log('Remove add-on functionality would be implemented here:', addOnId);
  }, [cartId, shopifyCart]);

  const calculateTotal = useCallback(() => {
    if (!shopifyCart) return 0;
    return parseFloat(shopifyCart.cost?.totalAmount?.amount || '0');
  }, [shopifyCart]);

  const getOrderSummary = useCallback(() => {
    if (!shopifyCart) return null;

    const items = shopifyCart.lines?.edges?.map((edge: any) => ({
      name: `${edge.node.merchandise.product.title} - ${edge.node.merchandise.title}`,
      price: parseFloat(edge.node.merchandise.price.amount) * edge.node.quantity,
      quantity: edge.node.quantity
    })) || [];

    const subtotal = parseFloat(shopifyCart.cost?.subtotalAmount?.amount || '0');
    const tax = parseFloat(shopifyCart.cost?.totalTaxAmount?.amount || '0');
    const total = parseFloat(shopifyCart.cost?.totalAmount?.amount || '0');

    return {
      subtotal,
      tax,
      total,
      items
    };
  }, [shopifyCart]);

  const getCheckoutUrl = useCallback(() => {
    return shopifyCart?.checkoutUrl || null;
  }, [shopifyCart]);

  return {
    cartId,
    shopifyCart,
    selectedProduct,
    updateProductSelection,
    addAddOn,
    removeAddOn,
    calculateTotal,
    getOrderSummary,
    getCheckoutUrl,
    isLoading,
    error,
    setAllAddOns
  };
}
