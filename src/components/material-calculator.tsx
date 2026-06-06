'use client';

import React, { useState, useMemo } from 'react';
import { RAILING_STYLES, WPC_COLORS, WPC_PROFILES, INSTALLATION_SPECS, WpcProfile, RailingStyle } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { calculateConcrete, calculateMarkup, calculateFence } from '@buildvisionai/construction-calculators';
import {
  Calculator,
  Ruler,
  Package,
  ArrowRight,
  AlertTriangle,
  ShoppingCart,
  Cuboid,
  DollarSign,
  Fence,
} from 'lucide-react';

interface MaterialItem {
  name: string;
  specification: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  note?: string;
}

export function MaterialCalculator() {
  const [lengthCm, setLengthCm] = useState(600);
  const [heightCm, setHeightCm] = useState(110);
  const [widthCm, setWidthCm] = useState(0);
  const [wpcProfile, setWpcProfile] = useState<WpcProfile>('WOODCORE_TEAK');
  const [railingStyle, setRailingStyle] = useState<RailingStyle>('WPC_H_LINE');
  const [mountType, setMountType] = useState<'v-tla' | 'bocno' | 'stopnice'>('v-tla');
  const [cornerPosts, setCornerPosts] = useState(2);
  const [showResults, setShowResults] = useState(false);

  const wpcColor = WPC_COLORS.find((c) => c.id === wpcProfile);
  const wpcProfileInfo = WPC_PROFILES.find((p) => p.id === wpcProfile);
  const style = RAILING_STYLES.find((s) => s.id === railingStyle);

  const materials = useMemo<MaterialItem[]>(() => {
    if (lengthCm <= 0 || heightCm <= 0) return [];

    const items: MaterialItem[] = [];
    const totalRunM = (lengthCm + 2 * widthCm) / 100;
    const runMwithWaste = totalRunM * 1.1;

    // 1. Stebrički
    const maxSpacing = INSTALLATION_SPECS.maxPostSpacing; // 150cm
    const intermediatePosts = Math.max(0, Math.ceil(lengthCm / maxSpacing) - 1);
    const widthPosts = widthCm > 0 ? Math.max(0, Math.ceil(widthCm / maxSpacing) - 1) * 2 : 0;
    const totalPosts = cornerPosts + intermediatePosts + widthPosts;
    const postSize = railingStyle === 'WPC_STEKLO' ? '50×50mm' : '40×40mm';
    const postPrice = railingStyle === 'WPC_STEKLO' ? 45 : 32;

    items.push({
      name: 'ALU Steber',
      specification: `${postSize} × ${heightCm}mm, RAL ${mountType === 'bocno' ? 'sidranje bočno' : 'sidranje v tla'}`,
      quantity: totalPosts,
      unit: 'kos',
      unitPrice: postPrice,
      totalPrice: totalPosts * postPrice,
      note: `Razmik max ${maxSpacing}cm: ${cornerPosts} vogalni + ${intermediatePosts} vmesni${widthPosts > 0 ? ` + ${widthPosts} stranski` : ''}`,
    });

    // 2. Podstavki stebričkov
    const basePrice = mountType === 'bocno' ? 18 : 14;
    items.push({
      name: `Podstavek stebra (${mountType === 'bocno' ? 'Bočni' : 'Talni'})`,
      specification: mountType === 'bocno' ? 'Bočno sidranje v fasado' : 'Podnožje za sidranje v beton',
      quantity: totalPosts,
      unit: 'kos',
      unitPrice: basePrice,
      totalPrice: totalPosts * basePrice,
    });

    // 3. WPC Letve
    const boardLength = wpcProfileInfo?.lengthM ?? 2.2;
    const boardWidthMm = wpcProfileInfo?.dimensions?.includes('180') ? 180 : 140;
    const gapMm = INSTALLATION_SPECS.railingGap; // 110mm
    const effectiveWidthMm = boardWidthMm + gapMm;
    const heightMm = heightCm * 10;
    const boardsPerSegment = Math.ceil(heightMm / effectiveWidthMm);
    const segments = totalPosts - 1 + (widthCm > 0 ? Math.max(0, Math.ceil(widthCm / maxSpacing)) : 0);
    const totalBoards = boardsPerSegment * segments;

    // Calculate boards needed from standard lengths
    const runLengthM = lengthCm / 100;
    const boardsPerLength = Math.max(1, Math.floor(boardLength / runLengthM));
    const boardPackages = Math.ceil(totalBoards / boardsPerLength);
    const boardPricePerM = wpcProfileInfo?.pricePerM2 ?? 89;

    // Apply promo discounts
    let boardDiscount = 0;
    let discountNote = '';
    if (boardLength <= 2.2) {
      boardDiscount = 0.30;
      discountNote = ' (Akcija -30% na 2.2m)';
    } else if (boardLength <= 4.0) {
      boardDiscount = 0.15;
      discountNote = ' (Akcija -15% na 4m)';
    }

    const boardPricePerPiece = (boardLength * boardPricePerM * (boardWidthMm / 1000)) * (1 - boardDiscount);
    const exactBoards = Math.ceil(runLengthM * boardsPerSegment / boardLength) * segments;

    items.push({
      name: `WPC Letve ${wpcColor?.name || ''}`,
      specification: `${wpcProfileInfo?.dimensions || '140×23mm'} × ${boardLength}m, ${wpcProfileInfo?.surfaceType || 'WoodGrain'}`,
      quantity: exactBoards,
      unit: 'kos',
      unitPrice: Math.round(boardPricePerPiece * 100) / 100,
      totalPrice: Math.round(exactBoards * boardPricePerPiece * 100) / 100,
      note: `${boardsPerSegment} letev na segment × ${segments} segmentov${discountNote}`,
    });

    // 4. Nosilci (support brackets)
    const supportSpacing = INSTALLATION_SPECS.supportSpacing; // 100cm
    const supportsPerSegment = Math.ceil(runLengthM * 100 / supportSpacing) + 1;
    const totalSupports = supportsPerSegment * boardsPerSegment * (totalPosts - 1 + (widthCm > 0 ? 1 : 0));

    items.push({
      name: 'Nosilec za WPC letve',
      specification: 'ALU nosilec z vijakom A2',
      quantity: totalSupports,
      unit: 'kos',
      unitPrice: 4.5,
      totalPrice: totalSupports * 4.5,
      note: `Razmik max ${supportSpacing}cm, ${boardsPerSegment} vrstic × ${supportsPerSegment} na segment`,
    });

    // 5. Pokrovi stebričkov
    items.push({
      name: 'Pokrov stebra',
      specification: 'ALU pokrov z tesnilom',
      quantity: totalPosts,
      unit: 'kos',
      unitPrice: 6.5,
      totalPrice: totalPosts * 6.5,
    });

    // 6. Sidra
    const anchorPerPost = mountType === 'bocno' ? 4 : 2;
    items.push({
      name: 'Kemični sidri',
      specification: 'M12 × 100mm, A4 inox',
      quantity: totalPosts * anchorPerPost,
      unit: 'kos',
      unitPrice: 3.2,
      totalPrice: totalPosts * anchorPerPost * 3.2,
      note: `${anchorPerPost} sidra na steber`,
    });

    // 7. Vijaki
    items.push({
      name: 'Vijaki A2 Inox',
      specification: 'M6×25mm + podložke (100 kosov)',
      quantity: Math.ceil(totalSupports / 100),
      unit: 'paket',
      unitPrice: 12,
      totalPrice: Math.ceil(totalSupports / 100) * 12,
    });

    // 8. Tesnila
    items.push({
      name: 'Tesnilne letvice',
      specification: 'EPDM guma, 10m role',
      quantity: Math.ceil(runLengthM / 10) + (widthCm > 0 ? Math.ceil(widthCm / 100 / 10) * 2 : 0),
      unit: 'role',
      unitPrice: 8,
      totalPrice: (Math.ceil(runLengthM / 10) + (widthCm > 0 ? Math.ceil(widthCm / 100 / 10) * 2 : 0)) * 8,
    });

    return items;
  }, [lengthCm, heightCm, widthCm, wpcProfile, railingStyle, mountType, cornerPosts, wpcColor, wpcProfileInfo, style]);

  const totalMaterialCost = materials.reduce((sum, m) => sum + m.totalPrice, 0);

  if (!showResults) {
    return (
      <Card className="border-amber-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calculator className="w-4 h-4 text-amber-500" />
            Materialni kalkulator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Izračunajte potrebno količino materiala za WPC WoodCore ograjo. Vnesite dimenzije in dobite seznam vseh potrebnih komponent.
          </p>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Dolžina (cm)</Label>
              <Input
                type="number"
                value={lengthCm || ''}
                onChange={(e) => setLengthCm(parseInt(e.target.value) || 0)}
                className="h-9 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Višina (cm)</Label>
              <Input
                type="number"
                value={heightCm || ''}
                onChange={(e) => setHeightCm(parseInt(e.target.value) || 0)}
                className="h-9 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Širina (cm)</Label>
              <Input
                type="number"
                value={widthCm || ''}
                onChange={(e) => setWidthCm(parseInt(e.target.value) || 0)}
                className="h-9 mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">WPC Barva</Label>
              <div className="grid grid-cols-4 gap-1 mt-1">
                {WPC_COLORS.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setWpcProfile(color.id)}
                    className={`p-1 rounded border text-[9px] transition-all ${
                      wpcProfile === color.id
                        ? 'border-amber-500 bg-amber-600/10'
                        : 'border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div
                      className="w-full h-3 rounded mb-0.5"
                      style={{ backgroundColor: color.hexColor }}
                    />
                    {color.name.split(' ').pop()}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs">Sistem</Label>
              <select
                value={railingStyle}
                onChange={(e) => setRailingStyle(e.target.value as RailingStyle)}
                className="w-full h-9 mt-1 rounded-md border border-white/10 bg-card px-2 text-xs"
              >
                {RAILING_STYLES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.pricePerM2}€/m²)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Način montaže</Label>
              <div className="flex gap-1.5 mt-1">
                {[
                  { id: 'v-tla', label: 'V tla' },
                  { id: 'bocno', label: 'Bočno' },
                  { id: 'stopnice', label: 'Stopnice' },
                ].map((mt) => (
                  <button
                    key={mt.id}
                    onClick={() => setMountType(mt.id as typeof mountType)}
                    className={`flex-1 py-1.5 rounded text-[10px] font-medium transition-colors ${
                      mountType === mt.id
                        ? 'bg-amber-600 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {mt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs">Vogalni stebrički</Label>
              <Input
                type="number"
                value={cornerPosts}
                onChange={(e) => setCornerPosts(parseInt(e.target.value) || 2)}
                className="h-9 mt-1"
                min={0}
                max={10}
              />
            </div>
          </div>

          <Button
            onClick={() => setShowResults(true)}
            disabled={lengthCm <= 0 || heightCm <= 0}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Izračunaj material
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Package className="w-4 h-4 text-amber-500" />
          Seznam materiala
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Summary */}
        <div className="bg-muted/30 rounded-lg p-3 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dimenzije</span>
            <span>{lengthCm}×{heightCm}{widthCm > 0 ? `×${widthCm}` : ''} cm</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">WPC Barva</span>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: wpcColor?.hexColor }} />
              <span>{wpcColor?.name}</span>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sistem</span>
            <span>{style?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Skupna dolžina</span>
            <span>{((lengthCm + 2 * widthCm) / 100).toFixed(1)} m</span>
          </div>
        </div>

        {/* Promo banner */}
        <div className="bg-gradient-to-r from-red-950/30 to-amber-950/20 border border-red-500/20 rounded-lg p-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="text-[10px] text-red-300">
            Akcija ROKSAL: -30% na 2.2m plošče | -15% na 4m plošče
          </span>
        </div>

        {/* Material list */}
        <div className="space-y-2">
          {materials.map((item, idx) => (
            <div key={idx} className="bg-card/50 rounded-lg p-2.5 space-y-1">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-medium flex items-center gap-1.5">
                    <ArrowRight className="w-3 h-3 text-amber-400" />
                    {item.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground ml-5">
                    {item.specification}
                  </div>
                  {item.note && (
                    <div className="text-[10px] text-amber-400/80 ml-5 mt-0.5">
                      {item.note}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-amber-400">
                    {item.totalPrice.toFixed(2)} €
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {item.quantity} × {item.unitPrice.toFixed(2)} €/{item.unit}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between items-center font-bold text-sm">
          <span>Skupaj material</span>
          <span className="text-amber-400 text-base">{totalMaterialCost.toFixed(2)} €</span>
        </div>
        <div className="text-[10px] text-muted-foreground">
          Z DDV (9.5%): <strong>{(totalMaterialCost * 1.095).toFixed(2)} €</strong> | Z DDV (22%): <strong>{(totalMaterialCost * 1.22).toFixed(2)} €</strong>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => setShowResults(false)}
            className="flex-1 h-9 text-xs"
          >
            Spremeni parametre
          </Button>
          <Button
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white h-9 text-xs"
            onClick={() => {
              // Copy material list to clipboard
              const text = materials.map((m) =>
                `${m.name}: ${m.quantity} ${m.unit} × ${m.unitPrice.toFixed(2)}€ = ${m.totalPrice.toFixed(2)}€`
              ).join('\n') + `\n\nSKUPAJ: ${totalMaterialCost.toFixed(2)} €`;
              navigator.clipboard.writeText(text);
            }}
          >
            <ShoppingCart className="w-3 h-3 mr-1" />
            Kopiraj seznam
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ConcreteCalculator() {
  const [shape, setShape] = useState<'rectangular' | 'circular'>('rectangular');
  const [length, setLength] = useState(5);
  const [width, setWidth] = useState(3);
  const [radius, setRadius] = useState(2);
  const [depth, setDepth] = useState(0.15);
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');

  const result = useMemo(() => {
    if (depth <= 0) return null;
    if (shape === 'rectangular' && (!length || length <= 0 || !width || width <= 0)) return null;
    if (shape === 'circular' && (!radius || radius <= 0)) return null;
    return calculateConcrete({ shape, length, width, radius, depth, units });
  }, [shape, length, width, radius, depth, units]);

  return (
    <Card className="border-blue-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Cuboid className="w-4 h-4 text-blue-500" />
            Beton kalkulator
          </CardTitle>
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-blue-500/30 text-blue-400">
            BuildVision AI
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px] text-muted-foreground">Oblika</Label>
            <div className="flex gap-1 mt-1">
              {(['rectangular', 'circular'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setShape(s)}
                  className={`flex-1 py-1.5 rounded text-[10px] font-medium transition-colors ${
                    shape === s ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {s === 'rectangular' ? 'Pravokotna' : 'Krožna'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Enote</Label>
            <div className="flex gap-1 mt-1">
              {(['metric', 'imperial'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnits(u)}
                  className={`flex-1 py-1.5 rounded text-[10px] font-medium transition-colors ${
                    units === u ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {u === 'metric' ? 'Metric' : 'Imperial'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={`grid ${shape === 'rectangular' ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
          {shape === 'rectangular' && (
            <>
              <div>
                <Label className="text-[10px] text-muted-foreground">Dolžina ({units === 'metric' ? 'm' : 'ft'})</Label>
                <Input type="number" value={length || ''} onChange={(e) => setLength(parseFloat(e.target.value) || 0)} className="h-8 mt-1 text-xs" />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Širina ({units === 'metric' ? 'm' : 'ft'})</Label>
                <Input type="number" value={width || ''} onChange={(e) => setWidth(parseFloat(e.target.value) || 0)} className="h-8 mt-1 text-xs" />
              </div>
            </>
          )}
          {shape === 'circular' && (
            <div>
              <Label className="text-[10px] text-muted-foreground">Radij ({units === 'metric' ? 'm' : 'ft'})</Label>
              <Input type="number" value={radius || ''} onChange={(e) => setRadius(parseFloat(e.target.value) || 0)} className="h-8 mt-1 text-xs" />
            </div>
          )}
          <div>
            <Label className="text-[10px] text-muted-foreground">Globina ({units === 'metric' ? 'm' : 'ft'})</Label>
            <Input type="number" value={depth || ''} onChange={(e) => setDepth(parseFloat(e.target.value) || 0)} className="h-8 mt-1 text-xs" step="0.01" />
          </div>
        </div>

        {result && (
          <>
            <Separator />
            <div className="bg-blue-950/20 rounded-lg p-2.5 space-y-1.5">
              <div className="text-[10px] font-semibold text-blue-400 mb-1.5">Rezultati</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prostornina</span>
                  <span className="font-medium">{result.volumeCuM.toFixed(3)} m³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prostornina</span>
                  <span className="font-medium">{result.volumeCuFt.toFixed(2)} ft³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vrečke cementa</span>
                  <span className="font-medium text-blue-300">{result.bagsNeeded.toFixed(0)} kos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pesek</span>
                  <span className="font-medium">{result.sand.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gramoz</span>
                  <span className="font-medium">{result.gravel.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Voda</span>
                  <span className="font-medium">{result.water.toFixed(1)} L</span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function ProfitCalculator() {
  const [costs, setCosts] = useState(1000);
  const [markupPercent, setMarkupPercent] = useState(20);

  const result = useMemo(() => {
    if (costs <= 0 || markupPercent < 0) return null;
    return calculateMarkup({ costs, markupPercent });
  }, [costs, markupPercent]);

  return (
    <Card className="border-green-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-500" />
            Profit kalkulator
          </CardTitle>
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-green-500/30 text-green-400">
            BuildVision AI
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px] text-muted-foreground">Stroški (€)</Label>
            <Input type="number" value={costs || ''} onChange={(e) => setCosts(parseFloat(e.target.value) || 0)} className="h-8 mt-1 text-xs" />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Pribitek (%)</Label>
            <Input type="number" value={markupPercent || ''} onChange={(e) => setMarkupPercent(parseFloat(e.target.value) || 0)} className="h-8 mt-1 text-xs" step="0.5" />
          </div>
        </div>

        {result && (
          <>
            <Separator />
            <div className="bg-green-950/20 rounded-lg p-2.5 space-y-2">
              <div className="text-[10px] font-semibold text-green-400">Rezultati</div>
              <div className="grid grid-cols-1 gap-1.5 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Skupaj s pribitkom</span>
                  <span className="font-bold text-green-300">{result.totalWithMarkup.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dobiček</span>
                  <span className="font-medium">{result.profit.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Marža</span>
                  <span className="font-medium">{result.profitMarginPercent.toFixed(1)}%</span>
                </div>
              </div>
              {result.profitMarginPercent > 30 && (
                <div className="bg-green-900/30 border border-green-500/20 rounded p-1.5 text-[9px] text-green-300">
                  ✓ Zdrava marža nad 30%
                </div>
              )}
              {result.profitMarginPercent < 10 && result.profitMarginPercent > 0 && (
                <div className="bg-red-900/30 border border-red-500/20 rounded p-1.5 text-[9px] text-red-300">
                  ⚠ Nizka marža pod 10%
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function FenceCalculator() {
  const [linearLength, setLinearLength] = useState(30);
  const [postSpacing, setPostSpacing] = useState(2.4);
  const [height, setHeight] = useState(1.8);
  const [gates, setGates] = useState(1);
  const [fenceType, setFenceType] = useState<'wood' | 'vinyl' | 'chain_link' | 'aluminum' | 'split_rail'>('wood');
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');

  const result = useMemo(() => {
    if (linearLength <= 0 || postSpacing <= 0 || height <= 0) return null;
    return calculateFence({ linearLength, postSpacing, height, gates, fenceType, units });
  }, [linearLength, postSpacing, height, gates, fenceType, units]);

  const fenceTypeLabels: Record<string, string> = {
    wood: 'Les',
    vinyl: 'Vinil',
    chain_link: 'Pletivo',
    aluminum: 'Aluminij',
    split_rail: 'Loč. ograja',
  };

  return (
    <Card className="border-amber-700/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Fence className="w-4 h-4 text-amber-600" />
            Ograjni kalkulator
          </CardTitle>
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-amber-600/30 text-amber-500">
            BuildVision AI
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px] text-muted-foreground">Tip ograje</Label>
            <div className="grid grid-cols-3 gap-1 mt-1">
              {(['wood', 'vinyl', 'chain_link', 'aluminum', 'split_rail'] as const).map((ft) => (
                <button
                  key={ft}
                  onClick={() => setFenceType(ft)}
                  className={`py-1 rounded text-[9px] font-medium transition-colors ${
                    fenceType === ft ? 'bg-amber-700 text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {fenceTypeLabels[ft]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Enote</Label>
            <div className="flex gap-1 mt-1">
              {(['metric', 'imperial'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnits(u)}
                  className={`flex-1 py-1.5 rounded text-[10px] font-medium transition-colors ${
                    units === u ? 'bg-amber-700 text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {u === 'metric' ? 'Metric' : 'Imperial'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px] text-muted-foreground">Dolžina ({units === 'metric' ? 'm' : 'ft'})</Label>
            <Input type="number" value={linearLength || ''} onChange={(e) => setLinearLength(parseFloat(e.target.value) || 0)} className="h-8 mt-1 text-xs" />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Razmik stebrov ({units === 'metric' ? 'm' : 'ft'})</Label>
            <Input type="number" value={postSpacing || ''} onChange={(e) => setPostSpacing(parseFloat(e.target.value) || 0)} className="h-8 mt-1 text-xs" step="0.1" />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Višina ({units === 'metric' ? 'm' : 'ft'})</Label>
            <Input type="number" value={height || ''} onChange={(e) => setHeight(parseFloat(e.target.value) || 0)} className="h-8 mt-1 text-xs" step="0.1" />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Vrata</Label>
            <Input type="number" value={gates} onChange={(e) => setGates(parseInt(e.target.value) || 0)} className="h-8 mt-1 text-xs" min={0} />
          </div>
        </div>

        {result && (
          <>
            <Separator />
            <div className="bg-amber-950/20 rounded-lg p-2.5 space-y-1.5">
              <div className="text-[10px] font-semibold text-amber-500 mb-1.5">Rezultati</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stebri</span>
                  <span className="font-medium">{result.posts} kos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vodila</span>
                  <span className="font-medium">{result.rails} kos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deske</span>
                  <span className="font-medium">{result.pickets} kos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paneli</span>
                  <span className="font-medium">{result.panels} kos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vrečke betona</span>
                  <span className="font-medium">{result.concreteBags} kos</span>
                </div>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">Cena (ocena)</span>
                <span className="font-bold text-amber-400">
                  {result.costMin.toFixed(0)} – {result.costMax.toFixed(0)} {units === 'metric' ? '€' : '$'}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
