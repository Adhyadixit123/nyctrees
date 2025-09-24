# Shopify Checkout Integration

This is a modern React-based checkout system that integrates seamlessly with Shopify's Storefront API. The application provides a beautiful, responsive checkout experience while maintaining full compatibility with Shopify's ecosystem.

## Features

- **Real-time Product Loading**: Fetches products directly from your Shopify store
- **Shopify Cart Integration**: Uses Shopify's native cart system for accurate pricing and inventory
- **Seamless Checkout**: Redirects to Shopify's secure checkout process
- **Add-on System**: Customizable add-on selection with visual feedback
- **Responsive Design**: Mobile-first design that works on all devices
- **TypeScript Support**: Full type safety throughout the application

## Development Setup

### Option 1: Using Local Proxy Server (Recommended)

1. **Start the proxy server** (runs on port 3001):
   ```bash
   npm run proxy
   ```

2. **Start the development server** (runs on port 8080):
   ```bash
   npm run dev
   ```

3. **Or run both simultaneously**:
   ```bash
   npm run dev:full
   ```

## Netlify Deployment

### Environment Variables Setup

Make sure to add these environment variables in your Netlify dashboard:

1. Go to **Site Settings** → **Environment Variables**
2. Add the following variables:
   ```
   VITE_SHOPIFY_STORE_DOMAIN=brooklyn-tres.myshopify.com
   VITE_SHOPIFY_ACCESS_TOKEN=b4e113af808dbf008ab651c525f312b4
   VITE_SHOPIFY_API_KEY=f98eeb27a8c46d089b9fe6db7335e857
   VITE_SHOPIFY_API_SECRET=f48a9a61618ecd3f4c0ec8035bb734bd
   ```

### Production Configuration

The application uses a CORS proxy service to bypass Shopify's CORS restrictions:

- **CORS Proxy**: `https://api.allorigins.win` - Handles Shopify API requests in production
- **Direct Connection**: Works without CORS issues through the proxy

## Backend API Solution (Alternative)

If the CORS proxy doesn't work reliably, you can deploy a simple backend API:

### Deploy Backend API to Heroku/Vercel/Railway

1. **Create a new repository** for the backend API
2. **Upload `proxy-api.js`** to your backend hosting service
3. **Set environment variable**:
   ```
   SHOPIFY_ACCESS_TOKEN=b4e113af808dbf008ab651c525f312b4
   ```
4. **Update the Shopify client** to point to your backend API URL

### Local Development with Backend API

```bash
# Start the backend API
npm run api

# Start the frontend (in another terminal)
npm run dev
```

## 🚨 IMMEDIATE TROUBLESHOOTING

### If you're still getting CORS errors on Netlify:

1. **Check if Netlify has deployed the latest code**:
   - Go to your Netlify dashboard
   - Look for recent deployments
   - Trigger a manual redeploy if needed

2. **Test CORS proxies directly**:
   - Open `test-cors.html` in your browser
   - Run the test to see which proxy works
   - Update the configuration if needed

3. **Try the backend API solution** (most reliable):
   - Deploy `proxy-api.js` to Railway, Heroku, or Vercel
   - Update the Shopify client to use your backend URL

### Quick Fix - Update Your Netlify Environment Variables

If the deployment hasn't picked up the latest changes, manually update the client-side configuration:

1. **In your Netlify dashboard**, go to **Site Settings** → **Environment Variables**
2. **Add or update**:
   ```
   VITE_SHOPIFY_STORE_DOMAIN=https://brooklyn-tres.myshopify.com
   VITE_SHOPIFY_ACCESS_TOKEN=b4e113af808dbf008ab651c525f312b4
   ```

3. **Trigger a redeploy** from the **Deploys** tab

### Alternative: Backend API Solution

**Most Reliable Option:**

1. **Deploy the backend API**:
   ```bash
   # Deploy proxy-api.js to Railway, Heroku, or Vercel
   # Set environment variable: SHOPIFY_ACCESS_TOKEN=your_token
   ```

2. **Update the Shopify client** to use your backend URL:
   ```javascript
   const actualStoreDomain = 'https://your-backend-api.herokuapp.com/api/2025-10';
   ```

### Debug Steps:

