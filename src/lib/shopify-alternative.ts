import { createStorefrontApiClient } from '@shopify/storefront-api-client';

const storeDomain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN;
const accessToken = import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN;

if (!storeDomain || !accessToken) {
  throw new Error('Missing Shopify environment variables');
}

// Use CORS proxy for development to avoid CORS issues
const isDevelopment = import.meta.env.DEV;
const actualStoreDomain = isDevelopment
  ? 'https://cors-anywhere.herokuapp.com/' + storeDomain
  : storeDomain;

export const shopifyClient = createStorefrontApiClient({
  storeDomain: actualStoreDomain,
  publicAccessToken: accessToken,
  apiVersion: '2025-10',
});
