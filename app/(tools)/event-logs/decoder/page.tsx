import { cookies } from 'next/headers';
import { EventLogDecoder } from '@/features/event-log-decoder';
import { PageTitle } from '@/components/shared/page-title';
import { JotaiProvider } from '@/providers/jotai-provider';
import type { SupportedChainName } from '@/lib/config/viem-client';

export default async function EventLogDecoderPage() {
  const cookieStore = await cookies();
  const savedNetwork = cookieStore.get('selected-network')?.value as SupportedChainName | undefined;
  const initialNetwork = savedNetwork || 'mainnet';

  return (
    <JotaiProvider initialNetwork={initialNetwork}>
      <div className="mx-auto w-full max-w-5xl">
        <PageTitle subtitle="Decode Ethereum event logs with automatic signature detection">
          Event Log Decoder
        </PageTitle>
        <EventLogDecoder />
      </div>
    </JotaiProvider>
  );
}
