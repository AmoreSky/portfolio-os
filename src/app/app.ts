import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Desktop } from './components/desktop/desktop';
import { BootScreen } from './components/boot-screen/boot-screen';
import { LockScreen } from './components/lock-screen/lock-screen';
import { SystemService } from './services/system';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, Desktop, BootScreen, LockScreen],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  title = 'ubuntu-portfolio';
  constructor(public systemService: SystemService) {}
}
