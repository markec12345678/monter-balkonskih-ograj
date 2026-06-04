'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RAILING_STYLES } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface RoksalCatalogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATALOG_ITEMS = [
  {
    styleId: 'MODERN_ALU' as const,
    title: 'ROKSAL H-Line',
    subtitle: 'Vodoravne letve',
    description: 'Sodoben ALU sistem z vodoravnimi letvami. Minimalistična oblika, enostavno vzdrževanje in dolga življenjska doba.',
    features: ['Aluminijaste letve 40×16mm', 'Razmik letev 110mm', 'Steber 40×40mm', 'Možnost polnila iz stekla ali alu'],
    pricePerMeter: 190,
  },
  {
    styleId: 'GLASS_PANEL' as const,
    title: 'ROKSAL Steklena',
    subtitle: 'Glass Panel',
    description: 'Premium sistem brez vidnih profilov. Neprekosljiv razgled in elegantna izvedba za zahtevnejše stranke.',
    features: ['Varnostno steklo ESG 8+8mm', 'Profil brez vidnega roba', 'Steber 50×50mm', 'Max. višina 1200mm'],
    pricePerMeter: 320,
  },
  {
    styleId: 'STAINLESS_STEEL_CABLE' as const,
    title: 'ROKSAL V-Line',
    subtitle: 'Pokončne letve',
    description: 'Varnostni sistem s pokončnimi letvami. Klasika z modernim pridihom, primerna za vse tipe zgradb.',
    features: ['Inox letve ∅16mm', 'Razmik letev 110mm', 'Inox steber 42×42mm', 'Kombinacija s steklom'],
    pricePerMeter: 210,
  },
  {
    styleId: 'ELEGANT_WOODEN' as const,
    title: 'ROKSAL Panelna',
    subtitle: 'CNC Laserski izrez',
    description: 'CNC lasersko izrezani vzorci za unikatno obliko. Vsak projekt je edinstven po oblikovanju polnila.',
    features: ['Alu panel 3mm CNC izrez', 'Poljuben vzorec', 'Steber 50×50mm', 'Prašno lakiranje RAL'],
    pricePerMeter: 225,
  },
];

export function RoksalCatalog({ open, onOpenChange }: RoksalCatalogProps) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            ROKSAL Katalog
            <Badge variant="secondary" className="text-xs">2024</Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 mt-2">
          {CATALOG_ITEMS.map((item, idx) => {
            const style = RAILING_STYLES.find((s) => s.id === item.styleId);
            return (
              <div
                key={item.styleId}
                className="rounded-lg border border-amber-500/20 bg-gradient-to-r from-amber-950/10 to-card p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-base">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-400 font-bold">{item.pricePerMeter} €/m</span>
                    <Badge variant="outline" className="ml-2 text-[10px]">
                      {style?.material}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm mt-2 text-muted-foreground">{item.description}</p>
                {expandedIdx === idx && (
                  <div className="mt-3 space-y-1">
                    <h4 className="text-xs font-semibold uppercase text-amber-500">Tehnični podatki</h4>
                    <ul className="space-y-1">
                      {item.features.map((f, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-amber-500" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-2 mt-3">
                      <button className="text-xs px-3 py-1.5 rounded bg-amber-600 text-white hover:bg-amber-700 transition-colors">
                        Tehnični list (PDF)
                      </button>
                      <button className="text-xs px-3 py-1.5 rounded bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
                        Navodila za montažo
                      </button>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                  className="text-xs text-amber-500 hover:text-amber-400 mt-2 transition-colors"
                >
                  {expandedIdx === idx ? 'Zapri podrobnosti ▲' : 'Več podrobnosti ▼'}
                </button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
