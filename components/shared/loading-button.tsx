'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { type VariantProps } from 'class-variance-authority';
import { buttonVariants } from '@/components/ui/button';

interface LoadingButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  loadingText?: string;
  asChild?: boolean;
}

/**
 * Button component with loading state
 * Shows a spinner and loading text when isLoading is true
 */
export const LoadingButton = React.memo(function LoadingButton({
  isLoading = false,
  loadingText = 'Loading...',
  children,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <Button disabled={isLoading || disabled} {...props}>
      {isLoading ? (
        <>
          <span className="opacity-0">{children}</span>
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="border-background mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
            {loadingText}
          </span>
        </>
      ) : (
        children
      )}
    </Button>
  );
});