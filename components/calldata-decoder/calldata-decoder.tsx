"use client";

import React, { useRef } from "react";
import { DecoderForm } from "./decoder-form";
import { DecoderOutput } from "./decoder-output";

export function CalldataDecoder() {
  const resultRef = useRef<HTMLDivElement>(null);
  
  const scrollToResult = () => {
    resultRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <DecoderForm onDecodeSuccess={scrollToResult} />
      <div ref={resultRef}>
        <DecoderOutput />
      </div>
    </div>
  );
}