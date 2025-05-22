'use client';

import * as React from 'react';
import { siEthereum } from 'simple-icons';

type IconProps = {
  size?: number;
  className?: string;
};

/**
 * Ethereum Icon component
 * Consistent icon used across sidebar and navigation components
 */
export const EthereumIcon = React.memo(({ className, size = 24 }: IconProps) => (
  <svg
    className={className}
    role="img"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Ethereum"
    width={size}
    height={size}
  >
    <path d={siEthereum.path} />
  </svg>
));

EthereumIcon.displayName = 'EthereumIcon';
