import type { NextRequest } from 'next/server';

/**
 * Edge Runtime for optimal performance
 */
export const runtime = 'edge';

/**
 * Batch request/response types
 */
interface BatchRequest {
  signatures: string[];
  type: 'event' | 'function';
}

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

interface BatchResponse {
  [signature: string]: {
    results: FourBytesSignature[];
    error?: string;
  };
}

/**
 * POST /api/signatures/batch
 *
 * Fetches multiple signatures from 4bytes.directory with rate limiting
 *
 * Request body:
 * {
 *   signatures: string[],
 *   type: 'event' | 'function'
 * }
 *
 * @returns Map of signatures to their results
 */
export async function POST(request: NextRequest) {
  try {
    const body: BatchRequest = await request.json();

    // Validate request
    if (!body.signatures || !Array.isArray(body.signatures)) {
      return new Response(JSON.stringify({ error: 'Invalid request: signatures array required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      });
    }

    if (!['event', 'function'].includes(body.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: type must be "event" or "function"' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    // Limit batch size to prevent abuse
    const MAX_BATCH_SIZE = 10;
    if (body.signatures.length > MAX_BATCH_SIZE) {
      return new Response(
        JSON.stringify({ error: `Batch size exceeds maximum of ${MAX_BATCH_SIZE}` }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    // Process signatures
    const results: BatchResponse = {};
    const endpoint = body.type === 'event' ? 'event-signatures' : 'signatures';

    // Process each signature (could be parallelized with Promise.all for better performance)
    for (const signature of body.signatures) {
      try {
        // Clean the signature
        const cleanSignature = signature.startsWith('0x') ? signature.slice(2) : signature;

        // Validate signature format
        const expectedLength = body.type === 'event' ? 64 : 8;
        const regex = new RegExp(`^[a-fA-F0-9]{${expectedLength}}$`);

        if (!regex.test(cleanSignature)) {
          results[signature] = {
            results: [],
            error: `Invalid ${body.type} signature format`,
          };
          continue;
        }

        // Fetch from 4bytes.directory
        const response = await fetch(
          `https://www.4byte.directory/api/v1/${endpoint}/?hex_signature=${cleanSignature}`,
          {
            // Cache for 7 days
            next: { revalidate: 604800 },
            headers: {
              'User-Agent': 'Ethereum-Dev-Toolkit/1.0',
              Accept: 'application/json',
            },
          }
        );

        if (!response.ok) {
          results[signature] = {
            results: [],
            error: `Failed to fetch: ${response.status}`,
          };
          continue;
        }

        const data: FourBytesResponse = await response.json();
        results[signature] = {
          results: data.results || [],
        };

        // Small delay between requests to be respectful to 4bytes.directory
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch {
        results[signature] = {
          results: [],
          error: 'Failed to fetch signature',
        };
      }
    }

    // Return results with cache headers
    return new Response(JSON.stringify(results), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // Shorter cache for batch requests since they might be more dynamic
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
        Vary: 'Accept-Encoding',
      },
    });
  } catch (error) {
    console.error('Batch API error:', error);

    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  }
}
