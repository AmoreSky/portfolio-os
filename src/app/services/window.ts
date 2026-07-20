import { Injectable, Type } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AppWindow {
  id: string;
  title: string;
  icon: string;
  component: string;
  isOpen: boolean;
  isMinimized: boolean;
  isFocused: boolean;
  geometry: { x: number; y: number; width: number; height: number };
  zIndex: number;
}

export const APPS = [
  { id: 'about', title: 'About Me', icon: 'fa-user', component: 'AboutComponent' },
  { id: 'projects', title: 'Projects', icon: 'fa-folder-open', component: 'ProjectsComponent' },
  { id: 'skills', title: 'Skills', icon: 'fa-code', component: 'SkillsComponent' },
  { id: 'resume', title: 'Resume', icon: 'fa-file-pdf', component: 'ResumeComponent' },
  { id: 'contact', title: 'Contact', icon: 'fa-envelope', component: 'ContactComponent' },
];

@Injectable({
  providedIn: 'root'
})
export class WindowService {
  private windows: AppWindow[] = [];
  private windowsSubject = new BehaviorSubject<AppWindow[]>(this.windows);
  windows$ = this.windowsSubject.asObservable();

  private launcherSubject = new BehaviorSubject<boolean>(false);
  launcher$ = this.launcherSubject.asObservable();

  private activitiesSubject = new BehaviorSubject<boolean>(false);
  activities$ = this.activitiesSubject.asObservable();

  private maxZIndex = 10;

  toggleLauncher() {
    this.launcherSubject.next(!this.launcherSubject.value);
  }

  closeLauncher() {
    this.launcherSubject.next(false);
  }

  toggleActivities() {
    this.activitiesSubject.next(!this.activitiesSubject.value);
  }

  closeActivities() {
    this.activitiesSubject.next(false);
  }

  openApp(appId: string) {
    const existing = this.windows.find(w => w.id === appId);
    if (existing) {
      existing.isMinimized = false;
      this.focusWindow(appId);
      return;
    }

    const appDef = APPS.find(a => a.id === appId);
    if (!appDef) return;

    this.maxZIndex++;

    // Calculate a slight randomly offset position so they don't exactly stack
    const offset = this.windows.length * 30;

    const newWindow: AppWindow = {
      ...appDef,
      isOpen: true,
      isMinimized: false,
      isFocused: true,
      geometry: { x: 100 + offset, y: 100 + offset, width: 800, height: 600 },
      zIndex: this.maxZIndex
    };

    // Unfocus all others
    this.windows.forEach(w => w.isFocused = false);

    this.windows.push(newWindow);
    this.emit();
  }

  closeApp(appId: string) {
    this.windows = this.windows.filter(w => w.id !== appId);
    this.emit();
  }

  toggleMinimize(appId: string) {
    const win = this.windows.find(w => w.id === appId);
    if (win) {
      if (win.isMinimized) {
        win.isMinimized = false;
        this.focusWindow(appId);
      } else {
        if (win.isFocused) {
          win.isMinimized = true;
          win.isFocused = false;
        } else {
          this.focusWindow(appId);
        }
      }
      this.emit();
    }
  }

  focusWindow(appId: string) {
    const win = this.windows.find(w => w.id === appId);
    if (win) {
      this.windows.forEach(w => w.isFocused = false);
      win.isFocused = true;
      this.maxZIndex++;
      win.zIndex = this.maxZIndex;
      this.emit();
    }
  }

  updateGeometry(appId: string, x: number, y: number) {
    const win = this.windows.find(w => w.id === appId);
    if (win) {
      win.geometry.x = x;
      win.geometry.y = y;
      this.emit();
    }
  }

  updateSize(appId: string, width: number, height: number) {
    const win = this.windows.find(w => w.id === appId);
    if (win) {
      win.geometry.width = width;
      win.geometry.height = height;
      this.emit();
    }
  }

  updateGeometryFull(appId: string, x: number, y: number, width: number, height: number) {
    const win = this.windows.find(w => w.id === appId);
    if (win) {
      win.geometry.x = x;
      win.geometry.y = y;
      win.geometry.width = width;
      win.geometry.height = height;
      this.emit();
    }
  }

  private emit() {
    this.windowsSubject.next([...this.windows]);
  }
}
