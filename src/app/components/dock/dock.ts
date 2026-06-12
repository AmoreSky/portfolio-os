import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WindowService, APPS, AppWindow } from '../../services/window';

@Component({
  selector: 'app-dock',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dock.html',
  styleUrls: ['./dock.scss'],
})
export class Dock {
  dockApps = APPS;

  constructor(public windowService: WindowService) { }

  toggleApp(appId: string, event: Event) {
    event.stopPropagation();
    this.windowService.openApp(appId);
  }

  isAppOpen(appId: string, openWindows: AppWindow[]): boolean {
    return openWindows.some(w => w.id === appId);
  }

  isAppFocused(appId: string, openWindows: AppWindow[]): boolean {
    return openWindows.some(w => w.id === appId && w.isFocused);
  }
}
