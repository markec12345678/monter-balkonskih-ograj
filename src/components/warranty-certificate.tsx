'use client';

import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { jsPDF } from 'jspdf';
import {
  Project,
  RAILING_STYLES,
  WPC_COLORS,
  WPC_PROFILES,
  INSTALLATION_SPECS,
  calculatePrice,
  WarrantyData,
} from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Shield,
  FileText,
  Download,
  PenLine,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface WarrantyCertificateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
}

export function WarrantyCertificate({ open, onOpenChange, project }: WarrantyCertificateProps) {
  const breakdown = calculatePrice(project);
  const [installerName, setInstallerName] = useState('');
  const [installerPhone, setInstallerPhone] = useState('');
  const [installDate, setInstallDate] = useState(new Date().toISOString().split('T')[0]);
  const [warrantyNotes, setWarrantyNotes] = useState('');
  const [generated, setGenerated] = useState(false);

  const customerSigRef = useRef<SignatureCanvas>(null);
  const installerSigRef = useRef<SignatureCanvas>(null);

  const wpcColor = WPC_COLORS.find((c) => c.id === project.wpcProfile);
  const wpcProfile = WPC_PROFILES.find((p) => p.id === project.wpcProfile);
  const style = RAILING_STYLES.find((s) => s.id === project.railingStyle);

  function generateWarrantyPDF() {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(180, 83, 9); // amber-700
    doc.rect(0, 0, pageW, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('GARANCIJSKI LIST', pageW / 2, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`ROKSAL d.o.o. - WPC WoodCore Garancija ${INSTALLATION_SPECS.warrantyYears} let`, pageW / 2, 23, { align: 'center' });

    doc.setFontSize(8);
    doc.text('Savska Loka 21, 4000 Kranj | info@roksal.com | 04 280 78 00', pageW / 2, 30, { align: 'center' });

    // Body
    doc.setTextColor(0, 0, 0);
    let y = 45;

    // Section: Podatki stranke
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('PODATKI STRANKE', 15, y);
    y += 7;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const customerInfo = [
      ['Stranka:', project.customerName],
      ['Naslov:', project.address],
      ['Telefon:', project.phone],
    ];
    customerInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 15, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value || '/', 50, y);
      y += 5;
    });

    y += 5;

    // Section: Podatki ograje
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('PODATKI O OGRAJI', 15, y);
    y += 7;

    doc.setFontSize(9);
    const railingInfo = [
      ['Sistem:', style?.name || '/'],
      ['WPC Profil:', wpcProfile?.name || '/'],
      ['WPC Barva:', wpcColor?.name || '/'],
      ['Dimenzije profila:', wpcProfile?.dimensions || '/'],
      ['Dimenzije ograje:', `${project.lengthCm} × ${project.heightCm} × ${project.widthCm} cm`],
      ['Površina:', `${breakdown.totalArea.toFixed(2)} m²`],
      ['Način montaže:', project.mountType],
      ['RAL steber:', `${project.ralColorName || project.ralColor}`],
      ['Datum montaže:', installDate],
      ['Monter:', installerName || '/'],
      ['Telefon monterja:', installerPhone || '/'],
    ];
    railingInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 15, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 60, y);
      y += 5;
    });

    y += 5;

    // Section: Garancijski pogoji
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('GARANCIJSKI POGOJI', 15, y);
    y += 7;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const warrantyTerms = [
      `1. ROKSAL d.o.o. podeljuje ${INSTALLATION_SPECS.warrantyYears}-letno garancijo na WPC WoodCore materiale in izdelavo.`,
      `2. Garancija pokriva proizvodne napake, deformacije materiala in odpoved spojev pri normalni uporabi.`,
      `3. Garancija NE velja za: mehanske poškodbe, nepravilno montažo, neustrezno vzdrževanje,`,
      `   naravno bledenje barve (do 10% v prvih 2 letih) in poškodbe zaradi ekstremnih vremenskih razmer.`,
      `4. Prijava napake: kupec mora napako prijaviti v 15 dneh od odkritja na info@roksal.com.`,
      `5. ROKSAL si pridržuje pravico do zamenjave ali popravila okvarjenega dela.`,
      `6. Predvidena življenjska doba WPC materiala: ${INSTALLATION_SPECS.lifespanYears}+ let ob pravilnem vzdrževanju.`,
    ];
    warrantyTerms.forEach((line) => {
      doc.text(line, 15, y);
      y += 4;
    });

    y += 5;

    // Opombe
    if (warrantyNotes) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('OPOMBE', 15, y);
      y += 7;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(warrantyNotes, 15, y);
      y += 5;
    }

    y += 10;

    // Podpisi
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');

    // Podpis stranke
    doc.text('Podpis stranke:', 15, y);
    doc.line(15, y + 15, 85, y + 15);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(project.customerName, 15, y + 20);

    // Podpis monterja
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Podpis monterja:', 110, y);
    doc.line(110, y + 15, 180, y + 15);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(installerName || '', 110, y + 20);

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Garancijski list št. GL-${project.id}-${new Date().getFullYear()} | Generirano: ${new Date().toLocaleString('sl-SI')} | Monter Ograj PRO`,
      pageW / 2,
      footerY,
      { align: 'center' }
    );

    // Save
    doc.save(`Garancijski_List_${project.customerName.replace(/\s+/g, '_')}_${installDate}.pdf`);
    setGenerated(true);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            Garancijski list
            <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400">
              {INSTALLATION_SPECS.warrantyYears} let garancije
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {generated ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle2 className="w-16 h-16 mx-auto text-green-400" />
            <h3 className="text-lg font-semibold">Garancijski list generiran!</h3>
            <p className="text-sm text-muted-foreground">
              PDF garancijski list je bil prenesen. Shranite ga skupaj s projektno dokumentacijo.
            </p>
            <Button onClick={() => setGenerated(false)} variant="outline" className="mt-4">
              Ustvari nov garancijski list
            </Button>
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            {/* Predogled podatkov */}
            <Card className="border-amber-500/20 bg-gradient-to-r from-amber-950/20 to-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  Podatki za garancijski list
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between bg-card/50 rounded p-2">
                    <span className="text-muted-foreground">Stranka</span>
                    <span className="font-medium">{project.customerName}</span>
                  </div>
                  <div className="flex justify-between bg-card/50 rounded p-2">
                    <span className="text-muted-foreground">Naslov</span>
                    <span className="font-medium">{project.address}</span>
                  </div>
                  <div className="flex justify-between bg-card/50 rounded p-2">
                    <span className="text-muted-foreground">Sistem</span>
                    <span className="font-medium">{style?.name}</span>
                  </div>
                  <div className="flex justify-between bg-card/50 rounded p-2">
                    <span className="text-muted-foreground">WPC Barva</span>
                    <span className="font-medium">{wpcColor?.name}</span>
                  </div>
                  <div className="flex justify-between bg-card/50 rounded p-2">
                    <span className="text-muted-foreground">Dimenzije</span>
                    <span className="font-medium">{project.lengthCm}×{project.heightCm}×{project.widthCm} cm</span>
                  </div>
                  <div className="flex justify-between bg-card/50 rounded p-2">
                    <span className="text-muted-foreground">Garancija</span>
                    <span className="font-medium text-amber-400">{INSTALLATION_SPECS.warrantyYears} let</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Podatki o montaži */}
            <Card className="border-white/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  Podatki o montaži
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Ime monterja *</Label>
                    <Input
                      value={installerName}
                      onChange={(e) => setInstallerName(e.target.value)}
                      className="h-9 mt-1"
                      placeholder="Ime in priimek"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Telefon monterja</Label>
                    <Input
                      value={installerPhone}
                      onChange={(e) => setInstallerPhone(e.target.value)}
                      className="h-9 mt-1"
                      placeholder="031 234 567"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Datum montaže</Label>
                  <Input
                    type="date"
                    value={installDate}
                    onChange={(e) => setInstallDate(e.target.value)}
                    className="h-9 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Opombe na garancijskem listu</Label>
                  <Textarea
                    value={warrantyNotes}
                    onChange={(e) => setWarrantyNotes(e.target.value)}
                    className="mt-1 min-h-[60px]"
                    placeholder="Posebnosti, dodatne informacije..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Podpisi */}
            <Card className="border-white/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <PenLine className="w-4 h-4 text-amber-500" />
                  Podpisi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Podpis stranke</Label>
                  <div className="border border-white/10 rounded-lg bg-white/5 mt-1 overflow-hidden">
                    <SignatureCanvas
                      ref={customerSigRef}
                      canvasProps={{
                        className: 'w-full',
                        style: { width: '100%', height: '80px' },
                      }}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => customerSigRef.current?.clear()}
                    className="h-7 text-xs mt-1"
                  >
                    Počisti
                  </Button>
                </div>
                <div>
                  <Label className="text-xs">Podpis monterja</Label>
                  <div className="border border-white/10 rounded-lg bg-white/5 mt-1 overflow-hidden">
                    <SignatureCanvas
                      ref={installerSigRef}
                      canvasProps={{
                        className: 'w-full',
                        style: { width: '100%', height: '80px' },
                      }}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => installerSigRef.current?.clear()}
                    className="h-7 text-xs mt-1"
                  >
                    Počisti
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Generate button */}
            <Button
              onClick={generateWarrantyPDF}
              disabled={!installerName}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Generiraj garancijski list PDF
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
