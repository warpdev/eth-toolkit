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

// Network categorization
export type NetworkType = 'mainnet' | 'testnet';

export const NETWORK_CATEGORIES: Record<NetworkType, SupportedChainName[]> = {
  mainnet: ['mainnet', 'polygon', 'arbitrum', 'optimism', 'base'],
  testnet: ['sepolia'],
} as const;

// Helper function to get network type
export function getNetworkType(chainName: SupportedChainName): NetworkType {
  if (NETWORK_CATEGORIES.mainnet.includes(chainName)) return 'mainnet';
  if (NETWORK_CATEGORIES.testnet.includes(chainName)) return 'testnet';
  return 'mainnet'; // fallback
}

// Helper function to get networks by type
export function getNetworksByType(type: NetworkType): SupportedChainName[] {
  return NETWORK_CATEGORIES[type];
}

// Default networks for each type
export const DEFAULT_NETWORKS: Record<NetworkType, SupportedChainName> = {
  mainnet: 'mainnet',
  testnet: 'sepolia',
} as const;

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

// Helper function to get a public client by network name
export function getPublicClient(network: string) {
  if (network in publicClients) {
    return publicClients[network as SupportedChainName];
  }
  return publicClients.mainnet; // fallback to mainnet
}
