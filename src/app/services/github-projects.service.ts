import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  setDoc,
  query,
  orderBy,
} from '@angular/fire/firestore';
import { Observable, BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  updated_at: string;
  fork: boolean;
  archived: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  language: string;
  languageColor: string;
  githubUrl: string;
  liveUrl: string | null;
  isDeployed: boolean;
  tags: string[];
  stars: number;
  updatedAt: string;
  syncedAt: string;
}

// ─── Language colour map ──────────────────────────────────────────────────────

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  HTML: '#e34c26',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  PHP: '#777bb3',
  Python: '#3572A5',
  Java: '#b07219',
  'C#': '#178600',
  'C++': '#f34b7d',
  Go: '#00ADD8',
  Rust: '#dea584',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Ruby: '#701516',
  Shell: '#89e051',
};

const DEFAULT_COLOR = '#8b949e';

// ─── Sync config ─────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const LAST_SYNC_KEY = 'gh_projects_last_sync';

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class GithubProjectsService {
  private http = inject(HttpClient);
  private firestore = inject(Firestore);
  private injector = inject(Injector);

  private readonly username = environment.github.username;
  private readonly apiUrl = `https://api.github.com/users/${this.username}/repos?sort=updated&per_page=100`;
  private readonly collectionName = 'projects';

  /** True only during a manual force-refresh */
  isSyncing$ = new BehaviorSubject<boolean>(false);

  /** Error state */
  error$ = new BehaviorSubject<string | null>(null);

  /**
   * Live Firestore stream — no blocking, emits the moment Firestore responds.
   * The component shows seed data first, then swaps when this emits.
   */
  projects$: Observable<Project[]>;

  constructor() {
    const col = collection(this.firestore, this.collectionName);
    const q = query(col, orderBy('updatedAt', 'desc'));
    this.projects$ = collectionData(q, { idField: 'id' }) as Observable<Project[]>;

    // Kick off background sync inside injection context to prevent Angular warnings
    runInInjectionContext(this.injector, () => {
      this.backgroundSync();
    });
  }

  // ─── Background sync ───────────────────────────────────────────────────────

  /**
   * Runs silently on startup.
   * Uses localStorage to track last sync — no Firestore read needed.
   * Only calls GitHub API if cache is older than 6h.
   */
  private async backgroundSync(): Promise<void> {
    const lastSync = localStorage.getItem(LAST_SYNC_KEY);
    const age = lastSync ? Date.now() - Number(lastSync) : Infinity;

    if (age < CACHE_TTL_MS) {
      // Cache is fresh — nothing to do
      return;
    }

    try {
      await this.syncFromGitHub();
      localStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
      this.error$.next(null);
    } catch (err) {
      console.warn('[GithubProjectsService] Background sync failed:', err);
      // Silently fail — user still sees seed/cached data
    }
  }

  // ─── Manual refresh ────────────────────────────────────────────────────────

  async forceRefresh(): Promise<void> {
    this.isSyncing$.next(true);
    this.error$.next(null);
    try {
      await this.syncFromGitHub();
      localStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
    } catch (err) {
      this.error$.next('Sync failed. Please try again.');
    } finally {
      this.isSyncing$.next(false);
    }
  }

  // ─── Core sync logic ───────────────────────────────────────────────────────

  async syncFromGitHub(): Promise<void> {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
    };
    if (environment.github.token) {
      headers['Authorization'] = `Bearer ${environment.github.token}`;
    }

    const repos = await firstValueFrom(
      this.http.get<GitHubRepo[]>(this.apiUrl, { headers })
    );

    if (!repos) return;

    const syncedAt = new Date().toISOString();
    const filtered = repos.filter((r) => !r.fork && !r.archived);

    await Promise.all(
      filtered.map((repo) => {
        const project = this.mapRepo(repo, syncedAt);
        const docRef = doc(this.firestore, this.collectionName, String(repo.id));
        return setDoc(docRef, project, { merge: true });
      })
    );
  }

  // ─── Mapping ───────────────────────────────────────────────────────────────

  private mapRepo(repo: GitHubRepo, syncedAt: string): Project {
    const lang = repo.language ?? 'Other';
    const liveUrl = repo.homepage?.trim() || null;
    const tags = [...new Set([lang, ...repo.topics.map(this.formatTag)])].slice(0, 5);

    return {
      id: String(repo.id),
      name: this.formatName(repo.name),
      description: repo.description ?? 'No description provided.',
      language: lang,
      languageColor: LANGUAGE_COLORS[lang] ?? DEFAULT_COLOR,
      githubUrl: repo.html_url,
      liveUrl,
      isDeployed: !!liveUrl,
      tags,
      stars: repo.stargazers_count,
      updatedAt: repo.updated_at,
      syncedAt,
    };
  }

  private formatName = (name: string) =>
    name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  private formatTag = (tag: string) =>
    tag.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
