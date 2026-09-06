import { http } from './http';
import { Product } from '../types/Product';
import { ProductDescription } from '../types/ProductFull';

interface GetProductsParams {
  category?: string;
  sort?: string;
  page?: number;
  perPage?: string;
  search?: string;
}

interface GetProductsResponse {
  items: Product[];
  total: number;
}

export async function getProducts(
  params?: GetProductsParams,
): Promise<GetProductsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.category) {
    searchParams.append('category', params.category);
  }

  if (params?.sort) {
    searchParams.append('sort', params.sort);
  }

  if (params?.page) {
    searchParams.append('page', params.page.toString());
  }

  if (params?.perPage) {
    searchParams.append('perPage', params.perPage);
  }

  if (params?.search) {
    searchParams.append('search', params.search);
  }

  const query = searchParams.toString();
  const url = query ? `/products?${query}` : '/products';

  return http<GetProductsResponse>(url);
}

export async function getProductDetails(
  category: string,
  itemId: string,
): Promise<ProductDescription> {
  return http<ProductDescription>(`/products/${category}/${itemId}`);
}
