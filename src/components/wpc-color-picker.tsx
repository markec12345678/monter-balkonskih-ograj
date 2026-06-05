'use client';

import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { WPC_COLORS, WpcProfile } from '@/lib/types';
import { Label } from '@/components/ui/label';

interface WpcColorPickerProps {
  value: WpcProfile;
  onChange: (profileId: WpcProfile, colorName: string, hexColor: string) => void;
}

export function WpcColorPicker({ value, onChange }: WpcColorPickerProps) {
  const [customColor, setCustomColor] = useState('#8B6914');
  const [showCustom, setShowCustom] = useState(false);

  return (
    <div className="space-y-3">
      <Label className="text-xs font-medium">WPC WoodCore Barva</Label>

      {/* 8 prednastavljenih WPC barv */}
      <div className="grid grid-cols-4 gap-2">
        {WPC_COLORS.map((color) => (
          <button
            key={color.id}
            onClick={() => onChange(color.id, color.name, color.hexColor)}
            className={`group relative flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all ${
              value === color.id
                ? 'border-amber-500 bg-amber-600/10 ring-1 ring-amber-500/50'
                : 'border-white/5 hover:border-white/20 hover:bg-white/5'
            }`}
          >
            <div
              className="w-8 h-8 rounded-full border-2 border-white/20 shadow-md group-hover:scale-110 transition-transform"
              style={{ backgroundColor: color.hexColor }}
            />
            <span className="text-[10px] text-center leading-tight font-medium">
              {color.name}
            </span>
            {value === color.id && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                <span className="text-[8px] text-white font-bold">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Opis izbrane barve */}
      {WPC_COLORS.find((c) => c.id === value) && (
        <div className="bg-muted/30 rounded-lg p-2 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg border border-white/10 flex-shrink-0"
            style={{ backgroundColor: WPC_COLORS.find((c) => c.id === value)?.hexColor }}
          />
          <div>
            <div className="text-xs font-medium">
              {WPC_COLORS.find((c) => c.id === value)?.name}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {WPC_COLORS.find((c) => c.id === value)?.description}
            </div>
          </div>
        </div>
      )}

      {/* Custom color picker */}
      <div className="border-t border-white/5 pt-3">
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="text-xs text-muted-foreground hover:text-amber-400 transition-colors"
        >
          {showCustom ? '▲ Skrij izbiro barve po meri' : '▼ Izbira barve po meri (za RAL primerjavo)'}
        </button>
        {showCustom && (
          <div className="mt-3 space-y-2">
            <div className="flex items-start gap-4">
              <HexColorPicker color={customColor} onChange={setCustomColor} />
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-lg border border-white/10"
                    style={{ backgroundColor: customColor }}
                  />
                  <div>
                    <div className="text-xs font-medium">{customColor.toUpperCase()}</div>
                    <div className="text-[10px] text-muted-foreground">Izbrana barva</div>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Uporabite za primerjavo z RAL barvami kovinskih delov (stebrički, nosilci).
                  WPC letve so na voljo samo v 8 standardnih WoodCore odtenkih.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
