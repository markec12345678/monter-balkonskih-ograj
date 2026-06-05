'use client';

import React, { useState } from 'react';
import {
  Project,
  RAILING_STYLES,
  WPC_COLORS,
  WPC_PROFILES,
  DEFAULT_PROJECT,
  MountType,
  RailingStyle,
  WpcProfile,
  calculatePrice,
  INSTALLATION_SPECS,
} from '@/lib/types';
import { RALColorPicker } from '@/components/ral-color-picker';
import { WpcColorPicker } from '@/components/wpc-color-picker';
import { PriceCalculator } from '@/components/price-calculator';
import { SketchCanvas } from '@/components/sketch-canvas';
import { BeforeAfterSlider } from '@/components/before-after-slider';
import { PdfGenerator } from '@/components/pdf-generator';
import { ReferenceGallery } from '@/components/reference-gallery';
import { WarrantyCertificate } from '@/components/warranty-certificate';
import { RAL_BALCONY_COLORS } from '@/lib/ral-colors';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft,
  Ruler,
  Pencil,
  Bot,
  FileText,
  Loader2,
  Copy,
  Check,
  Shield,
  Camera,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { DrawingStroke, CalibrationData } from '@/lib/types';

interface ProjectDetailProps {
  project: Project;
  onUpdate: (project: Project) => void;
  onBack: () => void;
}

