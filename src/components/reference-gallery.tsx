'use client';

import React, { useState, useCallback, useRef } from 'react';
import PhotoAlbum from 'react-photo-album';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Camera, Trash2, Plus, Image as ImageIcon, Pen, Eraser, Undo2, Download } from 'lucide-react';

interface ReferenceGalleryProps {
  photos: string[]; // base64[]
  onPhotosChange: (photos: string[]) => void;
}

interface PhotoItem {
  src: string;
  width: number;
  height: number;
  alt: string;
}

// ─── Image Annotation Modal ─────────────────────────────────────────────

function AnnotationModal({
  open,
  onOpenChange,
  photoBase64,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photoBase64: string;
  onSave: (annotatedBase64: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#FF0000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const strokesRef = useRef<{ points: { x: number; y: number }[]; color: string; width: number; isEraser: boolean }[]>([]);
  const currentStrokeRef = useRef<{ points: { x: number; y: number }[]; color: string; width: number; isEraser: boolean } | null>(null);

  const drawAllStrokes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Redraw base image
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Draw all strokes
      for (const stroke of strokesRef.current) {
        if (stroke.points.length < 2) continue;
        ctx.beginPath();
        ctx.strokeStyle = stroke.isEraser ? 'white' : stroke.color;
        ctx.lineWidth = stroke.width * (stroke.isEraser ? 3 : 1);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (stroke.isEraser) {
          ctx.globalCompositeOperation = 'destination-out';
        } else {
          ctx.globalCompositeOperation = 'source-over';
        }
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
    };
    img.src = `data:image/jpeg;base64,${photoBase64}`;
  }, [photoBase64]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setIsDrawing(true);
    currentStrokeRef.current = {
      points: [{ x, y }],
      color: strokeColor,
      width: strokeWidth,
      isEraser: tool === 'eraser',
    };
  }, [strokeColor, strokeWidth, tool]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStrokeRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    currentStrokeRef.current.points.push({ x, y });

    // Draw current stroke segment
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pts = currentStrokeRef.current.points;
    if (pts.length >= 2) {
      ctx.beginPath();
      ctx.strokeStyle = currentStrokeRef.current.isEraser ? 'rgba(255,255,255,0.8)' : currentStrokeRef.current.color;
      ctx.lineWidth = currentStrokeRef.current.width * (currentStrokeRef.current.isEraser ? 3 : 1);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.stroke();
    }
  }, [isDrawing]);

  const handleMouseUp = useCallback(() => {
    if (currentStrokeRef.current && currentStrokeRef.current.points.length > 1) {
      strokesRef.current.push(currentStrokeRef.current);
    }
    currentStrokeRef.current = null;
    setIsDrawing(false);
  }, []);

  const handleUndo = useCallback(() => {
    strokesRef.current.pop();
    drawAllStrokes();
  }, [drawAllStrokes]);

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const base64 = dataUrl.split(',')[1];
    onSave(base64);
    onOpenChange(false);
  }, [onSave, onOpenChange]);

  React.useEffect(() => {
    if (open) {
      strokesRef.current = [];
      currentStrokeRef.current = null;
      setTimeout(drawAllStrokes, 100);
    }
  }, [open, drawAllStrokes]);

  const annotationColors = ['#FF0000', '#FFFF00', '#00FF00', '#0088FF', '#FF8800', '#FFFFFF'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-zinc-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2">
            <Pen className="w-4 h-4 text-amber-400" />
            Annotiraj fotografijo
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {/* Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1">
              <button
                onClick={() => setTool('pen')}
                className={`p-1.5 rounded ${tool === 'pen' ? 'bg-amber-600' : 'bg-muted'}`}
              >
                <Pen className="w-3.5 h-3.5 text-white" />
              </button>
              <button
                onClick={() => setTool('eraser')}
                className={`p-1.5 rounded ${tool === 'eraser' ? 'bg-amber-600' : 'bg-muted'}`}
              >
                <Eraser className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
            <div className="h-5 w-px bg-white/10" />
            <div className="flex gap-1">
              {annotationColors.map((c) => (
                <button
                  key={c}
                  onClick={() => { setStrokeColor(c); setTool('pen'); }}
                  className={`w-5 h-5 rounded-full border-2 ${strokeColor === c && tool === 'pen' ? 'border-white' : 'border-white/20'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="h-5 w-px bg-white/10" />
            <input
              type="range"
              min="1"
              max="10"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
              className="w-20 h-1"
            />
            <span className="text-[10px] text-muted-foreground">{strokeWidth}px</span>
            <div className="ml-auto flex gap-1">
              <Button variant="outline" size="sm" onClick={handleUndo} className="h-7 text-xs">
                <Undo2 className="w-3 h-3 mr-1" /> Razveljavi
              </Button>
              <Button size="sm" onClick={handleSave} className="h-7 text-xs bg-amber-600 hover:bg-amber-700">
                <Download className="w-3 h-3 mr-1" /> Shrani
              </Button>
            </div>
          </div>

          {/* Canvas */}
          <div className="overflow-auto max-h-[60vh] bg-black/30 rounded-lg">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-full cursor-crosshair"
              style={{ touchAction: 'none' }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Reference Gallery ──────────────────────────────────────────────────

export function ReferenceGallery({ photos, onPhotosChange }: ReferenceGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [annotateIndex, setAnnotateIndex] = useState<number | null>(null);

  const photoItems: PhotoItem[] = photos.map((p, i) => ({
    src: `data:image/jpeg;base64,${p}`,
    width: 4,
    height: 3,
    alt: `Referenčna slika ${i + 1}`,
  }));

  const slides = photos.map((p) => ({
    src: `data:image/jpeg;base64,${p}`,
  }));

  function handleAddPhoto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const base64 = (ev.target?.result as string).split(',')[1];
          if (base64) {
            onPhotosChange([...photos, base64]);
          }
        };
        reader.readAsDataURL(file);
      });
    };
    input.click();
  }

  function handleRemovePhoto(index: number) {
    onPhotosChange(photos.filter((_, i) => i !== index));
  }

  function handleSaveAnnotation(annotatedBase64: string) {
    if (annotateIndex !== null) {
      const updated = [...photos];
      updated[annotateIndex] = annotatedBase64;
      onPhotosChange(updated);
    }
    setAnnotateIndex(null);
  }

  const handleClick = useCallback(({ index }: { index: number }) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Camera className="w-4 h-4 text-amber-500" />
          Referenčne fotografije
          {photos.length > 0 && (
            <span className="text-[10px] text-muted-foreground">({photos.length})</span>
          )}
        </h4>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddPhoto}
          className="h-7 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-600/10"
        >
          <Plus className="w-3 h-3 mr-1" />
          Dodaj
        </Button>
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-white/10 rounded-lg">
          <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-xs text-muted-foreground">Dodajte referenčne fotografije projekta</p>
          <p className="text-[10px] text-muted-foreground mt-1">Pred namestitvijo, med delom in po končani montaži</p>
        </div>
      ) : (
        <>
          <PhotoAlbum
            layout="grid"
            photos={photoItems}
            onClick={handleClick}
            columns={3}
            spacing={4}
            padding={0}
            renderPhoto={({ photo, wrapperStyle, renderDefaultPhoto }) => (
              <div style={wrapperStyle} className="group relative overflow-hidden rounded-lg">
                {renderDefaultPhoto({ photo })}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const idx = photoItems.indexOf(photo);
                      setAnnotateIndex(idx);
                    }}
                    className="p-1.5 bg-amber-600/80 rounded-full hover:bg-amber-600 transition-colors"
                    title="Anotiraj"
                  >
                    <Pen className="w-3 h-3 text-white" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const idx = photoItems.indexOf(photo);
                      handleRemovePhoto(idx);
                    }}
                    className="p-1.5 bg-red-600/80 rounded-full hover:bg-red-600 transition-colors"
                    title="Izbriši"
                  >
                    <Trash2 className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>
            )}
          />

          <Lightbox
            open={lightboxOpen}
            close={() => setLightboxOpen(false)}
            slides={slides}
            index={lightboxIndex}
            on={{ view: ({ index }) => setLightboxIndex(index) }}
          />
        </>
      )}

      {/* Annotation modal */}
      {annotateIndex !== null && photos[annotateIndex] && (
        <AnnotationModal
          open={annotateIndex !== null}
          onOpenChange={(open) => { if (!open) setAnnotateIndex(null); }}
          photoBase64={photos[annotateIndex]}
          onSave={handleSaveAnnotation}
        />
      )}
    </div>
  );
}
