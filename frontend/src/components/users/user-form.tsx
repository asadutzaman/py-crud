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
import type { AppUser, AppUserInput } from '@/lib/api'
import { useRoles } from '@/queries/roles'

const NO_ROLE = 'none'

const baseSchema = {
  username: z.string().min(1, 'Username is required').max(150),
  email: z.string().min(1, 'Email is required').email('Must be a valid email'),
  first_name: z.string().max(150).optional(),
  last_name: z.string().max(150).optional(),
  role: z.string(),
}

const createSchema = z.object({
  ...baseSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const editSchema = z.object({
  ...baseSchema,
  password: z.union([z.literal(''), z.string().min(8, 'Password must be at least 8 characters')]),
})

interface UserFormProps {
  user?: AppUser
  onSubmit: (input: AppUserInput) => void
  isSubmitting?: boolean
  submitLabel?: string
}

export function UserForm({ user, onSubmit, isSubmitting, submitLabel = 'Save' }: UserFormProps) {
  const { data: rolesPage } = useRoles()
  const schema = user ? editSchema : createSchema
  type FormValues = z.infer<typeof schema>

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: user?.username ?? '',
      email: user?.email ?? '',
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
      role: user?.role ? String(user.role.id) : NO_ROLE,
      password: '',
    },
  })

  const submit = handleSubmit((values) => {
    const input: AppUserInput = {
      username: values.username,
      email: values.email,
      first_name: values.first_name ?? '',
      last_name: values.last_name ?? '',
      role_id: values.role === NO_ROLE ? null : Number(values.role),
      is_active: user?.is_active ?? true,
    }
    if (values.password) input.password = values.password
    onSubmit(input)
  })

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" {...register('username')} aria-invalid={!!errors.username} />
        {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register('email')} aria-invalid={!!errors.email} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="first_name">First name</Label>
          <Input id="first_name" {...register('first_name')} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="last_name">Last name</Label>
          <Input id="last_name" {...register('last_name')} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="role">Role</Label>
        <Controller
          control={control}
          name="role"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="role" className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_ROLE}>No role</SelectItem>
                {rolesPage?.results.map((role) => (
                  <SelectItem key={role.id} value={String(role.id)}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">{user ? 'New password (optional)' : 'Password'}</Label>
        <Input id="password" type="password" {...register('password')} aria-invalid={!!errors.password} />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="mt-2">
        {isSubmitting ? 'Saving…' : submitLabel}
      </Button>
    </form>
  )
}
