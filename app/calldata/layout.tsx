import { EnhancedSidebar } from '@/components/layout/sidebar';
import {
  MobileNavigationWrapper,
  MainContentWrapper,
} from '@/components/layout/mobile-navigation-wrapper';

export default function CalldataLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MobileNavigationWrapper>
      <div className="flex h-screen w-full">
        <EnhancedSidebar />
        <MainContentWrapper className="p-4 md:p-8">{children}</MainContentWrapper>
      </div>
    </MobileNavigationWrapper>
  );
}
