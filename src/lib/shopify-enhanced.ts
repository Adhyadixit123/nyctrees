import { createStorefrontApiClient } from '@shopify/storefront-api-client';

const storeDomain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN;
const accessToken = import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN;

if (!storeDomain || !accessToken) {
  throw new Error('Missing Shopify environment variables');
}

// Multiple CORS proxy services as fallbacks
const corsProxies = [
  'https://api.allorigins.win/raw?url=https://' + storeDomain,
  'https://cors-anywhere.herokuapp.com/' + storeDomain,
  'https://corsproxy.io/?' + storeDomain
];

let currentProxyIndex = 0;

const getCurrentProxy = () => corsProxies[currentProxyIndex] + '/api/2025-10';

// Function to try next proxy if current one fails
const tryNextProxy = () => {
  currentProxyIndex = (currentProxyIndex + 1) % corsProxies.length;
  return getCurrentProxy();
};

// Create client with current proxy
let actualStoreDomain = getCurrentProxy();

export const shopifyClient = createStorefrontApiClient({
  storeDomain: actualStoreDomain,
  publicAccessToken: accessToken,
  apiVersion: '2025-10',
});

// Export the proxy switching function
export { tryNextProxy, getCurrentProxy };

// Enhanced fetch function with CORS fallback
export const shopifyFetch = async (query: string, variables?: any) => {
  const maxRetries = corsProxies.length;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(actualStoreDomain + '/graphql.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': accessToken,
        },
        body: JSON.stringify({ query, variables }),
      });

      if (response.ok) {
        return await response.json();
      }

      // If we get a CORS error or network error, try next proxy
      if (response.status === 0 || response.status >= 400) {
        console.warn(`Proxy ${actualStoreDomain} failed, trying next proxy...`);
        actualStoreDomain = tryNextProxy();
        continue;
      }

      return await response.json();
    } catch (error) {
      console.warn(`Network error with proxy ${actualStoreDomain}:`, error);
      if (attempt < maxRetries - 1) {
        actualStoreDomain = tryNextProxy();
        continue;
      }
      throw error;
    }
  }

  throw new Error('All CORS proxy services failed');
};
