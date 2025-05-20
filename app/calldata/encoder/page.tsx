import { CalldataEncoder } from "@/features/calldata-encoder";

export default function CalldataEncoderPage() {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Calldata Encoder</h1>
      <CalldataEncoder />
    </div>
  );
}