import { createStorefrontApiClient } from '@shopify/storefront-api-client';

const storeDomain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN;
const accessToken = import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN;

if (!storeDomain || !accessToken) {
  throw new Error('Missing Shopify environment variables');
}

// We will use two strategies:
// - Development: talk to Shopify via a local proxy (http://localhost:3001) to avoid CORS
// - Production (Netlify): route through Netlify Function to avoid CORS entirely

const API_VERSION = '2025-10';
const isDev = import.meta.env.DEV;

// Custom fetch for Netlify Function. The Storefront client will pass a URL and init.
// We ignore the URL and forward to our Netlify Function endpoint instead.
const netlifyFunctionFetch: typeof fetch = async (_url, init) => {
  // Clone and sanitize headers: remove Shopify token header added by SDK
  const headers = new Headers(init?.headers || {});
  headers.delete('X-Shopify-Storefront-Access-Token');
  headers.set('Content-Type', 'application/json');

  const fnUrl = `/.netlify/functions/shopify/api/${API_VERSION}/graphql.json`;
  return fetch(fnUrl, { ...(init || {}), headers });
};

// Build the client differently per environment
export const shopifyClient = isDev
  ? createStorefrontApiClient({
      // Local dev: hit local proxy server started by `npm run api` (proxy-api.js)
      // If you prefer direct Shopify in dev with Vite proxy, update this base accordingly.
      storeDomain: 'localhost:3001',
      publicAccessToken: accessToken,
      apiVersion: API_VERSION,
      // Force http scheme when using a non-https dev proxy domain
      // The SDK uses https by default; we override by prefixing scheme via customFetch
      customFetchApi: async (url, init) => {
        // Rewrite target to local proxy
        const devUrl = `http://localhost:3001/api/${API_VERSION}/graphql.json`;
        const headers = new Headers(init?.headers || {});
        headers.set('Content-Type', 'application/json');
        return fetch(devUrl, { ...(init || {}), headers });
      },
    })
  : createStorefrontApiClient({
      // Production: real store domain (used only for SDK internals),
      // but we override the actual network call via customFetchApi to the Netlify Function.
      storeDomain,
      publicAccessToken: accessToken,
      apiVersion: API_VERSION,
      customFetchApi: netlifyFunctionFetch,
    });

export interface ShopifyProduct {
  id: string;
  title: string;
  description: string;
  images: {
    edges: Array<{
      node: {
        url: string;
        altText: string;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: {
          amount: string;
          currencyCode: string;
        };
        availableForSale: boolean;
      };
    }>;
  };
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  lines: {
    edges: Array<{
      node: {
        id: string;
        quantity: number;
        merchandise: {
          id: string;
          title: string;
          price: {
            amount: string;
            currencyCode: string;
          };
          product: {
            title: string;
            images: {
              edges: Array<{
                node: {
                  url: string;
                };
              }>;
            };
          };
        };
      };
    }>;
  };
  cost: {
    subtotalAmount: {
      amount: string;
      currencyCode: string;
    };
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
    totalTaxAmount: {
      amount: string;
      currencyCode: string;
    };
  };
}

export interface ShopifyCheckout {
  id: string;
  webUrl: string;
  order: {
    id: string;
    orderNumber: number;
    totalPrice: {
      amount: string;
      currencyCode: string;
    };
  } | null;
}
