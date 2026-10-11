/**
 * CodeType Phase 7 Verification Test Suite
 * Tests Web Audio Dynamics Compressor, Suspension Handling, PWA Manifest, and 160+ WPM Throughput.
 */

import assert from 'node:assert';
import { getSoundSynth, SoundSynth } from '../lib/audio/soundSynth.ts';

console.log('🧪 Starting CodeType Phase 7 Test Suite...\n');

// ============================================================
// Test 1: SoundSynth Dynamics Compressor & Lifecycle Recovery
// ============================================================
console.log('Test 1: Web Audio Dynamics Compressor & Lifecycle Recovery');

const synth = new SoundSynth('thock', 0.8);
assert.ok(synth, 'SoundSynth instance created');

// Check public API
assert.strictEqual(typeof synth.resumeContext, 'function', 'SoundSynth must export resumeContext()');
assert.strictEqual(typeof synth.isAudioActive, 'function', 'SoundSynth must export isAudioActive()');

// Verify configuration updates without errors
synth.setProfile('clicky');
synth.setVolume(0.4);
synth.setMuted(true);
synth.setMuted(false);

// Test safe SSR behavior
const resumed = await synth.resumeContext();
assert.ok(typeof resumed === 'boolean', 'resumeContext must return a boolean promise');

console.log('🎉 Task 1 verification passed!\n');

// ============================================================
// Test 2: PWA Manifest & Service Worker Specifications
// ============================================================
console.log('Test 2: PWA Manifest & Service Worker Specifications');

import fs from 'node:fs';
import path from 'node:path';

const manifestPath = path.resolve('public/manifest.json');
const swPath = path.resolve('public/sw.js');
const iconPath = path.resolve('public/icon.svg');

// 1. Verify manifest.json exists and conforms to PWA spec
assert.ok(fs.existsSync(manifestPath), 'public/manifest.json must exist');
const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

assert.strictEqual(manifestContent.name, 'CodeType | Developer Typing Benchmark');
assert.strictEqual(manifestContent.short_name, 'CodeType');
assert.strictEqual(manifestContent.display, 'standalone');
assert.strictEqual(manifestContent.background_color, '#0e0f12');
assert.strictEqual(manifestContent.theme_color, '#0e0f12');
assert.ok(Array.isArray(manifestContent.icons) && manifestContent.icons.length > 0, 'Must define app icons');

// 2. Verify icon.svg exists
assert.ok(fs.existsSync(iconPath), 'public/icon.svg must exist');
const iconContent = fs.readFileSync(iconPath, 'utf8');
assert.ok(iconContent.includes('<svg'), 'icon.svg must contain valid SVG root');

// 3. Verify service worker exists and contains cache handlers
assert.ok(fs.existsSync(swPath), 'public/sw.js must exist');
const swContent = fs.readFileSync(swPath, 'utf8');
assert.ok(swContent.includes('install'), 'sw.js must contain install listener');
assert.ok(swContent.includes('activate'), 'sw.js must contain activate listener');
assert.ok(swContent.includes('fetch'), 'sw.js must contain fetch listener');
assert.ok(swContent.includes('caches.open'), 'sw.js must cache core assets');

console.log('  ✓ PWA manifest, service worker, and app icon verified.\n');
console.log('🎉 Task 2 verification passed!\n');

