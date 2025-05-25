import { cookies } from 'next/headers';
import { CalldataDecoder } from '@/features/calldata-decoder';
import { PageTitle } from '@/components/shared/page-title';
import { JotaiProvider } from '@/providers/jotai-provider';
import type { SupportedChainName } from '@/lib/config/viem-client';

export default async function CalldataDecoderPage() {
  const cookieStore = await cookies();
  const savedNetwork = cookieStore.get('selected-network')?.value as SupportedChainName | undefined;
  const initialNetwork = savedNetwork || 'mainnet';

  return (
    <JotaiProvider initialNetwork={initialNetwork}>
      <div className="mx-auto w-full max-w-5xl">
        <PageTitle subtitle="Decode Ethereum transaction calldata into human-readable format">
          Calldata Decoder
        </PageTitle>
        <CalldataDecoder />
      </div>
    </JotaiProvider>
  );
}
