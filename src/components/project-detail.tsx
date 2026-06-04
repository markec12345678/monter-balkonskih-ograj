'use client';

import React, { useState } from 'react';
import {
  Project,
  RAILING_STYLES,
  DEFAULT_PROJECT,
  MountType,
  RailingStyle,
  calculatePrice,
} from '@/lib/types';
import { RALColorPicker } from '@/components/ral-color-picker';
import { PriceCalculator } from '@/components/price-calculator';
import { SketchCanvas } from '@/components/sketch-canvas';
import { BeforeAfterSlider } from '@/components/before-after-slider';
import { PdfGenerator } from '@/components/pdf-generator';
import { RAL_BALCONY_COLORS } from '@/lib/ral-colors';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Circle,
  Ruler,
  Pencil,
  Bot,
  FileText,
  Loader2,
  Copy,
  Check,
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

  const breakdown = calculatePrice(project);

  function updateField<K extends keyof Project>(key: K, value: Project[K]) {
    onUpdate({ ...project, [key]: value });
  }

  function updateMultiple(fields: Partial<Project>) {
    onUpdate({ ...project, ...fields });
  }

  // Material filter for railing styles
  const [materialFilter, setMaterialFilter] = useState<string>('Vse');
  const filteredStyles = RAILING_STYLES.filter(
    (s) => materialFilter === 'Vse' || s.material === materialFilter
  );

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
          color: project.ralColorName || project.ralColor,
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
          {project.status === 'active' ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Zaključi
            </>
          ) : (
            <>
              <Circle className="w-3.5 h-3.5 mr-1" />
              Odpri
            </>
          )}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b border-white/5 px-3">
          <TabsList className="bg-transparent h-auto p-0 gap-1">
            <TabsTrigger
              value="podatki"
              className="data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-400 rounded-lg px-3 py-2 text-xs"
            >
              <Ruler className="w-3.5 h-3.5 mr-1.5" />
              Podatki
            </TabsTrigger>
            <TabsTrigger
              value="skica"
              className="data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-400 rounded-lg px-3 py-2 text-xs"
            >
              <Pencil className="w-3.5 h-3.5 mr-1.5" />
              Skiciranje
            </TabsTrigger>
            <TabsTrigger
              value="ai"
              className="data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-400 rounded-lg px-3 py-2 text-xs"
            >
              <Bot className="w-3.5 h-3.5 mr-1.5" />
              AI Poročilo
            </TabsTrigger>
            <TabsTrigger
              value="pdf"
              className="data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-400 rounded-lg px-3 py-2 text-xs"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              Ponudba
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
                <div className="flex gap-2">
                  {(['V tla (Zgoraj)', 'Bočno (V fasado)'] as MountType[]).map((mt) => (
                    <button
                      key={mt}
                      onClick={() => updateField('mountType', mt)}
                      className={`flex-1 py-3 px-3 rounded-lg border text-sm font-medium transition-all ${
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
                <CardTitle className="text-sm">Stil ograje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {['Vse', 'Inox', 'Steklo', 'Alu', 'Kovina'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setMaterialFilter(f)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        materialFilter === f
                          ? 'bg-amber-600 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  {filteredStyles.map((style) => (
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
                          <div className="text-xs text-muted-foreground">{style.description}</div>
                        </div>
                        <span className="text-amber-400 font-bold text-sm">{style.pricePerMeter} €/m</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* RAL Color */}
            <Card className="border-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">RAL Barva</CardTitle>
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

          {/* Tab 3: AI Poročilo */}
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

          {/* Tab 4: Ponudba PDF */}
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
                    <span className="text-muted-foreground">Dimenzije</span>
                    <span>{project.lengthCm}×{project.heightCm}×{project.widthCm} cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">RAL</span>
                    <span>{project.ralColorName || project.ralColor}</span>
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
        </ScrollArea>
      </Tabs>
    </div>
  );
}
