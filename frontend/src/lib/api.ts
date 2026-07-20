export interface Category {
  id: number
  name: string
  product_count: number
}

export interface CategoryInput {
  name: string
}

export interface Product {
  id: number
  name: string
  description: string
  price: string
  quantity: number
  category: Category | null
  created_at: string
  updated_at: string
}

export interface ProductInput {
  name: string
  description: string
  price: string
  quantity: number
  category_id: number | null
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface CategoryBreakdown {
  id: number | null
  name: string
  total_products: number
  low_stock_count: number
}

export interface ProductStats {
  total_products: number
  total_inventory_value: number
  low_stock_count: number
  recent_products: Product[]
  category_breakdown: CategoryBreakdown[]
}

const API_BASE = '/api/v1'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(body || `Request failed with status ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export function listProducts(page = 1) {
  return request<PaginatedResponse<Product>>(`/products/?page=${page}`)
}

export function getProductStats() {
  return request<ProductStats>('/products/stats/')
}

export function createProduct(input: ProductInput) {
  return request<Product>('/products/', { method: 'POST', body: JSON.stringify(input) })
}

export function updateProduct(id: number, input: ProductInput) {
  return request<Product>(`/products/${id}/`, { method: 'PUT', body: JSON.stringify(input) })
}

export function deleteProduct(id: number) {
  return request<void>(`/products/${id}/`, { method: 'DELETE' })
}

export interface Customer {
  id: number
  name: string
  email: string
  phone: string
  address: string
  notes: string
  created_at: string
  updated_at: string
}

export interface CustomerInput {
  name: string
  email: string
  phone: string
  address: string
  notes: string
}

export function listCustomers(page = 1, search = '') {
  const params = new URLSearchParams({ page: String(page) })
  if (search) params.set('search', search)
  return request<PaginatedResponse<Customer>>(`/customers/?${params}`)
}

export function createCustomer(input: CustomerInput) {
  return request<Customer>('/customers/', { method: 'POST', body: JSON.stringify(input) })
}

export function updateCustomer(id: number, input: CustomerInput) {
  return request<Customer>(`/customers/${id}/`, { method: 'PUT', body: JSON.stringify(input) })
}

export function deleteCustomer(id: number) {
  return request<void>(`/customers/${id}/`, { method: 'DELETE' })
}

export function listCategories() {
  return request<Category[]>('/categories/')
}

export function createCategory(input: CategoryInput) {
  return request<Category>('/categories/', { method: 'POST', body: JSON.stringify(input) })
}

export function updateCategory(id: number, input: CategoryInput) {
  return request<Category>(`/categories/${id}/`, { method: 'PUT', body: JSON.stringify(input) })
}

export function deleteCategory(id: number) {
  return request<void>(`/categories/${id}/`, { method: 'DELETE' })
}
