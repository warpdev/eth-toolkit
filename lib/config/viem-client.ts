import { createPublicClient, http } from 'viem';
import { mainnet, sepolia, polygon, arbitrum, optimism, base } from 'viem/chains';

/**
 * Supported chains for transaction analysis
 */
export const supportedChains = {
  mainnet,
  sepolia,
  polygon,
  arbitrum,
  optimism,
  base,
} as const;

export type SupportedChainId = keyof typeof supportedChains;

/**
 * Default chain for transaction analysis
 */
export const DEFAULT_CHAIN = mainnet;

/**
 * Create a public client for a specific chain
 */
export function createViemPublicClient(chainId: SupportedChainId = 'mainnet') {
  const chain = supportedChains[chainId];

  return createPublicClient({
    chain,
    transport: http(),
  });
}

/**
 * Default public client (mainnet)
 */
export const publicClient = createViemPublicClient('mainnet');
