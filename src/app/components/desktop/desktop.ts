import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Taskbar } from '../taskbar/taskbar';
import { Dock } from '../dock/dock';
import { WindowComponent } from '../window/window';
import { WindowService, APPS } from '../../services/window';

@Component({
  selector: 'app-desktop',
  standalone: true,
  imports: [CommonModule, Taskbar, Dock, WindowComponent],
  templateUrl: './desktop.html',
  styleUrls: ['./desktop.scss'],
})
export class Desktop {
  apps = APPS;
  
  constructor(public windowService: WindowService) {}

  openApp(appId: string) {
    this.windowService.openApp(appId);
  }

  focusApp(appId: string) {
    this.windowService.focusWindow(appId);
  }

  closeLauncher(event: Event) {
    if ((event.target as HTMLElement).classList.contains('app-launcher')) {
      this.windowService.closeLauncher();
    }
  }

  closeActivities(event: Event) {
    if ((event.target as HTMLElement).classList.contains('activities-overlay')) {
      this.windowService.closeActivities();
    }
  }
}
