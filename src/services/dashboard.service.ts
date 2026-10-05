import type { DashboardStats } from '@/models/dashboard.model';
import { httpGet } from '@/lib/http-client';

const BASE_URL = '/api/admin/dashboard';

export function getDashboardStats() {
  return httpGet<DashboardStats>(BASE_URL);
}
