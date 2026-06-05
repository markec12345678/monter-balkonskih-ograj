'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RAILING_STYLES, WPC_COLORS, WPC_PROFILES, INSTALLATION_SPECS } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MapPin, Clock, Shield, Percent } from 'lucide-react';

interface RoksalCatalogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoksalCatalog({ open, onOpenChange }: RoksalCatalogProps) {
  const [activeTab, setActiveTab] = useState<'sistemi' | 'profili' | 'barve' | 'info'>('sistemi');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            ROKSAL WoodCore Katalog
            <Badge variant="secondary" className="text-xs">WPC 2024</Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/5 pb-2">
          {[
            { id: 'sistemi', label: 'Sistemi' },
            { id: 'profili', label: 'Profili' },
            { id: 'barve', label: 'Barve' },
            { id: 'info', label: 'Kontakt' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-amber-600/20 text-amber-400'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sistemi WPC ograj */}
        {activeTab === 'sistemi' && (
          <div className="grid gap-3 mt-2">
            {/* Akcije banner */}
            <div className="bg-gradient-to-r from-red-950/30 to-amber-950/20 border border-red-500/20 rounded-lg p-3 flex items-center gap-3">
              <Percent className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <div className="text-xs font-semibold text-red-400">AKCIJA!</div>
                <div className="text-[10px] text-muted-foreground">
                  -30% na 2.2m plošče | -15% na 4m plošče
                </div>
              </div>
            </div>

            {RAILING_STYLES.map((style) => (
              <div
                key={style.id}
                className="rounded-lg border border-amber-500/20 bg-gradient-to-r from-amber-950/10 to-card p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">{style.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{style.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-400 font-bold text-sm">{style.pricePerM2} €/m²</span>
                    <Badge variant="outline" className="ml-2 text-[10px]">
                      {style.material}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* WPC Profili */}
        {activeTab === 'profili' && (
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-card rounded-lg p-2">
                <div className="text-sm font-bold text-amber-400">{INSTALLATION_SPECS.maxPostSpacing} cm</div>
                <div className="text-[10px] text-muted-foreground">Max razmik stebričkov</div>
              </div>
              <div className="bg-card rounded-lg p-2">
                <div className="text-sm font-bold text-amber-400">{INSTALLATION_SPECS.supportSpacing} cm</div>
                <div className="text-[10px] text-muted-foreground">Max razmik nosilcev</div>
              </div>
              <div className="bg-card rounded-lg p-2">
                <div className="text-sm font-bold text-amber-400">{INSTALLATION_SPECS.warrantyYears} let</div>
                <div className="text-[10px] text-muted-foreground">Garancija</div>
              </div>
            </div>
            {WPC_PROFILES.map((profile) => (
              <div key={profile.id} className="rounded-lg border border-white/5 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{profile.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {profile.dimensions} • Dolžina: {profile.lengthM}m • {profile.surfaceType}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-amber-400">{profile.pricePerM2} €/m²</div>
                    <div className="text-[10px] text-muted-foreground">{profile.weightKgM} kg/m</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Barve */}
        {activeTab === 'barve' && (
          <div className="grid grid-cols-2 gap-3 mt-2">
            {WPC_COLORS.map((color) => (
              <div key={color.id} className="rounded-lg border border-white/5 p-3 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg border border-white/10 flex-shrink-0"
                  style={{ backgroundColor: color.hexColor }}
                />
                <div>
                  <div className="text-sm font-medium">{color.name}</div>
                  <div className="text-[10px] text-muted-foreground">{color.description}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Kontakt informacije */}
        {activeTab === 'info' && (
          <div className="space-y-3 mt-2">
            <div className="rounded-lg border border-amber-500/20 bg-gradient-to-r from-amber-950/20 to-card p-4">
              <h3 className="font-semibold text-sm mb-3">ROKSAL d.o.o.</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Savska Loka 21, 4000 Kranj</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Phone className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>04 280 78 00 (prodaja) | 04 280 78 10 (tehnika) | 04 280 78 20 (računovodstvo)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Mail className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>info@roksal.com</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Pon-Pet: 8:00-16:00 | Sob: 9:00-12:00 (po dogovoru)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Shield className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>{INSTALLATION_SPECS.warrantyYears}-letna garancija | {INSTALLATION_SPECS.lifespanYears}+ let življenjske dobe</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-600/10 border border-amber-500/20 rounded-lg p-3">
              <p className="text-xs text-amber-300">
                <strong>Storitve:</strong> Svetovanje, projektiranje, montaža, dostava, brezplačno skladiščenje materiala.
              </p>
            </div>

            <div className="bg-green-600/10 border border-green-500/20 rounded-lg p-3">
              <p className="text-xs text-green-300">
                <strong>Iščemo podizvajalce!</strong> ROKSAL aktivno išče zanesljive podizvajalce za montažo WPC ograj.
                Prijavite se preko aplikacije (gumb &quot;Podizvajalec&quot; v meniju).
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
