// Netlify Function: Shopify GraphQL Proxy
// Path: /.netlify/functions/shopify/api/2025-10/graphql.json

const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Shopify-Storefront-Access-Token',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Test endpoint
  if (event.path.endsWith('/test')) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        status: 'ok',
        env: {
          hasToken: !!process.env.SHOPIFY_STOREFRONT_TOKEN,
          hasDomain: 'brooklyn-christmas-tree-delivery.myshopify.com'
        }
      })
    };
  }

  // Main handler
  try {
    const SHOPIFY_STORE_DOMAIN = 'brooklyn-christmas-tree-delivery.myshopify.com';
    const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN || process.env.VITE_SHOPIFY_ACCESS_TOKEN;
    const API_VERSION = '2025-10';

    if (!SHOPIFY_STOREFRONT_TOKEN) {
      throw new Error('Missing SHOPIFY_STOREFRONT_TOKEN environment variable');
    }

    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method Not Allowed' })
      };
    }

    const targetUrl = `https://${SHOPIFY_STORE_DOMAIN}/api/${API_VERSION}/graphql.json`;
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
      },
      body: event.body,
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Server Error',
        message: error.message
      })
    };
  }
};
