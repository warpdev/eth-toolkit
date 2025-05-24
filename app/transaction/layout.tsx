import { EnhancedSidebar } from '@/components/layout/sidebar';
import {
  MobileNavigationWrapper,
  MainContentWrapper,
} from '@/components/layout/mobile-navigation-wrapper';

export default function TransactionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MobileNavigationWrapper className="flex w-full">
      <EnhancedSidebar />
      <MainContentWrapper className="p-6 pl-8 md:p-8 md:pl-16">{children}</MainContentWrapper>
    </MobileNavigationWrapper>
  );
}
