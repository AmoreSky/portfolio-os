import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Skill {
  name: string;
  icon: string;         // Font Awesome class or emoji fallback
  color: string;        // accent colour
  level: number;        // 0–100 proficiency %
  label: string;        // "Beginner" | "Familiar" | "Proficient" | "Advanced"
  category: string;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skills.html',
  styleUrl: './skills.scss',
})
export class Skills {

  readonly categories: Category[] = [
    { id: 'all',       label: 'All',         icon: 'fa-solid fa-layer-group' },
    { id: 'languages', label: 'Languages',   icon: 'fa-solid fa-code' },
    { id: 'frontend',  label: 'Frontend',    icon: 'fa-solid fa-display' },
    { id: 'backend',   label: 'Backend',     icon: 'fa-solid fa-server' },
    { id: 'tools',     label: 'Tools & Cloud', icon: 'fa-solid fa-screwdriver-wrench' },
  ];

  readonly skills: Skill[] = [
    // ── Languages ──────────────────────────────────────────────────
    {
      name: 'HTML5',
      icon: 'fa-brands fa-html5',
      color: '#e34c26',
      level: 88,
      label: 'Proficient',
      category: 'languages',
    },
    {
      name: 'CSS3 / SCSS',
      icon: 'fa-brands fa-css3-alt',
      color: '#264de4',
      level: 82,
      label: 'Proficient',
      category: 'languages',
    },
    {
      name: 'JavaScript',
      icon: 'fa-brands fa-js',
      color: '#f1e05a',
      level: 78,
      label: 'Proficient',
      category: 'languages',
    },
    {
      name: 'TypeScript',
      icon: 'fa-solid fa-t',
      color: '#3178c6',
      level: 75,
      label: 'Proficient',
      category: 'languages',
    },
    {
      name: 'PHP',
      icon: 'fa-brands fa-php',
      color: '#777bb3',
      level: 55,
      label: 'Familiar',
      category: 'languages',
    },

    // ── Frontend ───────────────────────────────────────────────────
    {
      name: 'Angular',
      icon: 'fa-brands fa-angular',
      color: '#dd0031',
      level: 80,
      label: 'Proficient',
      category: 'frontend',
    },
    {
      name: 'Responsive Design',
      icon: 'fa-solid fa-mobile-screen-button',
      color: '#10b981',
      level: 84,
      label: 'Proficient',
      category: 'frontend',
    },
    {
      name: 'Angular CDK',
      icon: 'fa-solid fa-puzzle-piece',
      color: '#a855f7',
      level: 65,
      label: 'Familiar',
      category: 'frontend',
    },
    {
      name: 'UI / UX Design',
      icon: 'fa-solid fa-pen-nib',
      color: '#ec4899',
      level: 70,
      label: 'Familiar',
      category: 'frontend',
    },

    // ── Backend / Data ─────────────────────────────────────────────
    {
      name: 'Firebase Firestore',
      icon: 'fa-solid fa-fire',
      color: '#f59e0b',
      level: 72,
      label: 'Familiar',
      category: 'backend',
    },
    {
      name: 'Firebase Auth',
      icon: 'fa-solid fa-shield-halved',
      color: '#f97316',
      level: 70,
      label: 'Familiar',
      category: 'backend',
    },
    {
      name: 'REST APIs',
      icon: 'fa-solid fa-plug',
      color: '#38bdf8',
      level: 68,
      label: 'Familiar',
      category: 'backend',
    },
    {
      name: 'Data Structures',
      icon: 'fa-solid fa-diagram-project',
      color: '#6ee7b7',
      level: 60,
      label: 'Familiar',
      category: 'backend',
    },

    // ── Tools ─────────────────────────────────────────────────────
    {
      name: 'Git & GitHub',
      icon: 'fa-brands fa-github',
      color: '#f0f6fc',
      level: 82,
      label: 'Proficient',
      category: 'tools',
    },
    {
      name: 'Vercel',
      icon: 'fa-solid fa-triangle',
      color: '#e8e8f0',
      level: 70,
      label: 'Familiar',
      category: 'tools',
    },
    {
      name: 'Linux / Ubuntu',
      icon: 'fa-brands fa-linux',
      color: '#fbbf24',
      level: 65,
      label: 'Familiar',
      category: 'tools',
    },
    {
      name: 'VS Code',
      icon: 'fa-solid fa-code',
      color: '#007acc',
      level: 88,
      label: 'Proficient',
      category: 'tools',
    },
  ];

  activeCategory = signal<string>('all');

  filteredSkills = computed(() => {
    const cat = this.activeCategory();
    return cat === 'all' ? this.skills : this.skills.filter(s => s.category === cat);
  });

  setCategory(id: string) {
    this.activeCategory.set(id);
  }

  getLevelClass(label: string): string {
    return label.toLowerCase().replace(' ', '-');
  }

  get totalCount() { return this.skills.length; }

  categoryCount(id: string): number {
    return id === 'all'
      ? this.skills.length
      : this.skills.filter(s => s.category === id).length;
  }
}
