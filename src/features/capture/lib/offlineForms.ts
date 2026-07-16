import { db } from '@/features/offline/db';
import type { PublicForm } from '@/shared/types';
import type { PublicFormCard } from '../api/captureApi';

const LIST_KEY = '__form-list__';

export async function cacheFormList(forms: PublicFormCard[]): Promise<void> {
  await db.cachedForms.put({ id: LIST_KEY, cachedAt: Date.now(), payload: forms });
}

export async function getCachedFormList(): Promise<PublicFormCard[]> {
  const entry = await db.cachedForms.get(LIST_KEY);
  return (entry?.payload as PublicFormCard[]) ?? [];
}

export async function cacheFormDetail(form: PublicForm): Promise<void> {
  await db.cachedForms.put({ id: form.id, cachedAt: Date.now(), payload: form });
}

export async function getCachedFormDetail(id: string): Promise<PublicForm | null> {
  const entry = await db.cachedForms.get(id);
  if (!entry || entry.id === LIST_KEY) return null;
  return (entry.payload as PublicForm) ?? null;
}

export async function listCachedFormIds(): Promise<Set<string>> {
  const all = await db.cachedForms.toArray();
  return new Set(all.filter((e) => e.id !== LIST_KEY).map((e) => e.id));
}
