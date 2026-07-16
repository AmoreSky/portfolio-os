import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { map, combineLatest } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import {
  GithubProjectsService,
  Project,
} from '../../services/github-projects.service';

@Component({
  selector: 'app-projects',
  imports: [CommonModule, AsyncPipe],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class Projects implements OnInit {
  private svc = inject(GithubProjectsService);

  readonly isSyncing$ = this.svc.isSyncing$;
  readonly error$ = this.svc.error$;

  activeFilter = 'all';
  private activeFilter$ = new BehaviorSubject<string>('all');

  /** All projects from Firestore — reactive, no seed data */
  readonly allProjects$ = this.svc.projects$;

  /** Derived: filtered view, reacts to both projects and filter changes */
  readonly filteredProjects$ = combineLatest([
    this.allProjects$,
    this.activeFilter$,
  ]).pipe(
    map(([projects, filter]) => this.applyFilter(projects, filter)),
  );

  /** Derived: available filter chips */
  readonly filters$ = this.allProjects$.pipe(
    map((projects) => {
      const langs = [...new Set(projects.map((p) => p.language))].filter(Boolean);
      return ['all', 'deployed', ...langs];
    }),
  );

  /** Derived: last synced time from the most-recently-updated project */
  readonly lastSynced$ = this.allProjects$.pipe(
    map((projects) => projects[0]?.syncedAt ?? null),
  );

  /** Derived: total count */
  readonly totalCount$ = this.allProjects$.pipe(map((p) => p.length));

  /** Derived: deployed count */
  readonly deployedCount$ = this.allProjects$.pipe(
    map((projects) => projects.filter((p) => p.isDeployed).length),
  );

  /** Derived: filtered count */
  readonly filteredCount$ = this.filteredProjects$.pipe(map((p) => p.length));

  ngOnInit() {
    // Service handles background sync automatically in its constructor
  }

  // ─── Filters ───────────────────────────────────────────────────────────────

  setFilter(filter: string) {
    this.activeFilter = filter;
    this.activeFilter$.next(filter);
  }

  private applyFilter(projects: Project[], filter: string): Project[] {
    switch (filter) {
      case 'all':
        return projects;
      case 'deployed':
        return projects.filter((p) => p.isDeployed);
      default:
        return projects.filter(
          (p) =>
            p.language === filter ||
            p.tags.some((t) => t.toLowerCase() === filter.toLowerCase()),
        );
    }
  }

  // ─── Actions ───────────────────────────────────────────────────────────────

  async forceRefresh() {
    await this.svc.forceRefresh();
  }

  dismissError() {
    this.svc.error$.next(null);
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  getRelativeTime(dateStr: string): string {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffDays = Math.floor(diffMs / 86_400_000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    const months = Math.floor(diffDays / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}yr ago`;
  }
}
