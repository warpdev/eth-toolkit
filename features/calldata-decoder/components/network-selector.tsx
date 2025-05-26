'use client';

import React, { useState, useCallback } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { ChevronsUpDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import {
  SUPPORTED_CHAINS,
  type SupportedChainName,
  type NetworkType,
  getNetworksByType,
  DEFAULT_NETWORKS,
} from '@/lib/config/viem-client';
import { setSelectedNetwork as saveNetworkToCookie } from '@/lib/utils/cookie-utils';
import { cn } from '@/lib/utils';
import {
  selectedNetworkAtom,
  networkTypeAtom,
} from '@/features/calldata-decoder/atoms/calldata-atoms';

interface NetworkTypeButtonProps {
  type: NetworkType;
  isSelected: boolean;
  onClick: () => void;
}

const NetworkTypeButton = React.memo(function NetworkTypeButton({
  type,
  isSelected,
  onClick,
}: NetworkTypeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex-1 px-3 py-2 text-sm font-medium transition-colors',
        'hover:text-foreground active:transform-none',
        isSelected ? 'text-foreground' : 'text-muted-foreground'
      )}
    >
      {type === 'mainnet' ? 'Mainnet' : 'Testnet'}
    </button>
  );
});

interface NetworkSelectorProps {
  className?: string;
}

export const NetworkSelector = React.memo(function NetworkSelector({
  className,
}: NetworkSelectorProps) {
  const [selectedNetwork, setSelectedNetwork] = useAtom(selectedNetworkAtom);
  const selectedNetworkType = useAtomValue(networkTypeAtom);
  const [isNetworkSelectorOpen, setIsNetworkSelectorOpen] = useState(false);

  const handleNetworkTypeChange = useCallback(
    (newType: NetworkType) => {
      setSelectedNetwork(DEFAULT_NETWORKS[newType]);
    },
    [setSelectedNetwork]
  );

  React.useEffect(() => {
    saveNetworkToCookie(selectedNetwork);
  }, [selectedNetwork]);

  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-medium">Network</label>
      <Popover open={isNetworkSelectorOpen} onOpenChange={setIsNetworkSelectorOpen} modal>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isNetworkSelectorOpen}
            className="w-full justify-between"
          >
            {selectedNetwork ? SUPPORTED_CHAINS[selectedNetwork]?.name : 'Select network'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0" align="start">
          <Tabs
            value={selectedNetworkType}
            onValueChange={(value) => handleNetworkTypeChange(value as NetworkType)}
            className="w-full"
          >
            <div className="relative flex border-b">
              <NetworkTypeButton
                type="mainnet"
                isSelected={selectedNetworkType === 'mainnet'}
                onClick={() => handleNetworkTypeChange('mainnet')}
              />
              <NetworkTypeButton
                type="testnet"
                isSelected={selectedNetworkType === 'testnet'}
                onClick={() => handleNetworkTypeChange('testnet')}
              />
              <div
                className={cn(
                  'bg-primary absolute bottom-0 h-0.5 transition-transform duration-200 ease-out',
                  'w-1/2',
                  selectedNetworkType === 'mainnet' ? 'translate-x-0' : 'translate-x-full'
                )}
              />
            </div>
            <TabsContent value="mainnet" className="mt-0 p-0">
              <div>
                {getNetworksByType('mainnet').map((networkKey) => (
                  <button
                    key={networkKey}
                    className={cn(
                      'hover:bg-accent flex w-full items-center px-3 py-2 text-sm transition-colors',
                      selectedNetwork === networkKey
                        ? 'bg-accent text-accent-foreground'
                        : 'text-foreground'
                    )}
                    onClick={() => {
                      setSelectedNetwork(networkKey as SupportedChainName);
                      setIsNetworkSelectorOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedNetwork === networkKey ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {SUPPORTED_CHAINS[networkKey].name}
                  </button>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="testnet" className="mt-0 p-0">
              <div>
                {getNetworksByType('testnet').map((networkKey) => (
                  <button
                    key={networkKey}
                    className={cn(
                      'hover:bg-accent flex w-full items-center px-3 py-2 text-sm transition-colors',
                      selectedNetwork === networkKey
                        ? 'bg-accent text-accent-foreground'
                        : 'text-foreground'
                    )}
                    onClick={() => {
                      setSelectedNetwork(networkKey as SupportedChainName);
                      setIsNetworkSelectorOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedNetwork === networkKey ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {SUPPORTED_CHAINS[networkKey].name}
                  </button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
    </div>
  );
});
