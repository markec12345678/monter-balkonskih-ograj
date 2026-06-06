'use client';

import React, { useState } from 'react';
import { INSTALLATION_SPECS, WPC_PROFILES, RAILING_STYLES } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  BookOpen,
  Ruler,
  Wrench,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Hammer,
  Shield,
  ArrowRight,
} from 'lucide-react';

interface InstallationManualProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface StepProps {
  number: number;
  title: string;
  children: React.ReactNode;
  warning?: string;
}

function Step({ number, title, children, warning }: StepProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/5 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-amber-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">{number}</span>
        </div>
        <span className="text-sm font-medium text-left flex-1">{title}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2">
          {warning && (
            <div className="flex items-start gap-2 bg-amber-600/10 border border-amber-500/20 rounded p-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-amber-300">{warning}</span>
            </div>
          )}
          <div className="text-xs text-muted-foreground space-y-1.5 pl-10">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export function InstallationManual({ open, onOpenChange }: InstallationManualProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            Tehnični priročnik za montažo
            <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400">
              WPC WoodCore
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Ključne specifikacije */}
          <Card className="border-amber-500/20 bg-gradient-to-r from-amber-950/20 to-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Ruler className="w-4 h-4 text-amber-500" />
                Ključne specifikacije
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-card/50 rounded-lg p-2.5 text-center">
                  <div className="text-lg font-bold text-amber-400">{INSTALLATION_SPECS.maxPostSpacing} cm</div>
                  <div className="text-[10px] text-muted-foreground">Max razmik stebričkov</div>
                </div>
                <div className="bg-card/50 rounded-lg p-2.5 text-center">
                  <div className="text-lg font-bold text-amber-400">{INSTALLATION_SPECS.supportSpacing} cm</div>
                  <div className="text-[10px] text-muted-foreground">Max razmik nosilcev</div>
                </div>
                <div className="bg-card/50 rounded-lg p-2.5 text-center">
                  <div className="text-lg font-bold text-amber-400">{INSTALLATION_SPECS.standardHeight} cm</div>
                  <div className="text-[10px] text-muted-foreground">Standardna višina</div>
                </div>
                <div className="bg-card/50 rounded-lg p-2.5 text-center">
                  <div className="text-lg font-bold text-amber-400">{INSTALLATION_SPECS.wpcBoardThickness} mm</div>
                  <div className="text-[10px] text-muted-foreground">Debelina WPC letve</div>
                </div>
                <div className="bg-card/50 rounded-lg p-2.5 text-center">
                  <div className="text-lg font-bold text-amber-400">{INSTALLATION_SPECS.railingGap} mm</div>
                  <div className="text-[10px] text-muted-foreground">Razmik med letvami</div>
                </div>
                <div className="bg-card/50 rounded-lg p-2.5 text-center">
                  <div className="text-lg font-bold text-amber-400">{INSTALLATION_SPECS.warrantyYears} let</div>
                  <div className="text-[10px] text-muted-foreground">Garancija ROKSAL</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* WPC Profili specifikacije */}
          <Card className="border-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">WPC WoodCore profili</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {WPC_PROFILES.map((profile) => (
                  <div key={profile.id} className="flex items-center justify-between bg-muted/20 rounded-lg px-3 py-2">
                    <div>
                      <div className="text-xs font-medium">{profile.name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {profile.dimensions} • {profile.lengthM}m • {profile.surfaceType}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-amber-400">{profile.pricePerM2} €/m²</div>
                      <div className="text-[10px] text-muted-foreground">{profile.weightKgM} kg/m</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Koraki montaže */}
          <Card className="border-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Hammer className="w-4 h-4 text-amber-500" />
                Postopek montaže
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Step number={1} title="Priprava in merjenje" warning="Vedno preverite dimenzije na objektu! Načrt je samo orientacijski.">
                <p>Izmerite dolžino in višino balkona na vsaj 3 mestih.</p>
                <p>Določite položaj stebričkov - max razmik <strong>{INSTALLATION_SPECS.maxPostSpacing} cm</strong>.</p>
                <p>Označite mesta za sidranje z markerjem ali trakom.</p>
                <p>Preverite nosilnost podlage (beton mora biti min. C25/30).</p>
              </Step>

              <Step number={2} title="Sidranje stebričkov" warning="Kemični sidri potrebujejo min. 24h za polno trdnost!">
                <p>Vrtajte luknje za sidra (premer glede na tip sidra, navadno 12-14mm).</p>
                <p>Globina sidranja: min. 80mm v nosilni beton.</p>
                <p>Vstavite kemične sidre in ALU podstavke stebričkov.</p>
                <p>Preverite navpičnost z libelo (toleranca ±2mm/m).</p>
                <p>Tip sidra: <strong>{INSTALLATION_SPECS.anchorType}</strong></p>
              </Step>

              <Step number={3} title="Postavitev ALU stebričkov">
                <p>Vstavite ALU stebričke ({INSTALLATION_SPECS.aluPostSize}) v podstavke.</p>
                <p>Privežite stebričke z vijaki <strong>{INSTALLATION_SPECS.screwType}</strong>.</p>
                <p>Preverite razmik med stebrički (max {INSTALLATION_SPECS.maxPostSpacing} cm).</p>
                <p>Namestite nosilce za WPC letve na vsakih {INSTALLATION_SPECS.supportSpacing} cm.</p>
              </Step>

              <Step number={4} title="Vgradnja WPC letvic" warning="WPC letve se raztezajo! Pustite 5-8mm razmik na spojih.">
                <p>Odrežite WPC letve na pravo dolžino (uporabite žago s finim zobatom).</p>
                <p>Vstavite letve v nosilce od spodaj navzgor.</p>
                <p>Razmik med letvami: <strong>{INSTALLATION_SPECS.railingGap} mm</strong> (skladno z normativi).</p>
                <p>Privežite vsako letev z 2 vijaki na nosilec.</p>
                <p>WPC debelina: {INSTALLATION_SPECS.wpcBoardThickness}mm, širina: {INSTALLATION_SPECS.wpcBoardWidthNarrow}/{INSTALLATION_SPECS.wpcBoardWidthWide}mm.</p>
              </Step>

              <Step number={5} title="Zaključna dela in kontrolo">
                <p>Preverite stabilnost celotne konstrukcije (ročni test z 50kg obremenitvijo).</p>
                <p>Preverite vse vijačne povezave - zategnite, kjer je potrebno.</p>
                <p>Namestite zaključne profilne pokrove na stebričke.</p>
                <p>Očistite WPC površine (voda + blag detergent).</p>
                <p>Fotografirajte končano delo za arhiv.</p>
              </Step>
            </CardContent>
          </Card>

          {/* Varnostni predpisi */}
          <Card className="border-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" />
                Varnostni predpisi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <ArrowRight className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Minimalna višina ograje: <strong>{INSTALLATION_SPECS.minHeight} cm</strong> (do 1m padca), <strong>110 cm</strong> (do 3m padca), <strong>120 cm</strong> (nad 3m padca)</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <ArrowRight className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Razmik med letvami ne sme presegati <strong>{INSTALLATION_SPECS.railingGap} mm</strong> (preprečitev padca otrok)</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <ArrowRight className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Ograja mora prenesti horizontalno obremenitev <strong>1.0 kN/m</strong> po SIST EN 1991</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <ArrowRight className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Vsi kovinski deli morajo biti zaščiteni proti koroziji (A2 inox minimum)</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <ArrowRight className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>WPC material: življenjska doba <strong>{INSTALLATION_SPECS.lifespanYears}+ let</strong>, garancija <strong>{INSTALLATION_SPECS.warrantyYears} let</strong></span>
              </div>
            </CardContent>
          </Card>

          {/* Kontakt za podporo */}
          <div className="bg-amber-600/10 border border-amber-500/20 rounded-lg p-3">
            <p className="text-xs text-amber-300">
              <strong>Tehnična podpora ROKSAL:</strong> 04 280 78 00 | info@roksal.com | Savska Loka 21, 4000 Kranj
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
