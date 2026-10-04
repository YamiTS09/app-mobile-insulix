import { Injectable } from '@angular/core';

export type CatalogType = 'dieta' | 'ejercicio';

interface CatalogDraft {
  values: Record<string, any>;
  revision: number;
}

@Injectable({ providedIn: 'root' })
export class CatalogDraftService {
  // Kept in memory so selected image Files survive closing a modal unchanged.
  private readonly drafts = new Map<string, CatalogDraft>();
  private revision = 0;

  keyFor(userId: string, type: CatalogType, itemId?: string): string {
    return JSON.stringify([userId, type, itemId || 'nuevo']);
  }

  get(key: string): CatalogDraft | null {
    const draft = this.drafts.get(key);
    return draft ? { values: { ...draft.values }, revision: draft.revision } : null;
  }

  save(key: string, values: Record<string, any>): number {
    const revision = ++this.revision;
    this.drafts.set(key, { values: { ...values }, revision });
    return revision;
  }

  discard(key: string, expectedRevision?: number): void {
    const draft = this.drafts.get(key);
    if (expectedRevision === undefined || draft?.revision === expectedRevision) {
      this.drafts.delete(key);
    }
  }
}
