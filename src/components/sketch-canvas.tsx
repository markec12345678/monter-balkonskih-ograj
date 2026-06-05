'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { DrawingMode, DrawingStroke, DrawingPoint, CalibrationData, Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Camera,
  Image as ImageIcon,
  Undo2,
  Redo2,
  Trash2,
  Ruler,
  Eye,
  Fence,
  Grid3x3,
  Magnet,
  Crosshair,
  Save,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SketchCanvasProps {
  project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
  onStrokesChange: (strokes: DrawingStroke[]) => void;
  onCalibrationChange: (calibration: CalibrationData | undefined) => void;
  onAnnotatedPhotoChange: (base64: string) => void;
}

function drawQuadraticBezier(
  ctx: CanvasRenderingContext2D,
  points: DrawingPoint[]
) {
  if (points.length <= 1) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    const cpy = (prev.y + curr.y) / 2;
    ctx.quadraticCurveTo(prev.x, prev.y, cpx, cpy);
  }
  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
}

function snapToAngle(p1: DrawingPoint, p2: DrawingPoint): DrawingPoint {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const angle = Math.atan2(dy, dx);
  const dist = Math.sqrt(dx * dx + dy * dy);
  const snapAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
  return {
    x: p1.x + dist * Math.cos(snapAngle),
    y: p1.y + dist * Math.sin(snapAngle),
  };
}

