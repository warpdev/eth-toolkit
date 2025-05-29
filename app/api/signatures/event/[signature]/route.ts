import type { NextRequest } from 'next/server';

/**
 * Edge Runtime for optimal performance and caching
 */
export const runtime = 'edge';

/**
 * Allow dynamic rendering with caching
 */
export const dynamic = 'auto';

/**
 * 4bytes.directory API response types
 */
interface FourBytesSignature {
  id: number;
  text_signature: string;
  hex_signature: string;
  bytes_signature: string;
}

interface FourBytesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: FourBytesSignature[];
}

/**
 * GET /api/signatures/event/[signature]
 *
 * Fetches event signatures from 4bytes.directory with aggressive caching
 *
 * @param signature - The hex signature to look up (with or without 0x prefix)
 * @returns Event signature data with appropriate cache headers
 */
export async function GET(request: NextRequest, { params }: { params: { signature: string } }) {
  try {
    // Clean the signature (remove 0x prefix if present)
    const cleanSignature = params.signature.startsWith('0x')
      ? params.signature.slice(2)
      : params.signature;

    // Validate signature format (should be 64 hex characters)
    if (!/^[a-fA-F0-9]{64}$/.test(cleanSignature)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid signature format',
          results: [],
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    // Fetch from 4bytes.directory
    const response = await fetch(
      `https://www.4byte.directory/api/v1/event-signatures/?hex_signature=${cleanSignature}`,
      {
        // Cache for 7 days (event signatures rarely change)
        next: { revalidate: 604800 },
        headers: {
          'User-Agent': 'Ethereum-Dev-Toolkit/1.0',
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      // Handle 4bytes.directory API errors
      console.error(`4bytes.directory API error: ${response.status} ${response.statusText}`);

      return new Response(
        JSON.stringify({
          error: 'Failed to fetch signature from 4bytes.directory',
          results: [],
        }),
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    const data: FourBytesResponse = await response.json();

    // Successful response with aggressive caching
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // Cache headers:
        // - Browser cache: 24 hours (86400 seconds)
        // - CDN/Shared cache: 7 days (604800 seconds)
        // - Stale-while-revalidate: 30 days (2592000 seconds)
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
        Vary: 'Accept-Encoding',
        'X-Cache-Status': 'HIT', // This will be overridden by actual cache status
      },
    });
  } catch (error) {
    // Handle unexpected errors
    console.error('Unexpected error in event signature API:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        results: [],
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}
