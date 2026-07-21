import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createRole,
  deleteRole,
  getRolePermissions,
  listMenus,
  listRoles,
  updateRole,
  updateRolePermissions,
  type RoleInput,
  type RolePermissionRow,
} from '@/lib/api'

export function useRoles() {
  return useQuery({ queryKey: ['roles'], queryFn: listRoles })
}

export function useMenus() {
  return useQuery({ queryKey: ['menus'], queryFn: listMenus })
}

export function useRolePermissions(roleId: number | null) {
  return useQuery({
    queryKey: ['roles', roleId, 'permissions'],
    queryFn: () => getRolePermissions(roleId as number),
    enabled: roleId !== null,
  })
}

export function useCreateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: RoleInput) => createRole(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  })
}

export function useUpdateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: RoleInput }) => updateRole(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteRole(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  })
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ roleId, rows }: { roleId: number; rows: RolePermissionRow[] }) =>
      updateRolePermissions(roleId, rows),
    onSuccess: (_data, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: ['roles', roleId, 'permissions'] })
    },
  })
}
