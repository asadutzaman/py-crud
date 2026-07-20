import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createCustomer,
  deleteCustomer,
  listCustomers,
  updateCustomer,
  type CustomerInput,
} from '@/lib/api'

const customersKey = (page: number, search: string) => ['customers', page, search] as const

export function useCustomers(page: number, search: string) {
  return useQuery({ queryKey: customersKey(page, search), queryFn: () => listCustomers(page, search) })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CustomerInput) => createCustomer(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: CustomerInput }) => updateCustomer(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}
