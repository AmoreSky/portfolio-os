import { Injectable, signal, computed } from '@angular/core';

export interface WallpaperOption {
  id: string;
  label: string;
  url: string;
  thumbnail: string; // same url, CSS will handle sizing
}

export interface AccentSwatch {
  label: string;
  color: string;
  hover: string;
}

const STORAGE_ACCENT = 'ub-accent-color';
const STORAGE_WALLPAPER = 'ub-wallpaper';

export const ACCENT_SWATCHES: AccentSwatch[] = [
  { label: 'Ubuntu Orange', color: '#E95420', hover: '#C94210' },
  { label: 'Terracotta',    color: '#C0614A', hover: '#A0513A' },
  { label: 'Sage',          color: '#5A8A6A', hover: '#3A6A4A' },
  { label: 'Dusty Blue',    color: '#5578A0', hover: '#3D5880' },
  { label: 'Plum',          color: '#7A5080', hover: '#5A3060' },
  { label: 'Slate',         color: '#607080', hover: '#405060' },
  { label: 'Crimson',       color: '#B03050', hover: '#902030' },
  { label: 'Sand',          color: '#A07840', hover: '#806020' },
];

export const WALLPAPER_OPTIONS: WallpaperOption[] = [
  {
    id: 'default',
    label: 'Ubuntu Default',
    url: '/wallpaper.jpg',
    thumbnail: '/wallpaper.jpg',
  },
  {
    id: 'geometric',
    label: 'Dark Geometric',
    url: '/wallpaper-geometric.png',
    thumbnail: '/wallpaper-geometric.png',
  },
  {
    id: 'noble',
    label: 'Noble Numbat',
    url: '/wallpaper-noble.png',
    thumbnail: '/wallpaper-noble.png',
  },
  {
    id: 'midnight',
    label: 'Midnight',
    url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&q=70',
  },
  {
    id: 'peaks',
    label: 'Mountain Peaks',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=70',
  },
  {
    id: 'forest',
    label: 'Dark Forest',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=70',
  },
];

@Injectable({ providedIn: 'root' })
export class SettingsService {
  // ─── Signals ──────────────────────────────────────────────────────────────

  readonly accentColor = signal<string>(
    localStorage.getItem(STORAGE_ACCENT) ?? '#E95420'
  );

  readonly wallpaperUrl = signal<string>(
    localStorage.getItem(STORAGE_WALLPAPER) ?? '/wallpaper.png'
  );

  readonly activeWallpaperId = computed(() => {
    const url = this.wallpaperUrl();
    return WALLPAPER_OPTIONS.find(w => w.url === url)?.id ?? 'custom';
  });

  // ─── Init ─────────────────────────────────────────────────────────────────

  constructor() {
    // Apply persisted values immediately on service creation
    this.applyAccent(this.accentColor());
    this.applyWallpaper(this.wallpaperUrl());
  }

  // ─── Accent ───────────────────────────────────────────────────────────────

  setAccentColor(color: string): void {
    this.accentColor.set(color);
    localStorage.setItem(STORAGE_ACCENT, color);
    this.applyAccent(color);
  }

  private applyAccent(hex: string): void {
    const root = document.documentElement.style;
    // Derive the hover shade (darken ~15%)
    const hover = this.darken(hex, 0.15);
    // Derive the dim (15% alpha overlay)
    const rgb = this.hexToRgb(hex);
    const dim   = `rgba(${rgb}, 0.15)`;
    const border = `rgba(${rgb}, 0.35)`;

    root.setProperty('--ub-orange',        hex);
    root.setProperty('--ub-orange-hover',  hover);
    root.setProperty('--ub-orange-dim',    dim);
    root.setProperty('--ub-orange-border', border);
    // Legacy alias
    root.setProperty('--ubuntu-orange',    hex);
  }

  // ─── Wallpaper ────────────────────────────────────────────────────────────

  setWallpaper(url: string): void {
    this.wallpaperUrl.set(url);
    localStorage.setItem(STORAGE_WALLPAPER, url);
    this.applyWallpaper(url);
  }

  private applyWallpaper(url: string): void {
    document.documentElement.style.setProperty(
      '--ub-wallpaper',
      `url('${url}')`
    );
  }

  // ─── Color Utilities ──────────────────────────────────────────────────────

  private hexToRgb(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  }

  private darken(hex: string, amount: number): string {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    r = Math.max(0, Math.round(r * (1 - amount)));
    g = Math.max(0, Math.round(g * (1 - amount)));
    b = Math.max(0, Math.round(b * (1 - amount)));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}
