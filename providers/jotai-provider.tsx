'use client';

import { Provider } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import type { ReactNode } from 'react';
import { selectedNetworkAtom } from '@/features/calldata-decoder/atoms/calldata-atoms';
import type { SupportedChainName } from '@/lib/config/viem-client';

interface JotaiProviderProps {
  children: ReactNode;
  initialNetwork?: SupportedChainName;
}

function HydrateAtoms({
  children,
  initialNetwork,
}: {
  children: ReactNode;
  initialNetwork?: SupportedChainName;
}) {
  const atomsToHydrate: [typeof selectedNetworkAtom, SupportedChainName][] = [];

  if (initialNetwork) {
    atomsToHydrate.push([selectedNetworkAtom, initialNetwork]);
  }

  useHydrateAtoms(atomsToHydrate);
  return children;
}

export function JotaiProvider({ children, initialNetwork }: JotaiProviderProps) {
  return (
    <Provider>
      <HydrateAtoms initialNetwork={initialNetwork}>{children}</HydrateAtoms>
    </Provider>
  );
}
