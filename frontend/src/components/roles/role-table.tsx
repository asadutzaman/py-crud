import { Pencil, ShieldCheck, Trash2 } from 'lucide-react'

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
import type { Role } from '@/lib/api'

interface RoleTableProps {
  roles: Role[]
  isLoading?: boolean
  canEdit?: boolean
  canDelete?: boolean
  onManagePermissions: (role: Role) => void
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
}

export function RoleTable({
  roles,
  isLoading,
  canEdit = true,
  canDelete = true,
  onManagePermissions,
  onEdit,
  onDelete,
}: RoleTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
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
        {!isLoading && roles.length === 0 && (
          <TableRow>
            <TableCell colSpan={3} className="text-center text-muted-foreground">
              No roles yet. Create the first one.
            </TableCell>
          </TableRow>
        )}
        {roles.map((role) => (
          <TableRow key={role.id}>
            <TableCell className="font-medium">{role.name}</TableCell>
            <TableCell className="text-muted-foreground">{role.description || '—'}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" onClick={() => onManagePermissions(role)} aria-label="Permissions">
                <ShieldCheck className="size-4" />
              </Button>
              {canEdit && (
                <Button variant="ghost" size="icon" onClick={() => onEdit(role)} aria-label="Edit">
                  <Pencil className="size-4" />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(role)}
                  aria-label="Delete"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
