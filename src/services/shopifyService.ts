import { shopifyClient, ShopifyProduct } from '../lib/shopify';
import { Product } from '@/types/checkout';

export class ShopifyProductService {
  static async getProduct(productId: string): Promise<Product | null> {
    try {
      const query = `
        query GetProduct($id: ID!) {
          product(id: $id) {
            id
            title
            description
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  availableForSale
                }
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      `;

      const response = await shopifyClient.request(query, {
        variables: { id: productId }
      });

      if (!response.data?.product) {
        return null;
      }

      return this.transformShopifyProduct(response.data.product);
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  static async getProductsByCollection(collectionId?: string): Promise<Product[]> {
    try {
      const query = `
        query GetProductsByCollection($first: Int!, $collectionId: ID) {
          collection(id: $collectionId) {
            products(first: $first) {
              edges {
                node {
                  id
                  title
                  description
                  images(first: 1) {
                    edges {
                      node {
                        url
                        altText
                      }
                    }
                  }
                  variants(first: 10) {
                    edges {
                      node {
                        id
                        title
                        price {
                          amount
                          currencyCode
                        }
                        availableForSale
                      }
                    }
                  }
                  priceRange {
                    minVariantPrice {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
          products(first: $first) {
            edges {
              node {
                id
                title
                description
                images(first: 1) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
                variants(first: 10) {
                  edges {
                    node {
                      id
                      title
                      price {
                        amount
                        currencyCode
                      }
                      availableForSale
                    }
                  }
                }
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      `;

      const variables: any = { first: 20 };
      if (collectionId) {
        variables.collectionId = collectionId;
      }

      const response = await shopifyClient.request(query, { variables });

      let products = [];
      if (collectionId && response.data?.collection?.products?.edges) {
        products = response.data.collection.products.edges;
      } else if (response.data?.products?.edges) {
        products = response.data.products.edges;
      }

      return products.map((edge: any) =>
        this.transformShopifyProduct(edge.node)
      );
    } catch (error) {
      console.error('Error fetching products by collection:', error);
      return [];
    }
  }

  static async getCollections(): Promise<any[]> {
    try {
      const query = `
        query GetCollections {
          collections(first: 10) {
            edges {
              node {
                id
                title
                description
                image {
                  url
                  altText
                }
              }
            }
          }
        }
      `;

      const response = await shopifyClient.request(query);

      if (!response.data?.collections?.edges) {
        return [];
      }

      return response.data.collections.edges.map((edge: any) => edge.node);
    } catch (error) {
      console.error('Error fetching collections:', error);
      return [];
    }
  }

  private static transformShopifyProduct(shopifyProduct: ShopifyProduct): Product {
    const basePrice = parseFloat(shopifyProduct.priceRange.minVariantPrice.amount);
    const imageUrl = shopifyProduct.images.edges[0]?.node.url || '';

    return {
      id: shopifyProduct.id,
      name: shopifyProduct.title,
      description: shopifyProduct.description,
      basePrice,
      image: imageUrl,
      variants: shopifyProduct.variants.edges.map((edge: any) => ({
        id: edge.node.id,
        name: 'Variant',
        value: edge.node.title,
        priceModifier: parseFloat(edge.node.price.amount) - basePrice
      }))
    };
  }
}

export class ShopifyCartService {
  static async createCart(productVariantId: string, quantity: number = 1): Promise<string | null> {
    try {
      console.log('Creating cart with productVariantId:', productVariantId, 'quantity:', quantity);

      const query = `
        mutation CreateCart($input: CartInput!) {
          cartCreate(input: $input) {
            cart {
              id
              checkoutUrl
            }
            errors {
              code
              message
            }
          }
        }
      `;

      const variables = {
        input: {
          lines: [
            {
              quantity,
              merchandiseId: productVariantId
            }
          ]
        }
      };

      console.log('Cart creation variables:', variables);

      const response = await shopifyClient.request(query, { variables });
      console.log('Cart creation response:', response);

      if (response.data?.cartCreate?.cart) {
        console.log('Cart created successfully:', response.data.cartCreate.cart.id);
        return response.data.cartCreate.cart.id;
      }

      // Enhanced error handling
      const errors = response.data?.cartCreate?.errors;
      if (errors && errors.length > 0) {
        console.error('Cart creation errors:', errors);
        // Show detailed error messages
        errors.forEach((error: any, index: number) => {
          console.error(`Error ${index + 1}:`, error.code, error.message);
        });
      } else {
        console.error('Cart creation failed but no specific errors returned');
      }

      return null;
    } catch (error: any) {
      console.error('Error creating cart:', error);

      // Enhanced error logging
      if (error.message) {
        console.error('Error message:', error.message);
      }
      if (error.response) {
        console.error('Error response:', error.response);
      }
      if (error.graphQLErrors) {
        console.error('GraphQL errors:', error.graphQLErrors);
      }

      return null;
    }
  }

  static async addToCart(cartId: string, productVariantId: string, quantity: number = 1): Promise<boolean> {
    try {
      console.log('Adding to cart - cartId:', cartId, 'productVariantId:', productVariantId, 'quantity:', quantity);

      const query = `
        mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
          cartLinesAdd(cartId: $cartId, lines: $lines) {
            cart {
              id
            }
            errors {
              code
              message
            }
          }
        }
      `;

      const variables = {
        cartId,
        lines: [
          {
            quantity,
            merchandiseId: productVariantId
          }
        ]
      };

      console.log('Add to cart variables:', variables);

      const response = await shopifyClient.request(query, { variables });
      console.log('Add to cart response:', response);

      if (response.data?.cartLinesAdd?.cart) {
        console.log('Product added to cart successfully');
        return true;
      }

      // Enhanced error handling
      const errors = response.data?.cartLinesAdd?.errors;
      if (errors && errors.length > 0) {
        console.error('Add to cart errors:', errors);
        errors.forEach((error: any, index: number) => {
          console.error(`Error ${index + 1}:`, error.code, error.message);
        });
      } else {
        console.error('Add to cart failed but no specific errors returned');
      }

      return false;
    } catch (error: any) {
      console.error('Error adding to cart:', error);

      // Enhanced error logging
      if (error.message) {
        console.error('Error message:', error.message);
      }
      if (error.response) {
        console.error('Error response:', error.response);
      }
      if (error.graphQLErrors) {
        console.error('GraphQL errors:', error.graphQLErrors);
      }

      return false;
    }
  }

  static async updateCartItem(cartId: string, lineId: string, quantity: number): Promise<boolean> {
    try {
      const query = `
        mutation UpdateCartItem($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
          cartLinesUpdate(cartId: $cartId, lines: $lines) {
            cart {
              id
            }
            errors {
              code
              message
            }
          }
        }
      `;

      const variables = {
        cartId,
        lines: [
          {
            id: lineId,
            quantity
          }
        ]
      };

      const response = await shopifyClient.request(query, { variables });

      if (response.data?.cartLinesUpdate?.cart) {
        return true;
      }

      console.error('Update cart errors:', response.data?.cartLinesUpdate?.errors);
      return false;
    } catch (error) {
      console.error('Error updating cart item:', error);
      return false;
    }
  }

  static async removeFromCart(cartId: string, lineId: string): Promise<boolean> {
    try {
      const query = `
        mutation RemoveFromCart($cartId: ID!, $lineIds: [ID!]!) {
          cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
            cart {
              id
            }
            errors {
              code
              message
            }
          }
        }
      `;

      const variables = {
        cartId,
        lineIds: [lineId]
      };

      const response = await shopifyClient.request(query, { variables });

      if (response.data?.cartLinesRemove?.cart) {
        return true;
      }

      console.error('Remove from cart errors:', response.data?.cartLinesRemove?.errors);
      return false;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  }

  static async getCart(cartId: string): Promise<any> {
    try {
      const query = `
        query GetCart($id: ID!) {
          cart(id: $id) {
            id
            checkoutUrl
            lines(first: 10) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      price {
                        amount
                        currencyCode
                      }
                      product {
                        title
                        images(first: 1) {
                          edges {
                            node {
                              url
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            cost {
              subtotalAmount {
                amount
                currencyCode
              }
              totalAmount {
                amount
                currencyCode
              }
              totalTaxAmount {
                amount
                currencyCode
              }
            }
          }
        }
      `;

      const response = await shopifyClient.request(query, {
        variables: { id: cartId }
      });

      return response.data?.cart || null;
    } catch (error) {
      console.error('Error fetching cart:', error);
      return null;
    }
  }
}
