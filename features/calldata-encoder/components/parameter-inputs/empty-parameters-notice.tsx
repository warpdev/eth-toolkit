'use client';

import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function EmptyParametersNotice() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Function Parameters</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">This function does not require any parameters.</p>
      </CardContent>
    </Card>
  );
}
