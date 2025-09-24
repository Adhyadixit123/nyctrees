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

### Option 2: Direct Shopify Connection (Production)

For production builds, the app connects directly to Shopify without a proxy.

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