export function ProjectDetail({ project, onUpdate, onBack }: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState('podatki');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState(project.aiReport || '');
  const [copied, setCopied] = useState(false);
  const [warrantyOpen, setWarrantyOpen] = useState(false);

  const breakdown = calculatePrice(project);

  function updateField<K extends keyof Project>(key: K, value: Project[K]) {
    onUpdate({ ...project, [key]: value });
  }

  function updateMultiple(fields: Partial<Project>) {
    onUpdate({ ...project, ...fields });
  }

  async function handleAiAnalysis() {
    setAiLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: project.customerName,
          address: project.address,
          style: project.railingStyle,
          length: project.lengthCm,
          height: project.heightCm,
          width: project.widthCm,
          mountType: project.mountType,
          color: project.wpcColorName || project.ralColorName,
          notes: project.notes,
          imageBase64: project.photoBase64,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAiReport(data.result);
      updateField('aiReport', data.result);
    } catch (err) {
      setAiReport(`Napaka pri analizi: ${err instanceof Error ? err.message : 'Neznana napaka'}`);
    } finally {
      setAiLoading(false);
    }
  }

  function handleCopyReport() {
    navigator.clipboard.writeText(aiReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const hasPhoto = !!project.photoBase64;
  const hasAnnotatedPhoto = !!project.annotatedPhotoBase64;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-white/5">
        <Button variant="ghost" size="sm" onClick={onBack} className="lg:hidden h-8 w-8 p-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-base truncate">{project.customerName}</h2>
          <p className="text-xs text-muted-foreground truncate">{project.address}</p>
        </div>
        <Badge
          variant={project.status === 'active' ? 'default' : 'secondary'}
          className={project.status === 'active' ? 'bg-amber-600' : 'bg-green-600/20 text-green-400'}
        >
          {project.status === 'active' ? 'Aktivno' : 'Zaključeno'}
        </Badge>
        <Button
          size="sm"
          variant={project.status === 'active' ? 'outline' : 'default'}
          onClick={() =>
            updateField('status', project.status === 'active' ? 'finished' : 'active')
          }
          className={`h-8 ${project.status !== 'active' ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''}`}
        >
          {project.status === 'active' ? 'Zaključi' : 'Odpri'}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b border-white/5 px-2">
          <TabsList className="bg-transparent h-auto p-0 gap-0.5 overflow-x-auto">
            <TabsTrigger
              value="podatki"
              className="data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-400 rounded-lg px-2.5 py-2 text-[11px] whitespace-nowrap"
            >
              <Ruler className="w-3 h-3 mr-1" />
              Podatki
            </TabsTrigger>
            <TabsTrigger
              value="skica"
              className="data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-400 rounded-lg px-2.5 py-2 text-[11px] whitespace-nowrap"
            >
              <Pencil className="w-3 h-3 mr-1" />
              Skica
            </TabsTrigger>
            <TabsTrigger
              value="fotke"
              className="data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-400 rounded-lg px-2.5 py-2 text-[11px] whitespace-nowrap"
            >
              <Camera className="w-3 h-3 mr-1" />
              Foto
            </TabsTrigger>
            <TabsTrigger
              value="ai"
              className="data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-400 rounded-lg px-2.5 py-2 text-[11px] whitespace-nowrap"
            >
              <Bot className="w-3 h-3 mr-1" />
              AI
            </TabsTrigger>
            <TabsTrigger
              value="pdf"
              className="data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-400 rounded-lg px-2.5 py-2 text-[11px] whitespace-nowrap"
            >
              <FileText className="w-3 h-3 mr-1" />
              Ponudba
            </TabsTrigger>
            <TabsTrigger
              value="garancija"
              className="data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-400 rounded-lg px-2.5 py-2 text-[11px] whitespace-nowrap"
            >
              <Shield className="w-3 h-3 mr-1" />
              Garancija
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          {/* Tab 1: Podatki & Meritve */}
          <TabsContent value="podatki" className="p-4 space-y-5 m-0">
            {/* Customer info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Ime stranke</Label>
                <Input
                  value={project.customerName}
                  onChange={(e) => updateField('customerName', e.target.value)}
                  className="h-9 mt-1"
                  placeholder="Ime in priimek"
                />
              </div>
              <div>
                <Label className="text-xs">Naslov</Label>
                <Input
                  value={project.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  className="h-9 mt-1"
                  placeholder="Ulica in kraj"
                />
              </div>
              <div>
                <Label className="text-xs">Telefon</Label>
                <Input
                  value={project.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="h-9 mt-1"
                  placeholder="031 234 567"
                />
              </div>
            </div>

            {/* Dimensions */}
            <Card className="border-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-amber-500" />
                  Dimenzije
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Dolžina (cm)</Label>
                    <Input
                      type="number"
                      value={project.lengthCm || ''}
                      onChange={(e) =>
                        updateField('lengthCm', parseInt(e.target.value) || 0)
                      }
                      className="h-9 mt-1"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Višina (cm)</Label>
                    <Input
                      type="number"
                      value={project.heightCm || ''}
                      onChange={(e) =>
                        updateField('heightCm', parseInt(e.target.value) || 0)
                      }
                      className="h-9 mt-1"
                      placeholder="110"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Širina (cm)</Label>
                    <Input
                      type="number"
                      value={project.widthCm || ''}
                      onChange={(e) =>
                        updateField('widthCm', parseInt(e.target.value) || 0)
                      }
                      className="h-9 mt-1"
                      placeholder="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mount type */}
            <Card className="border-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Način montaže</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {(['V tla (Zgoraj)', 'Bočno (V fasado)', 'Vogalni steber', 'Na stopnice'] as MountType[]).map((mt) => (
                    <button
                      key={mt}
                      onClick={() => updateField('mountType', mt)}
                      className={`py-2.5 px-3 rounded-lg border text-xs font-medium transition-all ${
                        project.mountType === mt
                          ? 'border-amber-500 bg-amber-600/20 text-amber-400'
                          : 'border-white/10 hover:border-white/20 text-muted-foreground'
                      }`}
                    >
                      {mt}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Railing style */}
            <Card className="border-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">WPC Sistem ograje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {RAILING_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => updateField('railingStyle', style.id as RailingStyle)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      project.railingStyle === style.id
                        ? 'border-amber-500 bg-amber-600/10'
                        : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{style.name}</div>
                        <div className="text-[10px] text-muted-foreground">{style.description}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-amber-400 font-bold text-sm">{style.pricePerM2} €/m²</span>
                        <div className="text-[10px] text-muted-foreground">{style.material}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* WPC Color */}
            <Card className="border-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">WPC WoodCore Barva</CardTitle>
              </CardHeader>
              <CardContent>
                <WpcColorPicker
                  value={project.wpcProfile}
                  onChange={(profileId, colorName, hexColor) =>
                    updateMultiple({
                      wpcProfile: profileId,
                      wpcColorName: colorName,
                    })
                  }
                />
              </CardContent>
            </Card>

            {/* RAL Color for metal parts */}
            <Card className="border-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">RAL Barva (kovinski deli - stebrički)</CardTitle>
              </CardHeader>
              <CardContent>
                <RALColorPicker
                  value={project.ralColor}
                  onChange={(code, name) => updateMultiple({ ralColor: code, ralColorName: name })}
                />
              </CardContent>
            </Card>

            {/* Notes */}
            <div>
              <Label className="text-xs">Dodatne opombe</Label>
              <Textarea
                value={project.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                className="mt-1 min-h-[80px]"
                placeholder="Opombe s terena, posebnosti..."
              />
            </div>

            {/* Price calculation */}
            <div className="space-y-4">
              <PriceCalculator project={project} />

              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Popust ({project.discount}%)</Label>
                  <Slider
                    value={[project.discount]}
                    onValueChange={([v]) => updateField('discount', v)}
                    min={0}
                    max={30}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Label className="text-xs flex-shrink-0">DDV:</Label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateField('vatRate', 9.5)}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                        project.vatRate === 9.5
                          ? 'bg-amber-600 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      9.5% (Stanovanjski)
                    </button>
                    <button
                      onClick={() => updateField('vatRate', 22)}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                        project.vatRate === 22
                          ? 'bg-amber-600 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      22% (Standard)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground text-center pb-4">
              Spremembe se samodejno shranjujejo
            </div>
          </TabsContent>

          {/* Tab 2: Skiciranje & Vizualizacija */}
          <TabsContent value="skica" className="p-4 space-y-4 m-0">
            <SketchCanvas
              project={project}
              onStrokesChange={(strokes: DrawingStroke[]) => updateField('strokes', strokes)}
              onCalibrationChange={(calibration: CalibrationData | undefined) =>
                updateField('calibrationData', calibration)
              }
              onAnnotatedPhotoChange={(base64: string) =>
                updateField('annotatedPhotoBase64', base64)
              }
            />

            {/* Before/After comparison */}
            {hasPhoto && hasAnnotatedPhoto && (
              <Card className="border-white/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Primerjava Pred/Po</CardTitle>
                </CardHeader>
                <CardContent>
                  <BeforeAfterSlider
                    beforeSrc={`data:image/jpeg;base64,${project.photoBase64}`}
                    afterSrc={`data:image/jpeg;base64,${project.annotatedPhotoBase64}`}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab 3: Referenčne fotografije */}
          <TabsContent value="fotke" className="p-4 space-y-4 m-0">
            <ReferenceGallery
              photos={project.referencePhotos || []}
              onPhotosChange={(photos) => updateField('referencePhotos', photos)}
            />
          </TabsContent>

          {/* Tab 4: AI Poročilo */}
          <TabsContent value="ai" className="p-4 space-y-4 m-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Bot className="w-4 h-4 text-amber-500" />
                Gemini AI Analiza
              </h3>
              <Button
                onClick={handleAiAnalysis}
                disabled={aiLoading}
                className="bg-amber-600 hover:bg-amber-700 text-white h-9"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analiziram...
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4 mr-2" />
                    Zaženi analizo
                  </>
                )}
              </Button>
            </div>

            {aiLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                <p className="mt-3 text-sm text-muted-foreground">
                  AI analizira projekt in pripravlja poročilo...
                </p>
              </div>
            )}

            {aiReport && !aiLoading && (
              <div className="relative">
                <button
                  onClick={handleCopyReport}
                  className="absolute top-2 right-2 z-10 p-1.5 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                  title="Kopiraj"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <div className="prose prose-sm prose-invert max-w-none bg-card rounded-lg p-4 border border-white/5">
                  <ReactMarkdown>{aiReport}</ReactMarkdown>
                </div>
              </div>
            )}

            {!aiReport && !aiLoading && (
              <div className="text-center py-12 text-muted-foreground">
                <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Pritisnite &quot;Zaženi analizo&quot; za AI poročilo</p>
                <p className="text-xs mt-1">Gemini AI bo pripravil strokovno analizo v slovenščini</p>
              </div>
            )}
          </TabsContent>

          {/* Tab 5: Ponudba PDF */}
          <TabsContent value="pdf" className="p-4 space-y-4 m-0">
            <Card className="border-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  PDF Ponudba
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Ustvarite profesionalno PDF ponudbo s podatki projekta, specifikacijo ograje in ceneno kalkulacijo.
                </p>

                {/* Preview summary */}
                <div className="space-y-2 text-sm bg-muted/30 rounded-lg p-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stranka</span>
                    <span>{project.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sistem</span>
                    <span>{RAILING_STYLES.find((s) => s.id === project.railingStyle)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">WPC Barva</span>
                    <span>{project.wpcColorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dimenzije</span>
                    <span>{project.lengthCm}×{project.heightCm}×{project.widthCm} cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Montaža</span>
                    <span>{project.mountType}</span>
                  </div>
                  <div className="h-px bg-white/10 my-1" />
                  <div className="flex justify-between font-bold text-amber-400">
                    <span>Skupaj z DDV</span>
                    <span>{breakdown.totalWithVat.toFixed(2)} €</span>
                  </div>
                </div>

                <PdfGenerator project={project} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 6: Garancijski list */}
          <TabsContent value="garancija" className="p-4 space-y-4 m-0">
            <Card className="border-amber-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-500" />
                  Garancijski list - {INSTALLATION_SPECS.warrantyYears} let
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-amber-600/10 border border-amber-500/20 rounded-lg p-3">
                  <p className="text-xs text-amber-300">
                    ROKSAL WoodCore WPC materiali imajo <strong>{INSTALLATION_SPECS.warrantyYears}-letno garancijo</strong> in
                    predvideno življenjsko dobo <strong>{INSTALLATION_SPECS.lifespanYears}+ let</strong>.
                    Garancijski list vsebuje podatke o projektu, materialu in podpise.
                  </p>
                </div>

                <div className="space-y-2 text-sm bg-muted/30 rounded-lg p-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stranka</span>
                    <span>{project.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">WPC Sistem</span>
                    <span>{RAILING_STYLES.find((s) => s.id === project.railingStyle)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">WPC Barva</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{ backgroundColor: WPC_COLORS.find((c) => c.id === project.wpcProfile)?.hexColor }}
                      />
                      {project.wpcColorName}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Površina</span>
                    <span>{breakdown.totalArea.toFixed(2)} m²</span>
                  </div>
                </div>

                {project.warrantyIssued ? (
                  <div className="flex items-center gap-2 bg-green-600/10 border border-green-500/20 rounded-lg p-3">
                    <Check className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="text-sm font-medium text-green-400">Garancijski list izdan</div>
                      <div className="text-[10px] text-muted-foreground">
                        Datum: {project.warrantyDate || 'ni podatka'}
                      </div>
                    </div>
                  </div>
                ) : null}

                <Button
                  onClick={() => setWarrantyOpen(true)}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {project.warrantyIssued ? 'Ponovno generiraj garancijski list' : 'Ustvari garancijski list'}
                </Button>
              </CardContent>
            </Card>

            <WarrantyCertificate
              open={warrantyOpen}
              onOpenChange={(open) => {
                setWarrantyOpen(open);
                if (!open) {
                  updateMultiple({
                    warrantyIssued: true,
                    warrantyDate: new Date().toISOString().split('T')[0],
                  });
                }
              }}
              project={project}
            />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
