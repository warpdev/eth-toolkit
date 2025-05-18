"use client";

import React from "react";
import { DecoderForm } from "./decoder-form";
import { DecoderOutput } from "./decoder-output";

export function CalldataDecoder() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <DecoderForm />
      <DecoderOutput />
    </div>
  );
}