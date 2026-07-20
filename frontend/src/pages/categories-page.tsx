import { Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { CategoryForm } from '@/components/categories/category-form'
import { CategoryTable } from '@/components/categories/category-table'
import { DeleteCategoryDialog } from '@/components/categories/delete-category-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { Category, CategoryInput } from '@/lib/api'
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '@/queries/categories'

export function CategoriesPage() {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)

  const { data: categories, isLoading } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  function openCreate() {
    setEditingCategory(null)
    setIsSheetOpen(true)
  }

  function openEdit(category: Category) {
    setEditingCategory(category)
    setIsSheetOpen(true)
  }

  function handleSubmit(input: CategoryInput) {
    if (editingCategory) {
      updateCategory.mutate(
        { id: editingCategory.id, input },
        {
          onSuccess: () => {
            toast.success(`Category "${input.name}" updated.`)
            setIsSheetOpen(false)
          },
          onError: () => toast.error('Failed to update category.'),
        },
      )
    } else {
      createCategory.mutate(input, {
        onSuccess: () => {
          toast.success(`Category "${input.name}" created.`)
          setIsSheetOpen(false)
        },
        onError: () => toast.error('Failed to create category.'),
      })
    }
  }

  function handleDeleteConfirm() {
    if (!deletingCategory) return
    deleteCategory.mutate(deletingCategory.id, {
      onSuccess: () => {
        toast.success(`Category "${deletingCategory.name}" deleted.`)
        setDeletingCategory(null)
      },
      onError: () => toast.error('Failed to delete category.'),
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Categories</h1>
          <p className="text-sm text-muted-foreground">Organize your products into categories.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          New Category
        </Button>
      </div>

      <Card>
        <CardContent>
          <CategoryTable
            categories={categories ?? []}
            isLoading={isLoading}
            onEdit={openEdit}
            onDelete={setDeletingCategory}
          />
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingCategory ? 'Edit Category' : 'New Category'}</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-4">
            <CategoryForm
              category={editingCategory ?? undefined}
              onSubmit={handleSubmit}
              isSubmitting={createCategory.isPending || updateCategory.isPending}
              submitLabel={editingCategory ? 'Save changes' : 'Create category'}
            />
          </div>
        </SheetContent>
      </Sheet>

      <DeleteCategoryDialog
        category={deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteCategory.isPending}
      />
    </div>
  )
}
