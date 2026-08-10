import { getPagePublicPath } from './pagePaths';

/**
 * Best-effort on-demand ISR invalidation for a public CMS page.
 *
 * Admin writes (create/update/delete) call this so the statically generated
 * public route (SSG + revalidate = 60s) reflects edits on the next request
 * instead of waiting for the revalidation window.
 *
 * Uses a lazy dynamic import so `next/cache` is only loaded at call time, and
 * swallows failures — revalidation is an optimization, never a reason for the
 * admin API to fail.
 */
export async function revalidatePublicPage(slug: string): Promise<void> {
  try {
    const { revalidatePath } = await import('next/cache');
    revalidatePath(getPagePublicPath(slug));
  } catch (error) {
    console.error(`ISR revalidation skipped for '${slug}':`, error);
  }
}
