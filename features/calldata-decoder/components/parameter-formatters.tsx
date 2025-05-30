'use client';

import React, { useMemo } from 'react';
import { formatEther } from 'viem';

// Formatter for BigInt values in JSON.stringify
export const bigIntReplacer = (_: string, value: unknown): unknown =>
  typeof value === 'bigint' ? value.toString() : value;

// Helper to get the string representation of an argument for copying
export const getArgAsString = (arg: unknown): string => {
  if (arg === null || arg === undefined) {
    return 'null';
  }

  // Specifically handle arrays
  if (Array.isArray(arg)) {
    try {
      return JSON.stringify(arg, bigIntReplacer, 2);
    } catch {
      return String(arg);
    }
  }

  if (typeof arg === 'object') {
    try {
      return JSON.stringify(arg, bigIntReplacer, 2);
    } catch {
      return String(arg);
    }
  }

  return String(arg);
};

// Helper to check if a value is likely an ETH amount in Wei
export const isLikelyWeiValue = (value: unknown, type?: string): boolean => {
  // Skip array types
  if (type && type.includes('[]')) {
    return false;
  }

  // Check parameter type hints
  if (type && (type.includes('uint256') || type.includes('uint128'))) {
    return true;
  }

  // Check if it's a bigint with significant size (at least 1e15 wei = 0.001 ETH)
  if (typeof value === 'bigint' && value >= 1000000000000000n) {
    return true;
  }

  // Check if it's a string representation of a large number
  if (typeof value === 'string' && /^\d+$/.test(value) && value.length >= 15) {
    return true;
  }

  return false;
};

interface FormatArgProps {
  arg: unknown;
  type?: string;
}

// Component to format a single argument
export const FormatArg: React.FC<FormatArgProps> = React.memo(function FormatArg({ arg, type }) {
  // All hooks must be called at the top level before any early returns or conditions
  const isArray = Array.isArray(arg);
  const isEthArray = isArray && type && (type.includes('uint256[]') || type.includes('uint128[]'));
  const isWeiValue = isLikelyWeiValue(arg, type);
  const isObject = typeof arg === 'object' && arg !== null && !isArray;

  // Memoize array items for ETH value arrays
  const ethArrayItems = useMemo(() => {
    if (!isEthArray || !isArray) return null;

    return (arg as unknown[]).map((item, i) => (
      <div key={i} className="flex flex-col">
        {typeof item === 'bigint' && isLikelyWeiValue(item, 'uint256') ? (
          <>
            <span>{item.toString()}</span>
            <span className="text-muted-foreground text-xs">({formatEther(item)} ETH)</span>
          </>
        ) : (
          <span>{typeof item === 'bigint' ? item.toString() : String(item)}</span>
        )}
      </div>
    ));
  }, [arg, isEthArray, isArray]);

  // Memoize generic array formatting
  const genericArrayFormatted = useMemo(() => {
    if (!isArray || isEthArray) return null;

    try {
      return (
        <pre className="break-all whitespace-pre-wrap">
          {JSON.stringify(arg, bigIntReplacer, 2)}
        </pre>
      );
    } catch {
      return <span>{String(arg)}</span>;
    }
  }, [arg, isArray, isEthArray]);

  // Memoize Wei/ETH formatting
  const weiFormatted = useMemo(() => {
    if (!isWeiValue) return null;

    try {
      const wei = typeof arg === 'string' ? BigInt(arg) : (arg as bigint);
      const eth = formatEther(wei);

      return (
        <div className="flex flex-col">
          <span>{wei.toString()}</span>
          <span className="text-muted-foreground text-xs">({eth} ETH)</span>
        </div>
      );
    } catch {
      // Fallback to regular formatting if conversion fails
      if (typeof arg === 'bigint') {
        return <span>{arg.toString()}</span>;
      }
      return <span>{String(arg)}</span>;
    }
  }, [arg, isWeiValue]);

  // Memoize object formatting
  const objectFormatted = useMemo(() => {
    if (!isObject) return null;

    try {
      return (
        <pre className="break-all whitespace-pre-wrap">
          {JSON.stringify(arg, bigIntReplacer, 2)}
        </pre>
      );
    } catch {
      return <span>{String(arg)}</span>;
    }
  }, [arg, isObject]);

  // Handle null/undefined values
  if (arg === null || arg === undefined) {
    return <span className="text-muted-foreground">null</span>;
  }

  // Array handling - must come before object check since arrays are objects
  if (isArray) {
    // For arrays that might contain ETH values
    if (isEthArray) {
      return <div className="space-y-2">{ethArrayItems}</div>;
    }

    // Generic array handling
    return genericArrayFormatted;
  }

  // Check if this is likely an ETH value in Wei
  if (isWeiValue) {
    return weiFormatted;
  }

  // Handle specific primitive types
  if (typeof arg === 'bigint') {
    return <span>{arg.toString()}</span>;
  }

  if (typeof arg === 'boolean') {
    return <span>{arg ? 'true' : 'false'}</span>;
  }

  // Regular object handling
  if (isObject) {
    return objectFormatted;
  }

  // For raw calldata in signature mode
  if (typeof arg === 'string' && arg.match(/^[0-9a-fA-F]*$/)) {
    return (
      <div className="font-mono break-all">
        <span className="text-muted-foreground mr-2 text-sm font-medium">Raw Calldata:</span>
        {arg}
      </div>
    );
  }

  // Default string representation
  return <span className="break-all">{String(arg)}</span>;
});
