import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Role, RolePermissionRow } from '@/lib/api'
import { useRolePermissions, useUpdateRolePermissions } from '@/queries/roles'

interface RolePermissionsSheetProps {
  role: Role | null
  onOpenChange: (open: boolean) => void
}

const ACTIONS: { key: keyof Pick<RolePermissionRow, 'can_view' | 'can_create' | 'can_edit' | 'can_delete'>; label: string }[] = [
  { key: 'can_view', label: 'View' },
  { key: 'can_create', label: 'Create' },
  { key: 'can_edit', label: 'Edit' },
  { key: 'can_delete', label: 'Delete' },
]

export function RolePermissionsSheet({ role, onOpenChange }: RolePermissionsSheetProps) {
  const { data, isLoading } = useRolePermissions(role?.id ?? null)
  const updatePermissions = useUpdateRolePermissions()
  const [rows, setRows] = useState<RolePermissionRow[]>([])

  useEffect(() => {
    if (data) setRows(data)
  }, [data])

  function toggle(menuId: number, key: (typeof ACTIONS)[number]['key']) {
    setRows((prev) =>
      prev.map((row) => (row.menu_id === menuId ? { ...row, [key]: !row[key] } : row)),
    )
  }

  function handleSave() {
    if (!role) return
    updatePermissions.mutate(
      { roleId: role.id, rows },
      {
        onSuccess: () => toast.success(`Permissions for "${role.name}" saved.`),
        onError: () => toast.error('Failed to save permissions.'),
      },
    )
  }

  return (
    <Sheet open={!!role} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-md overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{role ? `Permissions — ${role.name}` : 'Permissions'}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-4">
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Menu</TableHead>
                  {ACTIONS.map((action) => (
                    <TableHead key={action.key} className="text-center">
                      {action.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.menu_id}>
                    <TableCell className="font-medium">{row.menu_label}</TableCell>
                    {ACTIONS.map((action) => (
                      <TableCell key={action.key} className="text-center">
                        <Checkbox
                          checked={row[action.key]}
                          onCheckedChange={() => toggle(row.menu_id, action.key)}
                          aria-label={`${action.label} ${row.menu_label}`}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Button onClick={handleSave} disabled={updatePermissions.isPending || isLoading}>
            {updatePermissions.isPending ? 'Saving…' : 'Save permissions'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
