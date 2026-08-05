import type {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  ProductListParams,
} from '@/types';
import { httpGet, httpPost, httpPatch, httpDelete, buildQueryString } from '@/lib/http-client';

const BASE_URL = '/api/admin/products';

export function getProducts(params: ProductListParams = {}) {
  return httpGet<Product[]>(`${BASE_URL}${buildQueryString(params)}`);
}

export function createProduct(payload: CreateProductPayload) {
  return httpPost<Product>(BASE_URL, payload);
}

export function updateProduct(payload: UpdateProductPayload) {
  return httpPatch<Product>(BASE_URL, payload);
}

export function deleteProduct(_id: string) {
  return httpDelete<null>(`${BASE_URL}?_id=${_id}`);
}
