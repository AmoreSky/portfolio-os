import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemService } from '../../services/system';

@Component({
  selector: 'app-lock-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lock-screen.html',
  styleUrls: ['./lock-screen.scss']
})
export class LockScreen implements OnInit, OnDestroy {
  currentTime: Date = new Date();
  private timer: any;

  constructor(public systemService: SystemService) { }

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
