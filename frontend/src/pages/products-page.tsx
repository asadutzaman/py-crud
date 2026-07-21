import { Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { DeleteProductDialog } from '@/components/products/delete-product-dialog'
import { ProductForm } from '@/components/products/product-form'
import { ProductTable } from '@/components/products/product-table'
import { usePermission } from '@/hooks/use-permission'
import type { Product, ProductInput } from '@/lib/api'
import {
  useCreateProduct,
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
} from '@/queries/products'

export function ProductsPage() {
  const [page] = useState(1)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  const permission = usePermission('products')
  const { data, isLoading } = useProducts(page)
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()

  function openCreate() {
    setEditingProduct(null)
    setIsSheetOpen(true)
  }

  function openEdit(product: Product) {
    setEditingProduct(product)
    setIsSheetOpen(true)
  }

  function handleSubmit(input: ProductInput) {
    if (editingProduct) {
      updateProduct.mutate(
        { id: editingProduct.id, input },
        {
          onSuccess: () => {
            toast.success(`Product "${input.name}" updated.`)
            setIsSheetOpen(false)
          },
          onError: () => toast.error('Failed to update product.'),
        },
      )
    } else {
      createProduct.mutate(input, {
        onSuccess: () => {
          toast.success(`Product "${input.name}" created.`)
          setIsSheetOpen(false)
        },
        onError: () => toast.error('Failed to create product.'),
      })
    }
  }

  function handleDeleteConfirm() {
    if (!deletingProduct) return
    deleteProduct.mutate(deletingProduct.id, {
      onSuccess: () => {
        toast.success(`Product "${deletingProduct.name}" deleted.`)
        setDeletingProduct(null)
      },
      onError: () => toast.error('Failed to delete product.'),
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Products</h1>
          <p className="text-sm text-muted-foreground">Manage your product catalog.</p>
        </div>
        {permission.canCreate && (
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            New Product
          </Button>
        )}
      </div>

      <Card>
        <CardContent>
          <ProductTable
            products={data?.results ?? []}
            isLoading={isLoading}
            canEdit={permission.canEdit}
            canDelete={permission.canDelete}
            onEdit={openEdit}
            onDelete={setDeletingProduct}
          />
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingProduct ? 'Edit Product' : 'New Product'}</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-4">
            <ProductForm
              product={editingProduct ?? undefined}
              onSubmit={handleSubmit}
              isSubmitting={createProduct.isPending || updateProduct.isPending}
              submitLabel={editingProduct ? 'Save changes' : 'Create product'}
            />
          </div>
        </SheetContent>
      </Sheet>

      <DeleteProductDialog
        product={deletingProduct}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteProduct.isPending}
      />
    </div>
  )
}
