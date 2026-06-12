import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type SystemState = 'booting' | 'locked' | 'desktop';

@Injectable({
  providedIn: 'root',
})
export class SystemService {
  private stateSubject = new BehaviorSubject<SystemState>('booting');
  state$ = this.stateSubject.asObservable();

  finishBoot() {
    this.stateSubject.next('locked');
  }

  unlock() {
    this.stateSubject.next('desktop');
  }

  lock() {
    this.stateSubject.next('locked');
  }
}
