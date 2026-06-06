'use client';

import React, { useState, useMemo } from 'react';
import { RAILING_STYLES, WPC_COLORS, WPC_PROFILES, INSTALLATION_SPECS, WpcProfile, RailingStyle } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calculator,
  Ruler,
  Package,
  ArrowRight,
  AlertTriangle,
  ShoppingCart,
  Construction,
  Droplets,
  BarChart3,
} from 'lucide-react';
import { calculateFence, calculateConcrete, calculateMarkup, type FenceInput, type ConcreteInput } from '@buildvisionai/construction-calculators';

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

// ─── Beton Kalkulator (construction-calculators) ────────────────────────

export function ConcreteCalculator() {
  const [shape, setShape] = useState<'rectangular' | 'circular'>('rectangular');
  const [lengthM, setLengthM] = useState(3);
  const [widthM, setWidthM] = useState(0.3);
  const [depthM, setDepthM] = useState(0.5);
  const [radiusM, setRadiusM] = useState(0.15);

  const result = useMemo(() => {
    const input: ConcreteInput = {
      shape,
      length: shape === 'rectangular' ? lengthM : undefined,
      width: shape === 'rectangular' ? widthM : undefined,
      radius: shape === 'circular' ? radiusM : undefined,
      depth: depthM,
      units: 'metric',
    };
    return calculateConcrete(input);
  }, [shape, lengthM, widthM, depthM, radiusM]);

  return (
    <Card className="border-blue-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-400" />
          Beton kalkulator
          <Badge variant="outline" className="text-[8px] ml-1">BuildVision AI</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-1.5">
          {(['rectangular', 'circular'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setShape(s)}
              className={`flex-1 py-1.5 rounded text-[10px] font-medium transition-colors ${
                shape === s ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'
              }`}
            >
              {s === 'rectangular' ? 'Pravokotnik' : 'Krožni'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {shape === 'rectangular' ? (
            <>
              <div>
                <Label className="text-xs">Dolžina (m)</Label>
                <Input type="number" step="0.1" value={lengthM || ''} onChange={(e) => setLengthM(parseFloat(e.target.value) || 0)} className="h-8 mt-1 text-xs" />
              </div>
              <div>
                <Label className="text-xs">Širina (m)</Label>
                <Input type="number" step="0.1" value={widthM || ''} onChange={(e) => setWidthM(parseFloat(e.target.value) || 0)} className="h-8 mt-1 text-xs" />
              </div>
            </>
          ) : (
            <div>
              <Label className="text-xs">Polmer (m)</Label>
              <Input type="number" step="0.1" value={radiusM || ''} onChange={(e) => setRadiusM(parseFloat(e.target.value) || 0)} className="h-8 mt-1 text-xs" />
            </div>
          )}
          <div>
            <Label className="text-xs">Globina (m)</Label>
            <Input type="number" step="0.1" value={depthM || ''} onChange={(e) => setDepthM(parseFloat(e.target.value) || 0)} className="h-8 mt-1 text-xs" />
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-2.5 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Prostornina</span>
            <span className="font-medium">{result.volumeCuM.toFixed(3)} m³ ({result.volumeCuFt.toFixed(1)} ft³)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Vreče betona (40kg)</span>
            <span className="font-bold text-blue-400">{result.bagsNeeded} kos</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pesek</span>
            <span>{result.sand.toFixed(2)} m³</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Gramoz</span>
            <span>{result.gravel.toFixed(2)} m³</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Voda</span>
            <span>{result.water.toFixed(1)} L</span>
          </div>
        </div>

        <div className="text-[10px] text-muted-foreground bg-blue-950/20 rounded p-2">
          💡 Uporaba: Izračunajte beton za sidranje stebričkov v tla. Ena jamica ~30×30×50cm = 0.045m³ ≈ 4 vreče.
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Profit Kalkulator (markup calculator) ──────────────────────────────

export function ProfitCalculator() {
  const [costs, setCosts] = useState(2500);
  const [markupPercent, setMarkupPercent] = useState(30);

  const markupResult = useMemo(() => {
    return calculateMarkup({ costs, markupPercent });
  }, [costs, markupPercent]);

  return (
    <Card className="border-green-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-green-400" />
          Profit kalkulator
          <Badge variant="outline" className="text-[8px] ml-1">BuildVision AI</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Stroški (€)</Label>
            <Input type="number" value={costs || ''} onChange={(e) => setCosts(parseFloat(e.target.value) || 0)} className="h-8 mt-1 text-xs" />
          </div>
          <div>
            <Label className="text-xs">Pribitek (%)</Label>
            <Input type="number" value={markupPercent || ''} onChange={(e) => setMarkupPercent(parseFloat(e.target.value) || 0)} className="h-8 mt-1 text-xs" />
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-2.5 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Prodajna cena</span>
            <span className="font-bold text-green-400 text-sm">{markupResult.totalWithMarkup.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dobiček</span>
            <span className="font-medium text-green-300">{markupResult.profit.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Profitna marža</span>
            <span className="font-medium">{markupResult.profitMarginPercent.toFixed(1)}%</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1">
          {[15, 25, 35, 50].map((p) => (
            <button
              key={p}
              onClick={() => setMarkupPercent(p)}
              className={`py-1 rounded text-[10px] font-medium transition-colors ${
                markupPercent === p ? 'bg-green-600 text-white' : 'bg-muted text-muted-foreground'
              }`}
            >
              {p}%
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Ograjni Kalkulator (fence calculator - BuildVision) ────────────────

export function FenceCalculator() {
  const [linearM, setLinearM] = useState(6);
  const [heightM, setHeightM] = useState(1.1);
  const [postSpacingM, setPostSpacingM] = useState(1.5);
  const [gates, setGates] = useState(0);
  const [fenceType, setFenceType] = useState<FenceInput['fenceType']>('wood');

  const fenceResult = useMemo(() => {
    const input: FenceInput = {
      linearLength: linearM,
      postSpacing: postSpacingM,
      height: heightM,
      gates,
      fenceType,
      units: 'metric',
    };
    return calculateFence(input);
  }, [linearM, heightM, postSpacingM, gates, fenceType]);

  const fenceTypes: Record<string, string> = {
    wood: 'Les (WPC)',
    vinyl: 'Vinil',
    chain_link: 'Pletivo',
    aluminum: 'Aluminij',
    split_rail: 'Lesena ograda',
  };

  return (
    <Card className="border-amber-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Construction className="w-4 h-4 text-amber-500" />
          Ograjni kalkulator
          <Badge variant="outline" className="text-[8px] ml-1">BuildVision AI</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Dolžina (m)</Label>
            <Input type="number" step="0.5" value={linearM || ''} onChange={(e) => setLinearM(parseFloat(e.target.value) || 0)} className="h-8 mt-1 text-xs" />
          </div>
          <div>
            <Label className="text-xs">Višina (m)</Label>
            <Input type="number" step="0.1" value={heightM || ''} onChange={(e) => setHeightM(parseFloat(e.target.value) || 0)} className="h-8 mt-1 text-xs" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Razmik stebričkov (m)</Label>
            <Input type="number" step="0.1" value={postSpacingM || ''} onChange={(e) => setPostSpacingM(parseFloat(e.target.value) || 0)} className="h-8 mt-1 text-xs" />
          </div>
          <div>
            <Label className="text-xs">Vrata</Label>
            <Input type="number" value={gates} onChange={(e) => setGates(parseInt(e.target.value) || 0)} className="h-8 mt-1 text-xs" min={0} />
          </div>
        </div>

        <div>
          <Label className="text-xs">Tip ograje</Label>
          <div className="grid grid-cols-5 gap-1 mt-1">
            {Object.entries(fenceTypes).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFenceType(key as typeof fenceType)}
                className={`py-1.5 rounded text-[8px] font-medium transition-colors ${
                  fenceType === key ? 'bg-amber-600 text-white' : 'bg-muted text-muted-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-2.5 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Stebrički</span>
            <span className="font-bold">{fenceResult.posts} kos</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Vodila (rails)</span>
            <span>{fenceResult.rails} kos</span>
          </div>
          {fenceResult.pickets > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Letve (pickets)</span>
              <span>{fenceResult.pickets} kos</span>
            </div>
          )}
          {fenceResult.panels > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paneli</span>
              <span>{fenceResult.panels} kos</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Vreče betona</span>
            <span>{fenceResult.concreteBags} kos</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cena (min)</span>
            <span className="text-amber-400">{fenceResult.costMin.toFixed(0)} €</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cena (max)</span>
            <span className="text-amber-400 font-bold">{fenceResult.costMax.toFixed(0)} €</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
