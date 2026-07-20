import { Activity, AlertTriangle, DollarSign, Package, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

import { CategoryProductsGauge } from '@/components/dashboard/category-products-gauge'
import { StockChart } from '@/components/dashboard/stock-chart'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useProductStats } from '@/queries/products'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export function DashboardPage() {
  const { data, isLoading } = useProductStats()

  const stats = [
    {
      label: 'Total Products',
      value: data?.total_products ?? 0,
      icon: Package,
      badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Inventory Value',
      value: currency.format(data?.total_inventory_value ?? 0),
      icon: DollarSign,
      badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Low Stock (<5)',
      value: data?.low_stock_count ?? 0,
      icon: AlertTriangle,
      badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4">
              <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${stat.badgeClass}`}>
                <stat.icon className="size-5" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                {isLoading ? (
                  <Skeleton className="h-7 w-20" />
                ) : (
                  <p className="text-2xl font-bold">{stat.value}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-4 text-primary" />
              Stock Levels
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <StockChart products={data?.recent_products ?? []} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Products by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="mx-auto h-40 w-40 rounded-full" />
            ) : (
              <CategoryProductsGauge
                categories={data?.category_breakdown ?? []}
                totalProducts={data?.total_products ?? 0}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" />
            Recently Updated
          </CardTitle>
          <Link to="/products" className="text-sm text-muted-foreground hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              {!isLoading && data?.recent_products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No products yet.
                  </TableCell>
                </TableRow>
              )}
              {data?.recent_products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{currency.format(Number(product.price))}</TableCell>
                  <TableCell>
                    {product.quantity < 5 ? (
                      <Badge variant="destructive">{product.quantity}</Badge>
                    ) : (
                      product.quantity
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(product.updated_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
