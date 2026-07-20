import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createProduct,
  deleteProduct,
  getProductStats,
  listProducts,
  updateProduct,
  type ProductInput,
} from '@/lib/api'

const productsKey = (page: number) => ['products', page] as const
const statsKey = ['products', 'stats'] as const

export function useProducts(page: number) {
  return useQuery({ queryKey: productsKey(page), queryFn: () => listProducts(page) })
}

export function useProductStats() {
  return useQuery({ queryKey: statsKey, queryFn: getProductStats })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ProductInput) => createProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ProductInput }) => updateProduct(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
