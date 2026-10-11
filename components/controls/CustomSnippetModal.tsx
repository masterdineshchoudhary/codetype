/**
 * CodeType CustomSnippetModal Component
 * Allows pasting custom code snippets or uploading files (.ts, .py, .rs, .go, .sql, etc.)
 * Normalizes tabs, trailing whitespace, and indentation.
 */

'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Code,
  FileCode,
  Upload,
  X,
  Sparkles,
  AlertCircle,
  Check,
} from 'lucide-react';
import type { SupportedLanguage } from '../../types/typing';
import {
  detectLanguageFromFilename,
  normalizeCodeSnippet,
} from '../../lib/syntax/codeNormalizer';

export interface CustomSnippetModalProps {
  isOpen: boolean;
  initialLanguage?: SupportedLanguage;
  onClose: () => void;
  onApplySnippet: (normalizedCode: string, language: SupportedLanguage) => void;
}

const LANGUAGES: { id: SupportedLanguage; label: string }[] = [
  { id: 'typescript', label: 'TypeScript' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'rust', label: 'Rust' },
  { id: 'go', label: 'Go' },
  { id: 'sql', label: 'SQL' },
  { id: 'cpp', label: 'C++' },
  { id: 'html', label: 'HTML' },
  { id: 'css', label: 'CSS' },
];

export function CustomSnippetModal({
  isOpen,
  initialLanguage = 'typescript',
  onClose,
  onApplySnippet,
}: CustomSnippetModalProps) {
  const [code, setCode] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(initialLanguage);
  const [tabSize, setTabSize] = useState<number>(2);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedLanguage(initialLanguage);
  }, [initialLanguage]);

  // Handle file ingestion
  const processFile = useCallback((file: File) => {
    const detected = detectLanguageFromFilename(file.name);
    if (detected) {
      setSelectedLanguage(detected);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (typeof content === 'string') {
        setCode(content);
        setError(null);
      }
    };
    reader.onerror = () => {
      setError('Failed to read file from disk.');
    };
    reader.readAsText(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Submission handler
  const handleApply = () => {
    const { normalized, error: normError } = normalizeCodeSnippet(code, {
      tabSize,
      maxChars: 4000,
    });

    if (normError) {
      setError(normError);
      return;
    }

    onApplySnippet(normalized, selectedLanguage);
    onClose();
  };

  // Keyboard shortcut: Cmd+Enter to apply, Esc to close
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleApply();
    }
  };

  if (!isOpen) return null;

  const charCount = code.length;
  const lineCount = code ? code.split('\n').length : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 font-mono"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        className="relative w-full max-w-2xl bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg)]/40">
          <div className="flex items-center gap-2.5">
            <Code className="w-5 h-5 text-[var(--accent)]" />
            <h2 className="text-sm font-bold text-[var(--text-bright)] tracking-wide">
              Custom Snippet / Code Ingestion
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--text-dim)] hover:text-[var(--text-bright)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          {/* Controls: Language & Tab Size & File Upload */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-dim)] uppercase text-[10px] tracking-wider">
                Language:
              </span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as SupportedLanguage)}
                className="bg-[var(--bg)] border border-[var(--border-subtle)] rounded px-2.5 py-1 text-[var(--text-bright)] focus:outline-none focus:border-[var(--accent)]"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[var(--text-dim)] uppercase text-[10px] tracking-wider">
                Tab:
              </span>
              <div className="flex rounded border border-[var(--border-subtle)] overflow-hidden bg-[var(--bg)]">
                <button
                  type="button"
                  onClick={() => setTabSize(2)}
                  className={`px-2 py-0.5 text-[11px] ${
                    tabSize === 2
                      ? 'bg-[var(--surface-hover)] text-[var(--accent)] font-bold'
                      : 'text-[var(--text-dim)] hover:text-[var(--text-bright)]'
                  }`}
                >
                  2 sp
                </button>
                <button
                  type="button"
                  onClick={() => setTabSize(4)}
                  className={`px-2 py-0.5 text-[11px] border-l border-[var(--border-subtle)] ${
                    tabSize === 4
                      ? 'bg-[var(--surface-hover)] text-[var(--accent)] font-bold'
                      : 'text-[var(--text-dim)] hover:text-[var(--text-bright)]'
                  }`}
                >
                  4 sp
                </button>
              </div>

              {/* Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--surface-hover)] border border-[var(--border-subtle)] hover:border-[var(--text-dim)] rounded text-[var(--text-bright)] transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Upload File</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".ts,.tsx,.js,.jsx,.py,.rs,.go,.sql,.cpp,.html,.css,.txt"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Drag & Drop Area / Textarea */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative rounded-lg border transition-colors ${
              isDragging
                ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                : 'border-[var(--border-subtle)] bg-[var(--bg)]'
            }`}
          >
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (error) setError(null);
              }}
              placeholder={`// Paste your ${selectedLanguage} code snippet here, or drag and drop a source file...\n// Indentation will be normalized automatically.`}
              rows={11}
              className="w-full p-3.5 text-xs font-mono bg-transparent text-[var(--text-bright)] placeholder:text-[var(--text-dim)]/50 focus:outline-none resize-none leading-relaxed"
              spellCheck={false}
            />

            {isDragging && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--bg)]/90 backdrop-blur-sm pointer-events-none rounded-lg">
                <FileCode className="w-8 h-8 text-[var(--accent)] animate-bounce mb-2" />
                <span className="text-xs text-[var(--text-bright)]">Drop code file to load</span>
              </div>
            )}
          </div>

          {/* Validation Error Banner */}
          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded bg-red-950/40 border border-red-600/50 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Stats Bar */}
          <div className="flex items-center justify-between text-[11px] text-[var(--text-dim)]">
            <span>
              {lineCount} lines • {charCount} / 4000 characters
            </span>
            <span>Auto-strips common indent and trailing space</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg)]/30">
          <div className="text-[11px] text-[var(--text-dim)] flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg)] border border-[var(--border-subtle)] text-[10px]">
              ⌘+Enter
            </kbd>
            <span>load drill</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded text-xs text-[var(--text-dim)] hover:text-[var(--text-bright)] hover:bg-[var(--surface-hover)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={charCount === 0}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-bold bg-[var(--accent)] text-[var(--bg)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Load Snippet Drill</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
