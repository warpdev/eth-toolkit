import { CalldataDecoder } from '@/features/calldata-decoder';

export default function CalldataDecoderPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="mb-6 text-3xl font-bold">Calldata Decoder</h1>
      <CalldataDecoder />
    </div>
  );
}