function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 0.5;
  const step = 20;
  for (let x = 0; x <= w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawMeasurementLine(
  ctx: CanvasRenderingContext2D,
  p1: DrawingPoint,
  p2: DrawingPoint,
  label: string,
  color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(p1.x, p1.y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(p2.x, p2.y, 4, 0, Math.PI * 2);
  ctx.fill();

  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;
  ctx.font = 'bold 14px sans-serif';
  ctx.fillStyle = '#000';
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  const text = label || '';
  ctx.strokeText(text, midX + 5, midY - 8);
  ctx.fillText(text, midX + 5, midY - 8);
  ctx.restore();
}

function getRailingColorFromRAL(ralColor: string): string {
  const colors: Record<string, string> = {
    '7016': '#383E42',
    '9005': '#121212',
    '9010': '#FFFFFF',
    'EV1': '#B0B4B5',
  };
  return colors[ralColor] || '#888888';
}

export function SketchCanvas({
  project,
  onStrokesChange,
  onCalibrationChange,
  onAnnotatedPhotoChange,
}: SketchCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<DrawingMode>('VIEW');
  const [strokes, setStrokes] = useState<DrawingStroke[]>(project.strokes || []);
  const [undoneStrokes, setUndoneStrokes] = useState<DrawingStroke[]>([]);
  const [currentPoints, setCurrentPoints] = useState<DrawingPoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [showGrid, setShowGrid] = useState(false);
  const [angleSnap, setAngleSnap] = useState(false);

  const [calibration, setCalibration] = useState<CalibrationData | undefined>(project.calibrationData);
  const [calibDialogOpen, setCalibDialogOpen] = useState(false);
  const [calibLineStart, setCalibLineStart] = useState<DrawingPoint | null>(null);
  const [calibLineEnd, setCalibLineEnd] = useState<DrawingPoint | null>(null);
  const [calibRealLength, setCalibRealLength] = useState('');
  const [measureStart, setMeasureStart] = useState<DrawingPoint | null>(null);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const redrawRef = useRef<() => void>(() => {});

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.parentElement?.getBoundingClientRect();
    if (!rect) return;

    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (imageRef.current) {
      const img = imageRef.current;
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2;
      ctx.drawImage(img, x, y, w, h);
    }

    if (showGrid) {
      drawGrid(ctx, canvas.width, canvas.height);
    }

    for (const stroke of strokes) {
      if (stroke.points.length < 2) continue;
      if (stroke.mode === 'MEASURE' && stroke.points.length >= 2) {
        drawMeasurementLine(
          ctx,
          stroke.points[0],
          stroke.points[stroke.points.length - 1],
          stroke.label || '',
          stroke.color
        );
      } else {
        ctx.save();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        drawQuadraticBezier(ctx, stroke.points);
        ctx.restore();
      }
    }

    if (currentPoints.length > 1) {
      if (mode === 'MEASURE' && measureStart) {
        drawMeasurementLine(
          ctx,
          currentPoints[0],
          currentPoints[currentPoints.length - 1],
          '',
          '#ff4444'
        );
      } else {
        ctx.save();
        ctx.strokeStyle = mode === 'MEASURE' ? '#ff4444' : project.ralColor ? getRailingColorFromRAL(project.ralColor) : '#00ff88';
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        drawQuadraticBezier(ctx, currentPoints);
        ctx.restore();
      }
    }

    if (calibLineStart && calibLineEnd) {
      drawMeasurementLine(ctx, calibLineStart, calibLineEnd, 'Kalibracija', '#00ffff');
    }
  }, [strokes, currentPoints, showGrid, mode, measureStart, strokeWidth, calibLineStart, calibLineEnd, project.ralColor]);

  // Keep ref in sync
  useEffect(() => {
    redrawRef.current = redraw;
  }, [redraw]);

  // Sync photoUrl from project.photoBase64
  const resolvedPhotoUrl = project.photoBase64
    ? `data:image/jpeg;base64,${project.photoBase64}`
    : null;

  // Load photo image into ref
  useEffect(() => {
    if (resolvedPhotoUrl) {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        redrawRef.current();
      };
      img.src = resolvedPhotoUrl;
    }
  }, [resolvedPhotoUrl]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  useEffect(() => {
    const handleResize = () => redraw();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [redraw]);

  function getCanvasPoint(e: React.MouseEvent | React.TouchEvent): DrawingPoint {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  function handlePointerDown(e: React.MouseEvent | React.TouchEvent) {
    if (mode === 'VIEW') return;
    e.preventDefault();
    const pt = getCanvasPoint(e);
    setIsDrawing(true);

    if (mode === 'MEASURE') {
      setMeasureStart(pt);
      setCurrentPoints([pt]);
      return;
    }

    if (mode === 'RAILING') {
      setCurrentPoints([pt]);
      return;
    }
  }

  function handlePointerMove(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing || mode === 'VIEW') return;
    e.preventDefault();
    const pt = getCanvasPoint(e);

    if (mode === 'MEASURE' && measureStart) {
      const snapped = angleSnap ? snapToAngle(measureStart, pt) : pt;
      setCurrentPoints([measureStart, snapped]);
      return;
    }

    setCurrentPoints((prev) => {
      const last = prev[prev.length - 1];
      const snapped = angleSnap && prev.length > 0 ? snapToAngle(last, pt) : pt;
      return [...prev, snapped];
    });
  }

  function handlePointerUp(_e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentPoints.length < 2) {
      setCurrentPoints([]);
      return;
    }

    if (mode === 'MEASURE' && measureStart) {
      const endPt = currentPoints[currentPoints.length - 1];
      const dx = endPt.x - measureStart.x;
      const dy = endPt.y - measureStart.y;
      const pixelLen = Math.sqrt(dx * dx + dy * dy);

      let label = '';
      if (calibration && calibration.pixelsPerCm > 0) {
        const cmLen = pixelLen / calibration.pixelsPerCm;
        label = `${cmLen.toFixed(1)} cm`;
      }

      const newStroke: DrawingStroke = {
        points: [measureStart, endPt],
        color: '#ff4444',
        width: 2,
        mode: 'MEASURE',
        label,
      };
      const updated = [...strokes, newStroke];
      setStrokes(updated);
      onStrokesChange(updated);
      setMeasureStart(null);
    } else if (mode === 'RAILING') {
      const newStroke: DrawingStroke = {
        points: [...currentPoints],
        color: getRailingColorFromRAL(project.ralColor),
        width: strokeWidth,
        mode: 'RAILING',
      };
      const updated = [...strokes, newStroke];
      setStrokes(updated);
      onStrokesChange(updated);
    }

    setCurrentPoints([]);
  }

  function handleUndo() {
    if (strokes.length === 0) return;
    const last = strokes[strokes.length - 1];
    setUndoneStrokes([...undoneStrokes, last]);
    const updated = strokes.slice(0, -1);
    setStrokes(updated);
    onStrokesChange(updated);
  }

  function handleRedo() {
    if (undoneStrokes.length === 0) return;
    const last = undoneStrokes[undoneStrokes.length - 1];
    const updated = [...strokes, last];
    setStrokes(updated);
    onStrokesChange(updated);
    setUndoneStrokes(undoneStrokes.slice(0, -1));
  }

  function handleClear() {
    setUndoneStrokes([...undoneStrokes, ...strokes]);
    setStrokes([]);
    onStrokesChange([]);
  }

  function handleCalibrate() {
    if (strokes.length === 0) {
      setMode('MEASURE');
      return;
    }
    const lastMeasure = [...strokes].reverse().find((s) => s.mode === 'MEASURE');
    if (lastMeasure && lastMeasure.points.length >= 2) {
      setCalibLineStart(lastMeasure.points[0]);
      setCalibLineEnd(lastMeasure.points[lastMeasure.points.length - 1]);
      setCalibDialogOpen(true);
    }
  }

  function completeCalibration() {
    if (!calibLineStart || !calibLineEnd || !calibRealLength) return;
    const dx = calibLineEnd.x - calibLineStart.x;
    const dy = calibLineEnd.y - calibLineStart.y;
    const pixelLen = Math.sqrt(dx * dx + dy * dy);
    const realCm = parseFloat(calibRealLength);
    if (isNaN(realCm) || realCm <= 0) return;

    const newCalib: CalibrationData = {
      pixelLength: pixelLen,
      realLengthCm: realCm,
      pixelsPerCm: pixelLen / realCm,
    };
    setCalibration(newCalib);
    onCalibrationChange(newCalib);
    setCalibDialogOpen(false);
    setCalibLineStart(null);
    setCalibLineEnd(null);
    setCalibRealLength('');

    const updated = strokes.map((s) => {
      if (s.mode === 'MEASURE' && s.points.length >= 2) {
        const p1 = s.points[0];
        const p2 = s.points[s.points.length - 1];
        const pDx = p2.x - p1.x;
        const pDy = p2.y - p1.y;
        const pLen = Math.sqrt(pDx * pDx + pDy * pDy);
        const cm = pLen / newCalib.pixelsPerCm;
        return { ...s, label: `${cm.toFixed(1)} cm` };
      }
      return s;
    });
    setStrokes(updated);
    onStrokesChange(updated);
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        redrawRef.current();
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  function handleCamera() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const img = new Image();
        img.onload = () => {
          imageRef.current = img;
          redrawRef.current();
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  function handleExport() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onAnnotatedPhotoChange(dataUrl.split(',')[1]);

    const link = document.createElement('a');
    link.download = `ograja-${project.customerName || 'skica'}.png`;
    link.href = dataUrl;
    link.click();
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button
            size="sm"
            variant={mode === 'VIEW' ? 'default' : 'ghost'}
            onClick={() => setMode('VIEW')}
            className="h-8 px-2.5"
          >
            <Eye className="w-4 h-4 mr-1" />
            Pogled
          </Button>
          <Button
            size="sm"
            variant={mode === 'MEASURE' ? 'default' : 'ghost'}
            onClick={() => setMode('MEASURE')}
            className="h-8 px-2.5"
          >
            <Ruler className="w-4 h-4 mr-1" />
            Meritev
          </Button>
          <Button
            size="sm"
            variant={mode === 'RAILING' ? 'default' : 'ghost'}
            onClick={() => setMode('RAILING')}
            className="h-8 px-2.5"
          >
            <Fence className="w-4 h-4 mr-1" />
            Ograja
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={handleUndo} className="h-8 w-8 p-0">
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleRedo} className="h-8 w-8 p-0">
            <Redo2 className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleClear} className="h-8 w-8 p-0">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button size="sm" variant="outline" onClick={handleCamera} className="h-8">
            <Camera className="w-4 h-4 mr-1" />
            Kamera
          </Button>
          <label className="cursor-pointer">
            <Button size="sm" variant="outline" className="h-8" asChild>
              <span>
                <ImageIcon className="w-4 h-4 mr-1" />
                Galerija
              </span>
            </Button>
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
        </div>
      </div>

      {/* Sub-toolbar */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        {mode !== 'VIEW' && (
          <div className="flex items-center gap-2">
            <Label className="text-xs">Debelina</Label>
            <Slider
              value={[strokeWidth]}
              onValueChange={([v]) => setStrokeWidth(v)}
              min={1}
              max={10}
              step={1}
              className="w-20"
            />
            <span className="text-muted-foreground w-4">{strokeWidth}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Switch checked={showGrid} onCheckedChange={setShowGrid} id="grid" />
          <Label htmlFor="grid" className="flex items-center gap-1">
            <Grid3x3 className="w-3 h-3" />
            Mreža
          </Label>
        </div>
        <div className="flex items-center gap-1.5">
          <Switch checked={angleSnap} onCheckedChange={setAngleSnap} id="snap" />
          <Label htmlFor="snap" className="flex items-center gap-1">
            <Magnet className="w-3 h-3" />
            45°
          </Label>
        </div>
        {mode === 'MEASURE' && (
          <Button size="sm" variant="outline" onClick={handleCalibrate} className="h-7 text-xs">
            <Crosshair className="w-3 h-3 mr-1" />
            Kalibriraj
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={handleExport} className="h-7 text-xs ml-auto">
          <Save className="w-3 h-3 mr-1" />
          Izvozi
        </Button>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative w-full aspect-video bg-[#1a1a2e] rounded-lg border border-white/10 overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          className={`w-full h-full ${mode !== 'VIEW' ? 'cursor-crosshair' : 'cursor-default'}`}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        />
        {calibration && (
          <div className="absolute top-2 right-2 bg-black/70 rounded px-2 py-1 text-xs text-cyan-400">
            <Crosshair className="w-3 h-3 inline mr-1" />
            1 cm = {calibration.pixelsPerCm.toFixed(1)} px
          </div>
        )}
        {!resolvedPhotoUrl && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-muted-foreground/50">
              <ImageIcon className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">Naložite fotografijo balkona</p>
              <p className="text-xs">Uporabite Kamera ali Galerija</p>
            </div>
          </div>
        )}
      </div>

      {/* Calibration Dialog */}
      <Dialog open={calibDialogOpen} onOpenChange={setCalibDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Kalibracija meritve</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Vnesite dejansko dolžino označene črte v centimetrih.
            </p>
            <Input
              type="number"
              placeholder="Dolžina v cm"
              value={calibRealLength}
              onChange={(e) => setCalibRealLength(e.target.value)}
            />
            <Button onClick={completeCalibration} className="w-full bg-amber-600 hover:bg-amber-700">
              Potrdi kalibracijo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
