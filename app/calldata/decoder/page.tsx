import { CalldataDecoder } from '@/features/calldata-decoder';
import { PageTitle } from '@/components/shared/page-title';

export default function CalldataDecoderPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageTitle subtitle="Decode Ethereum transaction calldata into human-readable format">
        Calldata Decoder
      </PageTitle>
      <CalldataDecoder />
    </div>
  );
}
