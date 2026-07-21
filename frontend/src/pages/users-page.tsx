import { Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { DeleteUserDialog } from '@/components/users/delete-user-dialog'
import { UserForm } from '@/components/users/user-form'
import { UserTable } from '@/components/users/user-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { AppUser, AppUserInput } from '@/lib/api'
import { usePermission } from '@/hooks/use-permission'
import { useCreateUser, useDeleteUser, useUpdateUser, useUsers } from '@/queries/users'

export function UsersPage() {
  const [page] = useState(1)
  const [editingUser, setEditingUser] = useState<AppUser | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [deletingUser, setDeletingUser] = useState<AppUser | null>(null)

  const permission = usePermission('users')
  const { data, isLoading } = useUsers(page)
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()

  function openCreate() {
    setEditingUser(null)
    setIsSheetOpen(true)
  }

  function openEdit(user: AppUser) {
    setEditingUser(user)
    setIsSheetOpen(true)
  }

  function handleSubmit(input: AppUserInput) {
    if (editingUser) {
      updateUser.mutate(
        { id: editingUser.id, input },
        {
          onSuccess: () => {
            toast.success(`User "${input.username}" updated.`)
            setIsSheetOpen(false)
          },
          onError: () => toast.error('Failed to update user.'),
        },
      )
    } else {
      createUser.mutate(input, {
        onSuccess: () => {
          toast.success(`User "${input.username}" created.`)
          setIsSheetOpen(false)
        },
        onError: () => toast.error('Failed to create user.'),
      })
    }
  }

  function handleDeleteConfirm() {
    if (!deletingUser) return
    deleteUser.mutate(deletingUser.id, {
      onSuccess: () => {
        toast.success(`User "${deletingUser.username}" deleted.`)
        setDeletingUser(null)
      },
      onError: () => toast.error('Failed to delete user.'),
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Users</h1>
          <p className="text-sm text-muted-foreground">Manage user accounts and their roles.</p>
        </div>
        {permission.canCreate && (
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            New User
          </Button>
        )}
      </div>

      <Card>
        <CardContent>
          <UserTable
            users={data?.results ?? []}
            isLoading={isLoading}
            canEdit={permission.canEdit}
            canDelete={permission.canDelete}
            onEdit={openEdit}
            onDelete={setDeletingUser}
          />
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingUser ? 'Edit User' : 'New User'}</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-4">
            <UserForm
              user={editingUser ?? undefined}
              onSubmit={handleSubmit}
              isSubmitting={createUser.isPending || updateUser.isPending}
              submitLabel={editingUser ? 'Save changes' : 'Create user'}
            />
          </div>
        </SheetContent>
      </Sheet>

      <DeleteUserDialog
        user={deletingUser}
        onOpenChange={(open) => !open && setDeletingUser(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteUser.isPending}
      />
    </div>
  )
}
