import { cn } from '@/lib/utils';

interface PageTitleProps {
  children: React.ReactNode;
  className?: string;
  subtitle?: string;
}

/**
 * Reusable page title component with consistent styling
 */
export function PageTitle({ children, className, subtitle }: PageTitleProps) {
  return (
    <div className="mb-6">
      <h1 className={cn('text-3xl font-bold', className)}>{children}</h1>
      {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
    </div>
  );
}
