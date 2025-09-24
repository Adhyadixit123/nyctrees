import { useState, useCallback } from 'react';
import { Product, AddOn } from '@/types/checkout';
import { ShopifyCartService } from '@/services/shopifyService';

export function useCart() {
  const [cartId, setCartId] = useState<string | null>(null);
  const [shopifyCart, setShopifyCart] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [allAddOns, setAllAddOns] = useState<AddOn[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadCart = useCallback(async (id: string) => {
    const cart = await ShopifyCartService.getCart(id);
    setShopifyCart(cart);
  }, []);

  const updateProductSelection = useCallback(async (product: Product, variantId: string) => {
    setSelectedProduct(product);
    setIsLoading(true);

    try {
      // Create or update cart with the selected product
      if (cartId) {
        await ShopifyCartService.addToCart(cartId, variantId, 1);
        await loadCart(cartId);
      } else {
        const newCartId = await ShopifyCartService.createCart(variantId, 1);
        if (newCartId) {
          setCartId(newCartId);
          await loadCart(newCartId);
        }
      }
    } catch (error) {
      console.error('Error updating product selection:', error);
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
    setAllAddOns
  };
}
