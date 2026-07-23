import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
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

  // Calendar State
  showCalendar = false;
  currentMonth: Date = new Date();
  daysInMonth: { day: number, isCurrentMonth: boolean, isToday: boolean }[] = [];
  weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  constructor(public windowService: WindowService, public systemService: SystemService) { }

  ngOnInit() {
    this.timer = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
    this.generateCalendar();
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    this.showCalendar = false;
  }

  toggleCalendar(event: Event) {
    event.stopPropagation();
    this.showCalendar = !this.showCalendar;
    if (this.showCalendar) {
      this.currentMonth = new Date();
      this.generateCalendar();
    }
  }

  onCalendarClick(event: Event) {
    event.stopPropagation();
  }

  prevMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateCalendar();
  }

  generateCalendar() {
    this.daysInMonth = [];
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const today = new Date();
    
    // Previous month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      this.daysInMonth.push({ day: daysInPrevMonth - i, isCurrentMonth: false, isToday: false });
    }
    
    // Current month days
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const isToday = today.getDate() === i && today.getMonth() === month && today.getFullYear() === year;
      this.daysInMonth.push({ day: i, isCurrentMonth: true, isToday });
    }
    
    // Next month padding (make it up to 42 days = 6 weeks)
    const remainingDays = 42 - this.daysInMonth.length;
    for (let i = 1; i <= remainingDays; i++) {
      this.daysInMonth.push({ day: i, isCurrentMonth: false, isToday: false });
    }
  }
}
