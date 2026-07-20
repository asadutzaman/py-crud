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
import type { Category } from '@/lib/api'

interface CategoryTableProps {
  categories: Category[]
  isLoading?: boolean
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

export function CategoryTable({ categories, isLoading, onEdit, onDelete }: CategoryTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Products</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell colSpan={3}>
                <Skeleton className="h-6 w-full" />
              </TableCell>
            </TableRow>
          ))}
        {!isLoading && categories.length === 0 && (
          <TableRow>
            <TableCell colSpan={3} className="text-center text-muted-foreground">
              No categories yet. Create the first one.
            </TableCell>
          </TableRow>
        )}
        {categories.map((category) => (
          <TableRow key={category.id}>
            <TableCell className="font-medium">{category.name}</TableCell>
            <TableCell>
              <Badge variant="secondary">{category.product_count}</Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" onClick={() => onEdit(category)} aria-label="Edit">
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(category)}
                aria-label="Delete"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
