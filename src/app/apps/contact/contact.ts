import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type FormState = 'idle' | 'sending' | 'sent' | 'error';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  // ─── Form fields ────────────────────────────────────────────────────────────
  name = '';
  email = '';
  subject = '';
  message = '';

  // ─── UI state ───────────────────────────────────────────────────────────────
  formState = signal<FormState>('idle');
  copied = signal(false);
  focusedField = signal<string | null>(null);

  readonly email_address = 'toniaoluwarantimi@gmail.com';
  readonly github_url = 'https://github.com/AmoreSky';

  // ─── Helpers ────────────────────────────────────────────────────────────────

  get isSubmitting() { return this.formState() === 'sending'; }
  get isSent()       { return this.formState() === 'sent'; }
  get isError()      { return this.formState() === 'error'; }

  get canSubmit(): boolean {
    return !!(this.name.trim() && this.email.trim() && this.message.trim()) &&
      !this.isSubmitting;
  }

  onFocus(field: string) { this.focusedField.set(field); }
  onBlur()               { this.focusedField.set(null); }

  // ─── Submit via mailto (works without a backend) ────────────────────────────
  async submit() {
    if (!this.canSubmit) return;

    this.formState.set('sending');

    // Simulate brief delay for UX feel
    await new Promise(r => setTimeout(r, 900));

    try {
      const subject  = encodeURIComponent(this.subject || `Portfolio contact from ${this.name}`);
      const body     = encodeURIComponent(
        `Hi Anthonia,\n\n${this.message}\n\n— ${this.name}\n${this.email}`
      );
      window.open(`mailto:${this.email_address}?subject=${subject}&body=${body}`, '_self');
      this.formState.set('sent');
    } catch {
      this.formState.set('error');
    }
  }

  reset() {
    this.name = '';
    this.email = '';
    this.subject = '';
    this.message = '';
    this.formState.set('idle');
  }

  async copyEmail() {
    try {
      await navigator.clipboard.writeText(this.email_address);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch {
      // Fallback — just open mail client
      window.open(`mailto:${this.email_address}`, '_self');
    }
  }
}
