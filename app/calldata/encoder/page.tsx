import { CalldataEncoder } from '@/features/calldata-encoder';
import { PageTitle } from '@/components/shared/page-title';

export default function CalldataEncoderPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageTitle subtitle="Generate Ethereum transaction calldata from ABI and parameters">
        Calldata Encoder
      </PageTitle>
      <CalldataEncoder />
    </div>
  );
}
