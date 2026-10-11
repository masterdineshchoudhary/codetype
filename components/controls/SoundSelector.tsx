/**
 * CodeType SoundSelector Component
 * Controls mechanical switch profiles (Thock vs Clicky vs Silent) and volume.
 */

'use client';

import React from 'react';
import type { SoundProfile } from '../../types/typing';
import { Volume2, VolumeX } from 'lucide-react';

export interface SoundSelectorProps {
  profile: SoundProfile;
  volume: number;
  isMuted: boolean;
  onProfileChange: (profile: SoundProfile) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}

export function SoundSelector({
  profile,
  volume,
  isMuted,
  onProfileChange,
  onVolumeChange,
  onToggleMute,
}: SoundSelectorProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-1.5 text-xs font-mono select-none bg-[var(--surface)] border border-[var(--border-subtle)] rounded-full">
      {/* Switch profile buttons */}
      <div className="flex items-center gap-1">
        {(['thock', 'clicky', 'silent'] as SoundProfile[]).map((p) => (
          <button
            key={p}
            onClick={() => onProfileChange(p)}
            className={`px-2 py-0.5 rounded capitalize transition-colors ${
              profile === p
                ? 'text-[var(--text-bright)] bg-[var(--surface-hover)] font-medium'
                : 'text-[var(--text-dim)] hover:text-[var(--text-bright)]'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <span className="text-[var(--border-subtle)]">|</span>

      {/* Mute button */}
      <button
        onClick={onToggleMute}
        className="p-1 rounded text-[var(--text-dim)] hover:text-[var(--text-bright)] transition-colors"
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
      </button>

      {/* Volume slider */}
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={isMuted ? 0 : volume}
        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
        className="w-16 h-1 bg-[var(--border-subtle)] accent-[var(--accent)] rounded-lg cursor-pointer"
        title={`Volume: ${Math.round(volume * 100)}%`}
      />
    </div>
  );
}

