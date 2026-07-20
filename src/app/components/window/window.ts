import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  Type,
  HostListener,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AppWindow, WindowService } from '../../services/window';
import { About } from '../../apps/about/about';
import { Projects } from '../../apps/projects/projects';
import { Skills } from '../../apps/skills/skills';
import { Resume } from '../../apps/resume/resume';
import { Contact } from '../../apps/contact/contact';

const COMPONENT_MAP: { [key: string]: Type<any> } = {
  'AboutComponent': About,
  'ProjectsComponent': Projects,
  'SkillsComponent': Skills,
  'ResumeComponent': Resume,
  'ContactComponent': Contact,
};

const MIN_WIDTH = 320;
const MIN_HEIGHT = 220;

export type ResizeEdge =
  | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw' | null;

@Component({
  selector: 'app-window',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './window.html',
  styleUrls: ['./window.scss'],
})
export class WindowComponent implements OnInit, OnDestroy {
  @Input() window!: AppWindow;
  @Input() zIndex!: number;

  private windowService = inject(WindowService);
  private cdr = inject(ChangeDetectorRef);

  componentType!: Type<any>;
  isMaximized = false;

  // ─── Resize state ────────────────────────────────────────────────────────────
  isResizing = false;
  private resizeEdge: ResizeEdge = null;

  // Snapshot of geometry at the start of a resize gesture
  private resizeStart = { mouseX: 0, mouseY: 0, x: 0, y: 0, width: 0, height: 0 };

  ngOnInit() {
    this.componentType = COMPONENT_MAP[this.window.component];
  }

  ngOnDestroy() {
    this.cleanupResize();
  }

  // ─── Window controls ─────────────────────────────────────────────────────────

  focus() {
    this.windowService.focusWindow(this.window.id);
  }

  close(event: Event) {
    event.stopPropagation();
    this.windowService.closeApp(this.window.id);
  }

  minimize(event: Event) {
    event.stopPropagation();
    this.windowService.toggleMinimize(this.window.id);
  }

  maximize(event: Event) {
    event.stopPropagation();
    this.isMaximized = !this.isMaximized;
  }

  // ─── Resize ──────────────────────────────────────────────────────────────────

  onResizeStart(edge: ResizeEdge, event: MouseEvent) {
    if (this.isMaximized) return;
    event.preventDefault();
    event.stopPropagation();

    this.isResizing = true;
    this.resizeEdge = edge;
    this.resizeStart = {
      mouseX: event.clientX,
      mouseY: event.clientY,
      x: this.window.geometry.x,
      y: this.window.geometry.y,
      width: this.window.geometry.width,
      height: this.window.geometry.height,
    };

    this.focus();

    document.addEventListener('mousemove', this.onResizeMove, { passive: false });
    document.addEventListener('mouseup', this.onResizeEnd, { once: true });
    document.body.style.userSelect = 'none';
    document.body.style.cursor = this.getCursorForEdge(edge);
  }

  private onResizeMove = (event: MouseEvent) => {
    if (!this.isResizing || !this.resizeEdge) return;

    const dx = event.clientX - this.resizeStart.mouseX;
    const dy = event.clientY - this.resizeStart.mouseY;
    const edge = this.resizeEdge;

    let { x, y, width, height } = this.resizeStart;

    // Horizontal
    if (edge.includes('e')) {
      width = Math.max(MIN_WIDTH, this.resizeStart.width + dx);
    }
    if (edge.includes('w')) {
      const newWidth = Math.max(MIN_WIDTH, this.resizeStart.width - dx);
      x = this.resizeStart.x + (this.resizeStart.width - newWidth);
      width = newWidth;
    }

    // Vertical
    if (edge.includes('s')) {
      height = Math.max(MIN_HEIGHT, this.resizeStart.height + dy);
    }
    if (edge.includes('n')) {
      const newHeight = Math.max(MIN_HEIGHT, this.resizeStart.height - dy);
      y = this.resizeStart.y + (this.resizeStart.height - newHeight);
      height = newHeight;
    }

    // Write directly to avoid triggering a full re-render from the service on every pixel
    this.window.geometry.x = x;
    this.window.geometry.y = y;
    this.window.geometry.width = width;
    this.window.geometry.height = height;
    this.cdr.detectChanges();
  };

  private onResizeEnd = () => {
    this.cleanupResize();
    // Commit the final geometry to the service
    const { x, y, width, height } = this.window.geometry;
    this.windowService.updateGeometryFull(this.window.id, x, y, width, height);
  };

  private cleanupResize() {
    this.isResizing = false;
    this.resizeEdge = null;
    document.removeEventListener('mousemove', this.onResizeMove);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }

  getCursorForEdge(edge: ResizeEdge): string {
    const map: Record<string, string> = {
      n: 'n-resize', ne: 'ne-resize', e: 'e-resize', se: 'se-resize',
      s: 's-resize', sw: 'sw-resize', w: 'w-resize', nw: 'nw-resize',
    };
    return edge ? map[edge] : '';
  }
}
