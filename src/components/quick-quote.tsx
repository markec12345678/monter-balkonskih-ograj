'use client';

import React, { useState } from 'react';
import { RAILING_STYLES, WPC_COLORS, WPC_PROFILES, INSTALLATION_SPECS, WpcProfile, RailingStyle, calculatePrice } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  Phone,
  Mail,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';

export function QuickQuote() {
  const [lengthCm, setLengthCm] = useState(600);
  const [heightCm, setHeightCm] = useState(110);
  const [railingStyle, setRailingStyle] = useState<RailingStyle>('WPC_H_LINE');
  const [wpcProfile, setWpcProfile] = useState<WpcProfile>('WOODCORE_TEAK');
  const [mountType, setMountType] = useState<'V tla (Zgoraj)' | 'Bočno (V fasado)'>('V tla (Zgoraj)');
  const [vatRate, setVatRate] = useState(9.5);
  const [copied, setCopied] = useState(false);

  const style = RAILING_STYLES.find((s) => s.id === railingStyle);
  const wpcColor = WPC_COLORS.find((c) => c.id === wpcProfile);
  const wpcProfileInfo = WPC_PROFILES.find((p) => p.id === wpcProfile);

  // Quick price calculation
  const totalArea = (lengthCm / 100) * (heightCm / 100);
  const totalMeters = (lengthCm / 100) * 1.1;
  const heightMultiplier = heightCm > 100 ? 1.0 + (heightCm - 100) * 0.012 : 1.0;
  const baseCost = totalArea * (style?.pricePerM2 ?? 190) * heightMultiplier;
  const mountingLabor = mountType === 'Bočno (V fasado)' ? 140 : 50;
  const subtotal = baseCost + mountingLabor;
  const vatAmount = subtotal * (vatRate / 100);
  const total = subtotal + vatAmount;

  function handleCopyQuote() {
    const text = `HITRA PONUDBA - ROKSAL WoodCore WPC
=====================================
Sistem: ${style?.name}
WPC Barva: ${wpcColor?.name}
Dimenzije: ${lengthCm} × ${heightCm} cm
Montaža: ${mountType}

Material: ${baseCost.toFixed(2)} €
Montaža: ${mountingLabor.toFixed(2)} €
Vmesna vsota: ${subtotal.toFixed(2)} €
DDV (${vatRate}%): ${vatAmount.toFixed(2)} €
SKUPAJ: ${total.toFixed(2)} €

Garancija: ${INSTALLATION_SPECS.warrantyYears} let
Življenjska doba: ${INSTALLATION_SPECS.lifespanYears}+ let

ROKSAL d.o.o. | Savska Loka 21, 4000 Kranj
04 280 78 00 | info@roksal.com`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleEmailQuote() {
    const subject = encodeURIComponent('Povpraševanje za WPC balkonsko ograjo');
    const body = encodeURIComponent(
      `Pozdravljeni,\n\nZanima me ponudba za WPC WoodCore balkonsko ograjo:\n\n` +
      `Sistem: ${style?.name}\n` +
      `WPC Barva: ${wpcColor?.name}\n` +
      `Dimenzije: ${lengthCm} × ${heightCm} cm\n` +
      `Način montaže: ${mountType}\n` +
      `Ocenjena cena: ${total.toFixed(2)} € z DDV\n\n` +
      `Prosimo za kontakt in dogovor za ogled.\n\nLep pozdrav`
    );
    window.open(`mailto:info@roksal.com?subject=${subject}&body=${body}`, '_self');
  }

  return (
    <Card className="border-amber-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          Hitra ponudba
          <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400">
            Brez projekta
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Hitra cenovna ocena brez ustvarjanja projekta. Za podrobnosti se obrnite na ROKSAL.
        </p>

        <div className="grid grid-cols-2 gap-3">
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
        </div>

        <div>
          <Label className="text-xs">WPC Sistem</Label>
          <select
            value={railingStyle}
            onChange={(e) => setRailingStyle(e.target.value as RailingStyle)}
            className="w-full h-9 mt-1 rounded-md border border-white/10 bg-card px-2 text-xs"
          >
            {RAILING_STYLES.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.pricePerM2}€/m²)</option>
            ))}
          </select>
        </div>

        <div>
          <Label className="text-xs">WPC Barva</Label>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {WPC_COLORS.map((color) => (
              <button
                key={color.id}
                onClick={() => setWpcProfile(color.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] transition-all ${
                  wpcProfile === color.id
                    ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                    : 'bg-muted text-muted-foreground border border-transparent'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color.hexColor }} />
                {color.name.split(' ').pop()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Montaža</Label>
            <div className="flex gap-1.5 mt-1">
              <button
                onClick={() => setMountType('V tla (Zgoraj)')}
                className={`flex-1 py-1.5 rounded text-[10px] font-medium transition-colors ${
                  mountType === 'V tla (Zgoraj)' ? 'bg-amber-600 text-white' : 'bg-muted text-muted-foreground'
                }`}
              >
                V tla
              </button>
              <button
                onClick={() => setMountType('Bočno (V fasado)')}
                className={`flex-1 py-1.5 rounded text-[10px] font-medium transition-colors ${
                  mountType === 'Bočno (V fasado)' ? 'bg-amber-600 text-white' : 'bg-muted text-muted-foreground'
                }`}
              >
                Bočno
              </button>
            </div>
          </div>
          <div>
            <Label className="text-xs">DDV</Label>
            <div className="flex gap-1.5 mt-1">
              <button
                onClick={() => setVatRate(9.5)}
                className={`flex-1 py-1.5 rounded text-[10px] font-medium transition-colors ${
                  vatRate === 9.5 ? 'bg-amber-600 text-white' : 'bg-muted text-muted-foreground'
                }`}
              >
                9.5%
              </button>
              <button
                onClick={() => setVatRate(22)}
                className={`flex-1 py-1.5 rounded text-[10px] font-medium transition-colors ${
                  vatRate === 22 ? 'bg-amber-600 text-white' : 'bg-muted text-muted-foreground'
                }`}
              >
                22%
              </button>
            </div>
          </div>
        </div>

        {/* Price result */}
        <div className="bg-gradient-to-br from-amber-950/30 to-card border border-amber-500/20 rounded-lg p-3 space-y-1.5 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Material (WPC + ALU)</span>
            <span>{baseCost.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Montaža</span>
            <span>{mountingLabor.toFixed(2)} €</span>
          </div>
          <div className="h-px bg-white/10" />
          <div className="flex justify-between">
            <span>Brez DDV</span>
            <span>{subtotal.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>DDV ({vatRate}%)</span>
            <span>{vatAmount.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between font-bold text-amber-400 text-sm pt-1">
            <span>Skupaj z DDV</span>
            <span>{total.toFixed(2)} €</span>
          </div>
          <div className="text-[10px] text-muted-foreground pt-1">
            Garancija: {INSTALLATION_SPECS.warrantyYears} let | Življenjska doba: {INSTALLATION_SPECS.lifespanYears}+ let
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyQuote}
            className="h-8 text-xs"
          >
            {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
            Kopiraj
          </Button>
          <Button
            size="sm"
            onClick={handleEmailQuote}
            className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Mail className="w-3 h-3 mr-1" />
            Pošlji na ROKSAL
          </Button>
        </div>

        {/* Direct contact */}
        <div className="bg-card/50 rounded-lg p-2.5 space-y-1.5 text-[10px]">
          <div className="font-semibold text-xs mb-1">Direkten kontakt ROKSAL:</div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="w-3 h-3 text-amber-400" />
            <span>04 280 78 00 (prodaja)</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="w-3 h-3 text-amber-400" />
            <span>info@roksal.com</span>
          </div>
          <a
            href="https://roksal.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-amber-400 hover:text-amber-300"
          >
            <ExternalLink className="w-3 h-3" />
            www.roksal.com
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
