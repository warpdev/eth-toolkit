import { CalldataDecoder } from "@/components/calldata-decoder/calldata-decoder";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8">
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-bold mb-6">Ethereum Developer Toolkit</h1>
        <CalldataDecoder />
      </div>
    </main>
  );
}