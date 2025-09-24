const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Shopify Proxy API is running' });
});

// Proxy endpoint for Shopify API
app.use('/api', async (req, res) => {
  try {
    const shopifyUrl = `https://brooklyn-tres.myshopify.com${req.path}`;

    console.log(`Proxying ${req.method} request to: ${shopifyUrl}`);

    const response = await fetch(shopifyUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
        ...req.headers
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
    });

    const data = await response.text();

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    res.status(response.status).send(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy server error', details: error.message });
  }
});

// Handle preflight requests
app.options('*', cors());

app.listen(PORT, () => {
  console.log(`🚀 Shopify Proxy API running on port ${PORT}`);
  console.log(`📝 Make sure to set these environment variables:`);
  console.log(`   SHOPIFY_ACCESS_TOKEN=your_access_token_here`);
});
