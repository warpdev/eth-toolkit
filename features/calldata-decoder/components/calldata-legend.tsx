'use client';

interface LegendItemProps {
  color: string;
  label: string;
}

function LegendItem({ color, label }: LegendItemProps) {
  return (
    <div className="flex items-center">
      <span className={`mr-1 inline-block h-3 w-3 ${color}`}></span>
      <span>{label}</span>
    </div>
  );
}

export function CalldataLegend() {
  return (
    <div className="mt-3 flex w-full flex-wrap gap-2 text-xs">
      <LegendItem color="bg-primary/20" label="Function Signature" />
      <LegendItem color="bg-blue-500/20" label="Address" />
      <LegendItem color="bg-green-500/20" label="Numbers" />
      <LegendItem color="bg-purple-500/20" label="Boolean" />
      <LegendItem color="bg-orange-500/20" label="Strings/Bytes" />
      <LegendItem color="bg-yellow-500/20" label="Offset Pointers" />
      <LegendItem color="bg-pink-500/20" label="Arrays" />
    </div>
  );
}
