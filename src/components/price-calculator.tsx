'use client';

import React from 'react';
import { Project, calculatePrice, RAILING_STYLES } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface PriceCalculatorProps {
  project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
}

export function PriceCalculator({ project }: PriceCalculatorProps) {
  const breakdown = calculatePrice(project);
  const style = RAILING_STYLES.find((s) => s.id === project.railingStyle);

  const mountLabel = project.mountType === 'Bočno (V fasado)'
    ? 'Bočno'
    : project.mountType === 'Na stopnice'
    ? 'Stopnice'
    : project.mountType === 'Vogalni steber'
    ? 'Vogalni'
    : 'V tla';

  return (
    <Card className="border-amber-500/20 bg-gradient-to-br from-amber-950/20 to-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Kalkulacija cene
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Površina</span>
          <span>{breakdown.totalArea.toFixed(2)} m²</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Skupaj metrov (z 10% rezervo)</span>
          <span>{breakdown.totalMeters.toFixed(2)} m</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Cena na m² ({style?.name?.split('(')[0]?.trim()})</span>
          <span>{style?.pricePerM2 ?? 0} €/m²</span>
        </div>
        {breakdown.heightMultiplier > 1 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Višinski multiplikator</span>
            <span>×{breakdown.heightMultiplier.toFixed(3)}</span>
          </div>
        )}
        <Separator className="my-1" />
        <div className="flex justify-between">
          <span>Material (WPC + ALU)</span>
          <span>{breakdown.baseMaterialCost.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between">
          <span>Montaža ({mountLabel})</span>
          <span>{breakdown.mountingLabor.toFixed(2)} €</span>
        </div>
        <Separator className="my-1" />
        <div className="flex justify-between font-medium">
          <span>Vmesna vsota</span>
          <span>{breakdown.subtotal.toFixed(2)} €</span>
        </div>
        {project.discount > 0 && (
          <div className="flex justify-between text-green-400">
            <span>Popust ({project.discount}%)</span>
            <span>-{breakdown.discountAmount.toFixed(2)} €</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Brez DDV</span>
          <span>{breakdown.afterDiscount.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>DDV ({project.vatRate}%)</span>
          <span>{breakdown.vatAmount.toFixed(2)} €</span>
        </div>
        <Separator className="my-1" />
        <div className="flex justify-between font-bold text-amber-400 text-base">
          <span>Skupaj z DDV</span>
          <span>{breakdown.totalWithVat.toFixed(2)} €</span>
        </div>
      </CardContent>
    </Card>
  );
}
