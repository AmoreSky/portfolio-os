import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Desktop } from './components/desktop/desktop';

@Component({
  selector: 'app-root',
  imports: [CommonModule, Desktop],
  template: `<app-desktop></app-desktop>`,
  styleUrl: './app.scss',
})
export class App {
  title = 'ubuntu-portfolio';
}
