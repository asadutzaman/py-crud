import { Pencil, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Product } from '@/lib/api'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

interface ProductTableProps {
  products: Product[]
  isLoading?: boolean
  canEdit?: boolean
  canDelete?: boolean
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export function ProductTable({
  products,
  isLoading,
  canEdit = true,
  canDelete = true,
  onEdit,
  onDelete,
}: ProductTableProps) {
  const showActions = canEdit || canDelete

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Updated</TableHead>
          {showActions && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell colSpan={6}>
                <Skeleton className="h-6 w-full" />
              </TableCell>
            </TableRow>
          ))}
        {!isLoading && products.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              No products yet. Create the first one.
            </TableCell>
          </TableRow>
        )}
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell>
              {product.category ? (
                <Badge variant="secondary">{product.category.name}</Badge>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
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
            {showActions && (
              <TableCell className="text-right">
                {canEdit && (
                  <Button variant="ghost" size="icon" onClick={() => onEdit(product)} aria-label="Edit">
                    <Pencil className="size-4" />
                  </Button>
                )}
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(product)}
                    aria-label="Delete"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
