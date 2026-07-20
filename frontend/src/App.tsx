import { Route, Routes } from 'react-router-dom'

import { AppShell } from '@/components/layout/app-shell'
import { CategoriesPage } from '@/pages/categories-page'
import { DashboardPage } from '@/pages/dashboard-page'
import { ProductsPage } from '@/pages/products-page'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
      </Route>
    </Routes>
  )
}
