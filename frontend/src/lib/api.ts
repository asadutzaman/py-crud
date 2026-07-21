import { clearTokens, getAccessToken, getRefreshToken, setAccessToken, setTokens } from '@/lib/auth-tokens'

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

async function rawFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers)
  headers.set('Content-Type', 'application/json')
  const access = getAccessToken()
  if (access) headers.set('Authorization', `Bearer ${access}`)
  return fetch(`${API_BASE}${path}`, { ...init, headers })
}

async function tryRefresh(): Promise<boolean> {
  const refresh = getRefreshToken()
  if (!refresh) return false
  const res = await fetch(`${API_BASE}/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  })
  if (!res.ok) return false
  const data = await res.json()
  setAccessToken(data.access)
  return true
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res = await rawFetch(path, init)

  if (res.status === 401 && getRefreshToken() && (await tryRefresh())) {
    res = await rawFetch(path, init)
  }

  if (res.status === 401) {
    clearTokens()
    window.location.href = '/login'
    throw new Error('Session expired. Please log in again.')
  }

  if (!res.ok) {
    const body = await res.text()
    throw new Error(body || `Request failed with status ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export interface MePermission {
  menu_key: string
  menu_label: string
  icon: string
  path: string
  can_view: boolean
  can_create: boolean
  can_edit: boolean
  can_delete: boolean
}

export interface Me {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_superuser: boolean
  role: { id: number; name: string } | null
  permissions: MePermission[]
}

export async function login(username: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    throw new Error('Invalid username or password.')
  }
  const data: { access: string; refresh: string } = await res.json()
  setTokens(data.access, data.refresh)
}

export function getMe() {
  return request<Me>('/auth/me/')
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

export interface Role {
  id: number
  name: string
  description: string
  created_at: string
  updated_at: string
}

export interface RoleInput {
  name: string
  description: string
}

export interface RolePermissionRow {
  menu_id: number
  menu_key: string
  menu_label: string
  can_view: boolean
  can_create: boolean
  can_edit: boolean
  can_delete: boolean
}

export function listRoles() {
  return request<PaginatedResponse<Role>>('/roles/')
}

export function createRole(input: RoleInput) {
  return request<Role>('/roles/', { method: 'POST', body: JSON.stringify(input) })
}

export function updateRole(id: number, input: RoleInput) {
  return request<Role>(`/roles/${id}/`, { method: 'PUT', body: JSON.stringify(input) })
}

export function deleteRole(id: number) {
  return request<void>(`/roles/${id}/`, { method: 'DELETE' })
}

export function getRolePermissions(roleId: number) {
  return request<RolePermissionRow[]>(`/roles/${roleId}/permissions/`)
}

export function updateRolePermissions(roleId: number, rows: RolePermissionRow[]) {
  return request<RolePermissionRow[]>(`/roles/${roleId}/permissions/`, {
    method: 'PUT',
    body: JSON.stringify(rows),
  })
}

export interface Menu {
  id: number
  key: string
  label: string
  icon: string
  path: string
  order: number
}

export function listMenus() {
  return request<Menu[]>('/menus/')
}

export interface AppUser {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: { id: number; name: string } | null
  is_active: boolean
  date_joined: string
}

export interface AppUserInput {
  username: string
  email: string
  first_name: string
  last_name: string
  role_id: number | null
  is_active: boolean
  password?: string
}

export function listUsers(page = 1) {
  return request<PaginatedResponse<AppUser>>(`/users/?page=${page}`)
}

export function createUser(input: AppUserInput) {
  return request<AppUser>('/users/', { method: 'POST', body: JSON.stringify(input) })
}

export function updateUser(id: number, input: AppUserInput) {
  return request<AppUser>(`/users/${id}/`, { method: 'PUT', body: JSON.stringify(input) })
}

export function deleteUser(id: number) {
  return request<void>(`/users/${id}/`, { method: 'DELETE' })
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
