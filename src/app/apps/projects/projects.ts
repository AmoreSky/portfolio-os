import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  GithubProjectsService,
  Project,
  SEED_PROJECTS,
} from '../../services/github-projects.service';

@Component({
  selector: 'app-projects',
  imports: [CommonModule],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class Projects implements OnInit {
  private svc = inject(GithubProjectsService);

  /** Start with seed data — renders in < 1ms before any network call */
  projects: Project[] = SEED_PROJECTS;
  filteredProjects: Project[] = SEED_PROJECTS;

  isSyncing = false;
  error: string | null = null;
  activeFilter = 'all';
  lastSynced: string | null = null;

  /** True until the first real Firestore emission replaces seed data */
  isUsingFallback = true;

  ngOnInit() {
    // Subscribe to isSyncing (manual refresh only)
    this.svc.isSyncing$.subscribe((syncing) => (this.isSyncing = syncing));
    this.svc.error$.subscribe((err) => (this.error = err));

    // When Firestore emits real data, swap out the seed immediately
    this.svc.projects$.subscribe((projects) => {
      if (projects.length > 0) {
        this.isUsingFallback = false;
        this.projects = projects;
        this.applyFilter();
        this.lastSynced = projects[0]?.syncedAt ?? null;
      }
      // If Firestore is still empty (very first ever load),
      // keep showing seed data — background sync will populate it shortly
    });
  }

  // ─── Filters ───────────────────────────────────────────────────────────────

  get filters(): string[] {
    const langs = [...new Set(this.projects.map((p) => p.language))].filter(Boolean);
    return ['all', 'deployed', ...langs];
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
    this.applyFilter();
  }

  private applyFilter() {
    switch (this.activeFilter) {
      case 'all':
        this.filteredProjects = this.projects;
        break;
      case 'deployed':
        this.filteredProjects = this.projects.filter((p) => p.isDeployed);
        break;
      default:
        this.filteredProjects = this.projects.filter(
          (p) =>
            p.language === this.activeFilter ||
            p.tags.some((t) => t.toLowerCase() === this.activeFilter.toLowerCase()),
        );
    }
  }

  // ─── Actions ───────────────────────────────────────────────────────────────

  async forceRefresh() {
    await this.svc.forceRefresh();
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  get deployedCount(): number {
    return this.projects.filter((p) => p.isDeployed).length;
  }

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
