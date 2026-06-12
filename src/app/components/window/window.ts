import { Component, Input, OnInit, Type } from '@angular/core';
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
  'ContactComponent': Contact
};

@Component({
  selector: 'app-window',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './window.html',
  styleUrls: ['./window.scss'],
})
export class WindowComponent implements OnInit {
  @Input() window!: AppWindow;
  @Input() zIndex!: number;

  componentType!: Type<any>;
  isMaximized = false;
  
  // Save previous geometry before maximizing
  prevGeometry = { x: 0, y: 0, width: 0, height: 0 };

  constructor(private windowService: WindowService) {}

  ngOnInit() {
    this.componentType = COMPONENT_MAP[this.window.component];
  }

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
}
