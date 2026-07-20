import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Category, CategoryInput } from '@/lib/api'

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface CategoryFormProps {
  category?: Category
  onSubmit: (input: CategoryInput) => void
  isSubmitting?: boolean
  submitLabel?: string
}

export function CategoryForm({ category, onSubmit, isSubmitting, submitLabel = 'Save' }: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? '',
    },
  })

  const submit = handleSubmit((values) => {
    onSubmit({ name: values.name })
  })

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register('name')} aria-invalid={!!errors.name} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="mt-2">
        {isSubmitting ? 'Saving…' : submitLabel}
      </Button>
    </form>
  )
}
