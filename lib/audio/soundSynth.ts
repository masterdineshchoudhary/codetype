/**
 * CodeType Sound Synthesizer
 * Low-latency mechanical switch audio synthesis using the Web Audio API.
 * Zero external audio assets required.
 */

import type { KeySoundType, SoundProfile } from '../../types/typing';

export class SoundSynth {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private profile: SoundProfile = 'thock';
  private volume: number = 0.5;
  private isMuted: boolean = false;
  private noiseBuffer: AudioBuffer | null = null;

  constructor(profile: SoundProfile = 'thock', volume: number = 0.5) {
    this.profile = profile;
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Lazily initializes AudioContext upon first user interaction to comply
   * with browser autoplay policies.
   */
  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (!AudioContextClass) return null;

      this.ctx = new AudioContextClass();

      // Master gain node
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);

      // Dynamics Compressor acting as master peak limiter for 160+ WPM bursts
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(6, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.05, this.ctx.currentTime);

      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.ctx.destination);

      // Pre-render a 100ms white noise buffer for tactile transient clicks
      this.noiseBuffer = this.createNoiseBuffer(this.ctx, 0.1);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {
        // Handled silently if user hasn't interacted yet
      });
    }

    return this.ctx;
  }

  /**
   * Proactively resumes AudioContext if suspended by browser autoplay policy
   * or OS background tab suspension.
   */
  public async resumeContext(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    const ctx = this.initContext();
    if (!ctx) return false;

    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
        return true;
      } catch {
        return false;
      }
    }
    return ctx.state === 'running';
  }

  /**
   * Returns whether audio context is initialized and active
   */
  public isAudioActive(): boolean {
    return this.ctx !== null && this.ctx.state === 'running';
  }


  /**
   * Pre-allocates a short mono white noise buffer for switch mechanical contact transients.
   */
  private createNoiseBuffer(ctx: AudioContext, durationSeconds: number): AudioBuffer {
    const bufferSize = Math.floor(ctx.sampleRate * durationSeconds);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // Pink/white noise blend with soft falloff
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }
    return buffer;
  }

  /**
   * Applies subtle natural pitch jitter to prevent the robotic machine-gun effect
   */
  private getJitterFactor(variance: number = 0.03): number {
    return 1 + (Math.random() * 2 - 1) * variance;
  }

  /**
   * Play keystroke sound based on current profile and key type
   */
  public playKeySound(type: KeySoundType = 'alphanumeric'): void {
    if (this.profile === 'silent' || this.isMuted) return;

    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;

    switch (this.profile) {
      case 'thock':
        this.synthesizeThock(ctx, now, type);
        break;
      case 'clicky':
        this.synthesizeClicky(ctx, now, type);
        break;
      default:
        break;
    }
  }

  // =========================================================================
  // Profile 1: Thock (Lubed Linear Switch)
  // Low-pitch transient thud + damped resonant acoustic body
  // =========================================================================
  private synthesizeThock(ctx: AudioContext, now: number, type: KeySoundType): void {
    if (!this.masterGain) return;

    const jitter = this.getJitterFactor(0.025);

    let baseFreq: number;
    let endFreq: number;
    let decayDuration: number;
    let filterFreq: number;
    let filterQ: number;
    let transientGainVal: number;

    switch (type) {
      case 'space':
        // Deeper bass punch for large spacebar housing
        baseFreq = 105 * jitter;
        endFreq = 42 * jitter;
        decayDuration = 0.075;
        filterFreq = 380;
        filterQ = 1.8;
        transientGainVal = 0.22;
        break;

      case 'backspace':
        // Lighter, subtle hollow tap
        baseFreq = 180 * jitter;
        endFreq = 95 * jitter;
        decayDuration = 0.045;
        filterFreq = 520;
        filterQ = 1.2;
        transientGainVal = 0.15;
        break;

      case 'error':
        // Tactile muted scrape / discordant low thud
        this.synthesizeErrorScrape(ctx, now);
        return;

      case 'alphanumeric':
      default:
        // Deep lubed linear thud
        baseFreq = 145 * jitter;
        endFreq = 58 * jitter;
        decayDuration = 0.055;
        filterFreq = 460;
        filterQ = 2.2;
        transientGainVal = 0.18;
        break;
    }

    // 1. Transient stem contact (tiny filtered noise tick)
    if (this.noiseBuffer) {
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = this.noiseBuffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1200 * jitter, now);
      noiseFilter.Q.setValueAtTime(2.0, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(transientGainVal, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      noiseSource.start(now);
      noiseSource.stop(now + 0.015);
    }

    // 2. Resonant body pitch-drop oscillator (Bottom-out thud)
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + decayDuration);

    const bodyFilter = ctx.createBiquadFilter();
    bodyFilter.type = 'lowpass';
    bodyFilter.frequency.setValueAtTime(filterFreq, now);
    bodyFilter.Q.setValueAtTime(filterQ, now);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.55, now);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + decayDuration);

    osc.connect(bodyFilter);
    bodyFilter.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + decayDuration + 0.01);
  }

  // =========================================================================
  // Profile 2: Clicky (Mechanical Clicky Switch)
  // Sharp high-frequency click leaf snap + crisp tactile pop
  // =========================================================================
  private synthesizeClicky(ctx: AudioContext, now: number, type: KeySoundType): void {
    if (!this.masterGain) return;

    const jitter = this.getJitterFactor(0.03);

    let clickFreq: number;
    let clackFreq: number;
    let clickDecay: number;

    switch (type) {
      case 'space':
        clickFreq = 2600 * jitter;
        clackFreq = 240 * jitter;
        clickDecay = 0.022;
        break;

      case 'backspace':
        clickFreq = 3400 * jitter;
        clackFreq = 320 * jitter;
        clickDecay = 0.014;
        break;

      case 'error':
        this.synthesizeErrorScrape(ctx, now);
        return;

      case 'alphanumeric':
      default:
        clickFreq = 3100 * jitter;
        clackFreq = 420 * jitter;
        clickDecay = 0.016;
        break;
    }

    // 1. Sharp Click Leaf Snap (High frequency resonant pop)
    const clickOsc = ctx.createOscillator();
    clickOsc.type = 'sine';
    clickOsc.frequency.setValueAtTime(clickFreq, now);
    clickOsc.frequency.exponentialRampToValueAtTime(clickFreq * 0.45, now + clickDecay);

    const clickFilter = ctx.createBiquadFilter();
    clickFilter.type = 'highpass';
    clickFilter.frequency.setValueAtTime(1800, now);

    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.42, now);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + clickDecay);

    clickOsc.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(this.masterGain);

    clickOsc.start(now);
    clickOsc.stop(now + clickDecay + 0.005);

    // 2. High-frequency noise transient for crisp acoustic clack
    if (this.noiseBuffer) {
      const snapNoise = ctx.createBufferSource();
      snapNoise.buffer = this.noiseBuffer;

      const snapFilter = ctx.createBiquadFilter();
      snapFilter.type = 'bandpass';
      snapFilter.frequency.setValueAtTime(clickFreq * 1.1, now);
      snapFilter.Q.setValueAtTime(3.5, now);

      const snapGain = ctx.createGain();
      snapGain.gain.setValueAtTime(0.3, now);
      snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.008);

      snapNoise.connect(snapFilter);
      snapFilter.connect(snapGain);
      snapGain.connect(this.masterGain);

      snapNoise.start(now);
      snapNoise.stop(now + 0.01);
    }

    // 3. Bottom out chassis clack (Subtle secondary tone)
    const clackOsc = ctx.createOscillator();
    clackOsc.type = 'triangle';
    clackOsc.frequency.setValueAtTime(clackFreq, now + 0.004);
    clackOsc.frequency.exponentialRampToValueAtTime(clackFreq * 0.5, now + 0.035);

    const clackGain = ctx.createGain();
    clackGain.gain.setValueAtTime(0.0001, now);
    clackGain.gain.setValueAtTime(0.22, now + 0.004);
    clackGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    clackOsc.connect(clackGain);
    clackGain.connect(this.masterGain);

    clackOsc.start(now + 0.004);
    clackOsc.stop(now + 0.045);
  }

  // =========================================================================
  // Error Chirp / Tactile Scrape
  // Non-intrusive tactile friction click indicating mistyped character
  // =========================================================================
  private synthesizeErrorScrape(ctx: AudioContext, now: number): void {
    if (!this.masterGain) return;

    // Dual dissonant frequencies for muted friction click
    const oscA = ctx.createOscillator();
    const oscB = ctx.createOscillator();

    oscA.type = 'sawtooth';
    oscB.type = 'sawtooth';

    oscA.frequency.setValueAtTime(220, now);
    oscB.frequency.setValueAtTime(262, now); // Minor third dissonance

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, now);
    filter.Q.setValueAtTime(3.0, now);

    const errGain = ctx.createGain();
    errGain.gain.setValueAtTime(0.18, now);
    errGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    oscA.connect(filter);
    oscB.connect(filter);
    filter.connect(errGain);
    errGain.connect(this.masterGain);

    oscA.start(now);
    oscB.start(now);
    oscA.stop(now + 0.04);
    oscB.stop(now + 0.04);
  }

  // =========================================================================
  // Public Configuration & Controls
  // =========================================================================

  public setProfile(profile: SoundProfile): void {
    this.profile = profile;
  }

  public getProfile(): SoundProfile {
    return this.profile;
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Cleans up audio context and active nodes
   */
  public dispose(): void {
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close().catch(() => {});
      this.ctx = null;
      this.masterGain = null;
      this.noiseBuffer = null;
    }
  }
}

// Singleton helper for shared audio instances
let globalSynthInstance: SoundSynth | null = null;

export function getSoundSynth(): SoundSynth {
  if (!globalSynthInstance) {
    globalSynthInstance = new SoundSynth('thock', 0.5);
  }
  return globalSynthInstance;
}
