import { CalldataDecoder } from "@/features/calldata-decoder";

export default function CalldataDecoderPage() {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Calldata Decoder</h1>
      <CalldataDecoder />
    </div>
  );
}