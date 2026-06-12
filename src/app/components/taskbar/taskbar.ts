import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WindowService } from '../../services/window';
import { SystemService } from '../../services/system';

@Component({
  selector: 'app-taskbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './taskbar.html',
  styleUrls: ['./taskbar.scss'],
})
export class Taskbar implements OnInit, OnDestroy {
  currentTime: Date = new Date();
  private timer: any;

  constructor(public windowService: WindowService, public systemService: SystemService) { }

  ngOnInit() {
    this.timer = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
