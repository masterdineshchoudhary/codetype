/**
 * CodeType Sound Effects Controller Hook (useSoundEffects)
 * Manages SoundSynth state and profile preferences.
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import type { KeySoundType, SoundProfile } from '../types/typing';
import { getSoundSynth } from '../lib/audio/soundSynth';

const SOUND_STORAGE_KEY = 'codetype_sound_profile_v1';
const VOLUME_STORAGE_KEY = 'codetype_sound_volume_v1';

export function useSoundEffects() {
  const synth = getSoundSynth();
  const [profile, setProfileState] = useState<SoundProfile>('thock');
  const [volume, setVolumeState] = useState<number>(0.5);
  const [isMuted, setIsMutedState] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(SOUND_STORAGE_KEY) as SoundProfile | null;
      if (savedProfile && ['thock', 'clicky', 'silent'].includes(savedProfile)) {
        setProfileState(savedProfile);
        synth.setProfile(savedProfile);
      }
      const savedVol = localStorage.getItem(VOLUME_STORAGE_KEY);
      if (savedVol !== null) {
        const parsed = parseFloat(savedVol);
        if (!isNaN(parsed)) {
          setVolumeState(parsed);
          synth.setVolume(parsed);
        }
      }
    } catch {
      // Ignore
    }
  }, [synth]);

  // Proactively resume AudioContext on user gesture, tab visibility, or window focus
  useEffect(() => {
    const handleResume = () => {
      synth.resumeContext();
    };

    window.addEventListener('pointerdown', handleResume, { once: true, passive: true });
    window.addEventListener('keydown', handleResume, { once: true, passive: true });
    window.addEventListener('focus', handleResume, { passive: true });

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        synth.resumeContext();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleResume);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [synth]);


  const setProfile = useCallback(
    (newProfile: SoundProfile) => {
      setProfileState(newProfile);
      synth.setProfile(newProfile);
      try {
        localStorage.setItem(SOUND_STORAGE_KEY, newProfile);
      } catch {
        // Ignore
      }
    },
    [synth]
  );

  const setVolume = useCallback(
    (newVolume: number) => {
      const clamped = Math.max(0, Math.min(1, newVolume));
      setVolumeState(clamped);
      synth.setVolume(clamped);
      try {
        localStorage.setItem(VOLUME_STORAGE_KEY, clamped.toString());
      } catch {
        // Ignore
      }
    },
    [synth]
  );

  const toggleMute = useCallback(() => {
    const nextMuted = synth.toggleMute();
    setIsMutedState(nextMuted);
  }, [synth]);

  const playSound = useCallback(
    (type: KeySoundType = 'alphanumeric') => {
      synth.playKeySound(type);
    },
    [synth]
  );

  return {
    profile,
    volume,
    isMuted,
    setProfile,
    setVolume,
    toggleMute,
    playSound,
  };
}

