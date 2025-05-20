import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalldataDecoder } from "@/features/calldata-decoder";
import { CalldataEncoder } from "@/features/calldata-encoder";
import { EnhancedSidebar } from "@/components/layout/sidebar";

export default function Home() {
  return (
    <div className="flex h-screen w-full">
      <EnhancedSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="w-full max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Ethereum Developer Toolkit</h1>
          
          <Tabs defaultValue="decoder" className="mb-8">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="decoder">Calldata Decoder</TabsTrigger>
              <TabsTrigger value="encoder">Calldata Encoder</TabsTrigger>
            </TabsList>
            <TabsContent value="decoder">
              <CalldataDecoder />
            </TabsContent>
            <TabsContent value="encoder">
              <CalldataEncoder />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}