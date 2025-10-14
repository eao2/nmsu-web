// middleware.ts (Production-ready version)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of allowed origins
const allowedOrigins = [
  'http://localhost:3000', // Your local development frontend
  'https://www.yourproductiondomain.com',
  'https://your-production-domain.vercel.app',
];

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');

  // Check if the origin is in the allowed list
  if (origin && allowedOrigins.includes(origin)) {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 });
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true'); // Now you can use credentials
      return response;
    }

    // For other requests, add the headers
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  }

  // If origin is not allowed, just proceed without CORS headers
  // The browser will block the request on the client side
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};