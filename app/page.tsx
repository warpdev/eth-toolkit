import { CalldataDecoder } from "@/features/calldata-decoder";
import { EnhancedSidebar } from "@/components/layout/sidebar";

export default function Home() {
  return (
    <div className="flex h-screen w-full">
      <EnhancedSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="w-full max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Ethereum Developer Toolkit</h1>
          <CalldataDecoder />
        </div>
      </main>
    </div>
  );
}