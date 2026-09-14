import type {
  Product as AdminProduct,
  CreateProductPayload,
  UpdateProductPayload,
  ProductListParams,
} from '@/types';
import type { Product as UIProduct } from '@/lib/products';
import { httpGet, httpPost, httpPatch, httpDelete, buildQueryString } from '@/lib/http-client';

const BASE_URL = '/api/admin/products';
const PUBLIC_BASE_URL = '/api/products';

export function getProducts(params: ProductListParams = {}) {
  return httpGet<AdminProduct[]>(`${BASE_URL}${buildQueryString(params)}`);
}

export function getProduct(_id: string) {
  return httpGet<AdminProduct>(`${BASE_URL}/${_id}`);
}

export function createProduct(payload: CreateProductPayload) {
  return httpPost<AdminProduct>(BASE_URL, payload);
}

export function updateProduct(payload: UpdateProductPayload) {
  return httpPatch<AdminProduct>(BASE_URL, payload);
}

export function deleteProduct(_id: string) {
  return httpDelete<null>(`${BASE_URL}?_id=${_id}`);
}

export function getPublicProducts(params: ProductListParams & { sort?: string } = {}) {
  return httpGet<UIProduct[]>(`${PUBLIC_BASE_URL}${buildQueryString(params)}`);
}

export function getPublicProductBySlug(slug: string) {
  return httpGet<{ product: UIProduct; relatedProducts: UIProduct[] }>(`${PUBLIC_BASE_URL}/${slug}`);
}
