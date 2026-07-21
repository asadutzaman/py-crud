import { Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { DeleteRoleDialog } from '@/components/roles/delete-role-dialog'
import { RoleForm } from '@/components/roles/role-form'
import { RolePermissionsSheet } from '@/components/roles/role-permissions-sheet'
import { RoleTable } from '@/components/roles/role-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { usePermission } from '@/hooks/use-permission'
import type { Role, RoleInput } from '@/lib/api'
import { useCreateRole, useDeleteRole, useRoles, useUpdateRole } from '@/queries/roles'

export function RolesPage() {
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [deletingRole, setDeletingRole] = useState<Role | null>(null)
  const [permissionsRole, setPermissionsRole] = useState<Role | null>(null)

  const permission = usePermission('roles')
  const { data, isLoading } = useRoles()
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const deleteRole = useDeleteRole()

  function openCreate() {
    setEditingRole(null)
    setIsSheetOpen(true)
  }

  function openEdit(role: Role) {
    setEditingRole(role)
    setIsSheetOpen(true)
  }

  function handleSubmit(input: RoleInput) {
    if (editingRole) {
      updateRole.mutate(
        { id: editingRole.id, input },
        {
          onSuccess: () => {
            toast.success(`Role "${input.name}" updated.`)
            setIsSheetOpen(false)
          },
          onError: () => toast.error('Failed to update role.'),
        },
      )
    } else {
      createRole.mutate(input, {
        onSuccess: () => {
          toast.success(`Role "${input.name}" created.`)
          setIsSheetOpen(false)
        },
        onError: () => toast.error('Failed to create role.'),
      })
    }
  }

  function handleDeleteConfirm() {
    if (!deletingRole) return
    deleteRole.mutate(deletingRole.id, {
      onSuccess: () => {
        toast.success(`Role "${deletingRole.name}" deleted.`)
        setDeletingRole(null)
      },
      onError: () => toast.error('Failed to delete role.'),
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Roles</h1>
          <p className="text-sm text-muted-foreground">
            Define roles and control which menus and actions they can access.
          </p>
        </div>
        {permission.canCreate && (
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            New Role
          </Button>
        )}
      </div>

      <Card>
        <CardContent>
          <RoleTable
            roles={data?.results ?? []}
            isLoading={isLoading}
            canEdit={permission.canEdit}
            canDelete={permission.canDelete}
            onManagePermissions={setPermissionsRole}
            onEdit={openEdit}
            onDelete={setDeletingRole}
          />
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingRole ? 'Edit Role' : 'New Role'}</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-4">
            <RoleForm
              role={editingRole ?? undefined}
              onSubmit={handleSubmit}
              isSubmitting={createRole.isPending || updateRole.isPending}
              submitLabel={editingRole ? 'Save changes' : 'Create role'}
            />
          </div>
        </SheetContent>
      </Sheet>

      <RolePermissionsSheet role={permissionsRole} onOpenChange={(open) => !open && setPermissionsRole(null)} />

      <DeleteRoleDialog
        role={deletingRole}
        onOpenChange={(open) => !open && setDeletingRole(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteRole.isPending}
      />
    </div>
  )
}
