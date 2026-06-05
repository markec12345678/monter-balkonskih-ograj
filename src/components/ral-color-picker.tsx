'use client';

import React, { useState, useMemo } from 'react';
import { RAL_BALCONY_COLORS, RAL_CATEGORIES } from '@/lib/ral-colors';
import { RALColor } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RALColorPickerProps {
  value: string;
  onChange: (code: string, name: string) => void;
}

export function RALColorPicker({ value, onChange }: RALColorPickerProps) {
  const [category, setCategory] = useState<string>('Vse');
  const [search, setSearch] = useState('');

  const filteredColors = useMemo(() => {
    let colors: RALColor[] = RAL_BALCONY_COLORS;
    if (category !== 'Vse') {
      colors = colors.filter((c) => c.category === category);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      colors = colors.filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q)
      );
    }
    return colors;
  }, [category, search]);

  const selectedColor = RAL_BALCONY_COLORS.find((c) => c.code === value);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {selectedColor && (
          <div
            className="w-8 h-8 rounded border border-white/20 flex-shrink-0"
            style={{ backgroundColor: selectedColor.hexColor }}
          />
        )}
        <span className="text-sm text-muted-foreground">
          {selectedColor ? `RAL ${selectedColor.code} - ${selectedColor.name}` : 'Izberite barvo'}
        </span>
      </div>

      <Input
        placeholder="Išči RAL kodo ali ime..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-9 text-sm"
      />

      <div className="flex flex-wrap gap-1.5">
        {RAL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
              category === cat
                ? 'bg-amber-600 text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <ScrollArea className="h-52">
        <div className="grid grid-cols-2 gap-1.5 pr-2">
          {filteredColors.map((color) => (
            <button
              key={color.code}
              onClick={() => onChange(color.code, color.name)}
              className={cn(
                'flex items-center gap-2 p-2 rounded-lg border transition-all hover:bg-muted/50',
                value === color.code
                  ? 'border-amber-500 ring-1 ring-amber-500/50'
                  : 'border-transparent'
              )}
            >
              <div className="relative flex-shrink-0">
                <div
                  className="w-7 h-7 rounded border border-white/20"
                  style={{ backgroundColor: color.hexColor }}
                />
                {value === color.code && (
                  <Check
                    className={cn(
                      'absolute inset-0 w-7 h-7 p-1',
                      color.hexColor === '#FFFFFF' || color.hexColor === '#EDEDED' || color.hexColor === '#F6F6F6'
                        ? 'text-black'
                        : 'text-white'
                    )}
                  />
                )}
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-medium truncate">{color.code}</div>
                <div className="text-[10px] text-muted-foreground truncate">{color.name}</div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
