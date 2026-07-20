import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Product, ProductInput } from '@/lib/api'
import { useCategories } from '@/queries/categories'

const NO_CATEGORY = 'none'

const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(2000).optional(),
  price: z
    .string()
    .min(1, 'Price is required')
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, 'Must be a positive number'),
  quantity: z
    .string()
    .min(1, 'Quantity is required')
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, 'Must be a non-negative integer'),
  category: z.string(),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  product?: Product
  onSubmit: (input: ProductInput) => void
  isSubmitting?: boolean
  submitLabel?: string
}

export function ProductForm({ product, onSubmit, isSubmitting, submitLabel = 'Save' }: ProductFormProps) {
  const { data: categories } = useCategories()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? '',
      description: product?.description ?? '',
      price: product?.price ?? '',
      quantity: product ? String(product.quantity) : '0',
      category: product?.category ? String(product.category.id) : NO_CATEGORY,
    },
  })

  const submit = handleSubmit((values) => {
    onSubmit({
      name: values.name,
      description: values.description ?? '',
      price: values.price,
      quantity: Number(values.quantity),
      category_id: values.category === NO_CATEGORY ? null : Number(values.category),
    })
  })

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register('name')} aria-invalid={!!errors.name} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={4} {...register('description')} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="category">Category</Label>
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CATEGORY}>Uncategorized</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="price">Price</Label>
          <Input id="price" type="number" step="0.01" min="0" {...register('price')} aria-invalid={!!errors.price} />
          {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input id="quantity" type="number" min="0" step="1" {...register('quantity')} aria-invalid={!!errors.quantity} />
          {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="mt-2">
        {isSubmitting ? 'Saving…' : submitLabel}
      </Button>
    </form>
  )
}
