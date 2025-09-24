// Netlify Function: Shopify GraphQL Proxy
// Path: /.netlify/functions/shopify/api/2025-10/graphql.json

export async function handler(event, context) {
  const allowedOrigin = event.headers.origin || '*';

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Shopify-Storefront-Access-Token',
        'Access-Control-Max-Age': '86400',
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': allowedOrigin },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const SHOPIFY_STORE_DOMAIN = 'brooklyn-christmas-tree-delivery.myshopify.com';
  const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN || process.env.VITE_SHOPIFY_ACCESS_TOKEN;
  const API_VERSION = '2025-10';

  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_TOKEN) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': allowedOrigin },
      body: JSON.stringify({ error: 'Missing Shopify environment variables on server' })
    };
  }

  try {
    const targetUrl = `https://${SHOPIFY_STORE_DOMAIN}/api/${API_VERSION}/graphql.json`;

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
      },
      body: event.body,
    });

    const text = await response.text();

    return {
      statusCode: response.status,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Content-Type': 'application/json',
      },
      body: text,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': allowedOrigin },
      body: JSON.stringify({ error: 'Proxy error', details: err.message })
    };
  }
}
