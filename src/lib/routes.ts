/**
 * Routes that belong to the public site (get page transitions, nav, footer).
 * Admin and user-dashboard panels are excluded.
 */
export function isPublicRoute(pathname: string): boolean {
  return (
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/user-dashboard")
  );
}
