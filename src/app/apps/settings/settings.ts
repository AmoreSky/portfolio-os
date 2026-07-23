import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  SettingsService,
  ACCENT_SWATCHES,
  WALLPAPER_OPTIONS,
  AccentSwatch,
  WallpaperOption,
} from '../../services/settings.service';

type SettingsPanel = 'appearance' | 'wallpaper' | 'accent';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  readonly swatches: AccentSwatch[] = ACCENT_SWATCHES;
  readonly wallpapers: WallpaperOption[] = WALLPAPER_OPTIONS;

  activePanel = signal<SettingsPanel>('appearance');
  customWallpaperUrl = signal('');
  customColorInput = signal('#E95420');

  constructor(public settingsService: SettingsService) {
    // Initialize after service is available
    this.customColorInput.set(settingsService.accentColor());
  }

  selectPanel(panel: SettingsPanel): void {
    this.activePanel.set(panel);
  }

  selectWallpaper(wp: WallpaperOption): void {
    this.settingsService.setWallpaper(wp.url);
  }

  applyCustomWallpaper(): void {
    const url = this.customWallpaperUrl().trim();
    if (url) {
      this.settingsService.setWallpaper(url);
    }
  }

  selectSwatch(swatch: AccentSwatch): void {
    this.customColorInput.set(swatch.color);
  }

  onColorInputChange(value: string): void {
    this.customColorInput.set(value);
  }

  applyAccentColor(): void {
    this.settingsService.setAccentColor(this.customColorInput());
  }

  resetDefaults(): void {
    this.settingsService.setAccentColor('#E95420');
    this.settingsService.setWallpaper('/wallpaper.png');
    this.customColorInput.set('#E95420');
    this.customWallpaperUrl.set('');
  }

  isActiveSwatch(color: string): boolean {
    return this.customColorInput() === color;
  }
}
