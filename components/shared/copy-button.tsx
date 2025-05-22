'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { copyToClipboard } from '@/lib/utils';
import { toast } from 'sonner';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  tooltipText?: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  className?: string;
  successMessage?: string;
}

export function CopyButton({
  text,
  tooltipText = 'Copy to clipboard',
  size = 'sm',
  className = '',
  successMessage = 'Copied to clipboard!',
}: CopyButtonProps) {
  const [copying, setCopying] = useState(false);

  const handleCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (copying) return;

      setCopying(true);
      const success = await copyToClipboard(text);

      if (success) {
        toast.success(successMessage);
      } else {
        toast.error('Failed to copy text');
      }

      setTimeout(() => setCopying(false), 1000);
    },
    [copying, text, successMessage]
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size={size}
            className={`h-7 p-1 transition-all focus:ring-1 ${className}`}
            onClick={handleCopy}
          >
            {copying ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="sr-only">{tooltipText}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
