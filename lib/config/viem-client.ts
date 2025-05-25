import { createPublicClient, http } from 'viem';
import { mainnet, sepolia, polygon, arbitrum, optimism, base } from 'viem/chains';

// Define supported chains
export const SUPPORTED_CHAINS = {
  mainnet,
  sepolia,
  polygon,
  arbitrum,
  optimism,
  base,
} as const;

export type SupportedChainName = keyof typeof SUPPORTED_CHAINS;

// Create public clients for each chain
export const publicClients = {
  mainnet: createPublicClient({
    chain: mainnet,
    transport: http(),
  }),
  sepolia: createPublicClient({
    chain: sepolia,
    transport: http(),
  }),
  polygon: createPublicClient({
    chain: polygon,
    transport: http(),
  }),
  arbitrum: createPublicClient({
    chain: arbitrum,
    transport: http(),
  }),
  optimism: createPublicClient({
    chain: optimism,
    transport: http(),
  }),
  base: createPublicClient({
    chain: base,
    transport: http(),
  }),
} as const;

// Default to mainnet
export const publicClient = publicClients.mainnet;
