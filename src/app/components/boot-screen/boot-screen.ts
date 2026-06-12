import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemService } from '../../services/system';

@Component({
  selector: 'app-boot-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './boot-screen.html',
  styleUrls: ['./boot-screen.scss']
})
export class BootScreen implements OnInit {
  constructor(private systemService: SystemService) {}

  ngOnInit() {
    // Simulate a 2.5 second boot sequence
    setTimeout(() => {
      this.systemService.finishBoot();
    }, 2500);
  }
}
