import { CalldataEncoder } from '@/features/calldata-encoder';

export default function CalldataEncoderPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="mb-6 text-3xl font-bold">Calldata Encoder</h1>
      <CalldataEncoder />
    </div>
  );
}
