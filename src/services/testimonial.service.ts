import type {
  Testimonial,
  CreateTestimonialPayload,
  UpdateTestimonialPayload,
  TestimonialListParams,
} from '@/types';
import { httpGet, httpPost, httpPatch, httpDelete, buildQueryString } from '@/lib/http-client';

const BASE_URL = '/api/admin/testimonials';
const PUBLIC_BASE_URL = '/api/testimonials';

export function getTestimonials(params: TestimonialListParams = {}) {
  return httpGet<Testimonial[]>(`${BASE_URL}${buildQueryString(params)}`);
}

export function getPublicTestimonials(params: { limit?: number } = {}) {
  return httpGet<Testimonial[]>(`${PUBLIC_BASE_URL}${buildQueryString(params)}`);
}

export function createTestimonial(payload: CreateTestimonialPayload) {
  return httpPost<Testimonial>(BASE_URL, payload);
}

export function updateTestimonial(payload: UpdateTestimonialPayload) {
  return httpPatch<Testimonial>(BASE_URL, payload);
}

export function deleteTestimonial(_id: string) {
  return httpDelete<null>(`${BASE_URL}?_id=${_id}`);
}