1. **Check browser console** for detailed error messages
2. **Verify environment variables** are set correctly in Netlify
3. **Test the API directly** using the test file
4. **Try different CORS proxy services** if needed

## Understanding the CORS Error

**The error occurs because:**
- Your Netlify app (`https://ojasda.netlify.app`) is trying to access Shopify's API
- Shopify doesn't allow cross-origin requests for security reasons
- The browser blocks the request before it reaches Shopify

**Solutions in order of reliability:**
1. ✅ **CORS Proxy Service** (current implementation)
2. ✅ **Backend API Proxy** (most reliable)
3. ✅ **Shopify App Bridge** (requires Shopify app setup)
4. ❌ **Direct API calls** (blocked by CORS)

### Required Shopify API Scopes

Make sure your Shopify app has these API scopes enabled:
- `read_products`
- `read_customers`
- `write_checkouts`

### Alternative CORS Solutions

1. **Use a different CORS proxy**:
   ```javascript
   const corsProxy = 'https://cors-anywhere.herokuapp.com';
   const actualStoreDomain = `${corsProxy}/${storeDomain}/api/2025-10`;
   ```

2. **Deploy your own proxy server** using the included `proxy-api.js`

3. **Configure Shopify to allow your domain** (requires Shopify Plus)

## CORS Solution

The application includes a local Express proxy server that handles CORS issues during development:

- **Proxy Server**: `http://localhost:3001` - Handles Shopify API requests
- **Dev Server**: `http://localhost:8080` - Serves the React application
- **CORS Headers**: Automatically added to all proxy responses

The proxy server forwards requests to Shopify and adds the necessary CORS headers to prevent browser blocking.

## Architecture

### Core Components

- **Shopify Service** (`src/services/shopifyService.ts`): Handles all Shopify API interactions
- **Cart Hook** (`src/hooks/useCart.ts`): Manages cart state and Shopify cart operations
- **Product Service** (`src/lib/shopify.ts`): Shopify client configuration and types
- **Checkout Flow** (`src/components/CheckoutFlow.tsx`): Multi-step checkout process
- **Product Card** (`src/components/ProductCard.tsx`): Product display and variant selection

### Data Flow

1. **Product Loading**: Products are fetched from Shopify Storefront API on app initialization
2. **Cart Management**: Cart operations are handled through Shopify's cart API
3. **Checkout Process**: Users are redirected to Shopify's secure checkout
4. **Order Completion**: Order details are displayed after successful checkout

## Customization

### Adding New Add-ons

Add-ons are defined in `src/data/mockData.ts`. Each add-on can have:
- Name and description
- Price
- Category
- Popularity flag
- Custom styling

### Styling

The application uses Tailwind CSS with custom design tokens. Key customization points:
- Colors: `tailwind.config.ts`
- Components: `src/components/ui/`
- Layout: `src/pages/Index.tsx`

### Extending Functionality

To add new features:
1. Extend the Shopify service with new API calls
2. Update the cart hook with new state management
3. Add new components following the existing patterns
4. Update TypeScript types as needed

## API Reference

### ShopifyProductService

- `getProducts()`: Fetch all products from Shopify
- `getProduct(productId)`: Fetch a specific product
- `transformShopifyProduct()`: Convert Shopify product format to internal format

### ShopifyCartService

- `createCart()`: Create a new cart with products
- `addToCart()`: Add items to existing cart
- `updateCartItem()`: Update cart item quantities
- `removeFromCart()`: Remove items from cart
- `getCart()`: Retrieve cart details

## Error Handling

The application includes comprehensive error handling:
- API failures fall back to mock data
- Network errors are logged and displayed to users
- Cart operations include retry logic
- Loading states prevent user confusion

## Deployment

### Netlify (Recommended)

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

### Other Platforms

The application is built with Vite and can be deployed to any static hosting platform:
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Any CDN

## Security Notes

- Storefront API tokens are public and safe to expose in frontend code
- Private API keys should never be exposed to the client
- Environment variables are automatically handled by Vite
- All checkout operations go through Shopify's secure servers

## Support

For issues related to:
- Shopify API integration: Check Shopify developer documentation
- Frontend functionality: Review the component code
- Styling issues: Check Tailwind configuration
- Build problems: Verify Node.js and npm versions

## License

This project is provided as-is for Shopify integration demonstration purposes.
