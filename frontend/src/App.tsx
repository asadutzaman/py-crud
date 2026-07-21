import { Route, Routes } from 'react-router-dom'

import { AppShell } from '@/components/layout/app-shell'
import { ProtectedRoute } from '@/components/protected-route'
import { RequirePermission } from '@/components/require-permission'
import { CategoriesPage } from '@/pages/categories-page'
import { CustomersPage } from '@/pages/customers-page'
import { DashboardPage } from '@/pages/dashboard-page'
import { LoginPage } from '@/pages/login-page'
import { ProductsPage } from '@/pages/products-page'
import { RolesPage } from '@/pages/roles-page'
import { UsersPage } from '@/pages/users-page'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route
            path="/"
            element={
              <RequirePermission menuKey="dashboard">
                <DashboardPage />
              </RequirePermission>
            }
          />
          <Route
            path="/products"
            element={
              <RequirePermission menuKey="products">
                <ProductsPage />
              </RequirePermission>
            }
          />
          <Route
            path="/categories"
            element={
              <RequirePermission menuKey="categories">
                <CategoriesPage />
              </RequirePermission>
            }
          />
          <Route
            path="/customers"
            element={
              <RequirePermission menuKey="customers">
                <CustomersPage />
              </RequirePermission>
            }
          />
          <Route
            path="/users"
            element={
              <RequirePermission menuKey="users">
                <UsersPage />
              </RequirePermission>
            }
          />
          <Route
            path="/roles"
            element={
              <RequirePermission menuKey="roles">
                <RolesPage />
              </RequirePermission>
            }
          />
        </Route>
      </Route>
    </Routes>
  )
}
