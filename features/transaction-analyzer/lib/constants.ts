export const GAS_THRESHOLDS = {
  OUT_OF_GAS: 95,
  EARLY_REVERT: 5,
  HIGH_USAGE: 80,
  MEDIUM_USAGE: 50,
} as const;

export const ANALYSIS_DEFAULTS = {
  INCLUDE_GAS_ANALYSIS: true,
  INCLUDE_EVENT_LOGS: true,
  INCLUDE_STATE_CHANGES: false,
  INCLUDE_CALLDATA_ANALYSIS: true,
} as const;

export const CHAIN_DEFAULTS = {
  DEFAULT_CHAIN: 'mainnet',
} as const;

export const ETH_USD_PRICE = 3000; // Placeholder ETH price in USD
