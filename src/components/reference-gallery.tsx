'use client';

import React, { useState, useCallback } from 'react';
import PhotoAlbum from 'react-photo-album';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Trash2, Plus, Image as ImageIcon } from 'lucide-react';

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

export function ReferenceGallery({ photos, onPhotosChange }: ReferenceGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const idx = photoItems.indexOf(photo);
                      handleRemovePhoto(idx);
                    }}
                    className="p-1.5 bg-red-600/80 rounded-full hover:bg-red-600 transition-colors"
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
    </div>
  );
}
