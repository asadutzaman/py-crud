import { Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { CustomerForm } from '@/components/customers/customer-form'
import { CustomerTable } from '@/components/customers/customer-table'
import { DeleteCustomerDialog } from '@/components/customers/delete-customer-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { Customer, CustomerInput } from '@/lib/api'
import {
  useCreateCustomer,
  useCustomers,
  useDeleteCustomer,
  useUpdateCustomer,
} from '@/queries/customers'

export function CustomersPage() {
  const [page] = useState(1)
  const [search, setSearch] = useState('')
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null)

  const { data, isLoading } = useCustomers(page, search)
  const createCustomer = useCreateCustomer()
  const updateCustomer = useUpdateCustomer()
  const deleteCustomer = useDeleteCustomer()

  function openCreate() {
    setEditingCustomer(null)
    setIsSheetOpen(true)
  }

  function openEdit(customer: Customer) {
    setEditingCustomer(customer)
    setIsSheetOpen(true)
  }

  function handleSubmit(input: CustomerInput) {
    if (editingCustomer) {
      updateCustomer.mutate(
        { id: editingCustomer.id, input },
        {
          onSuccess: () => {
            toast.success(`Customer "${input.name}" updated.`)
            setIsSheetOpen(false)
          },
          onError: () => toast.error('Failed to update customer.'),
        },
      )
    } else {
      createCustomer.mutate(input, {
        onSuccess: () => {
          toast.success(`Customer "${input.name}" created.`)
          setIsSheetOpen(false)
        },
        onError: () => toast.error('Failed to create customer.'),
      })
    }
  }

  function handleDeleteConfirm() {
    if (!deletingCustomer) return
    deleteCustomer.mutate(deletingCustomer.id, {
      onSuccess: () => {
        toast.success(`Customer "${deletingCustomer.name}" deleted.`)
        setDeletingCustomer(null)
      },
      onError: () => toast.error('Failed to delete customer.'),
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Customers</h1>
          <p className="text-sm text-muted-foreground">Manage your customer directory.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          New Customer
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <Card>
        <CardContent>
          <CustomerTable
            customers={data?.results ?? []}
            isLoading={isLoading}
            onEdit={openEdit}
            onDelete={setDeletingCustomer}
          />
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingCustomer ? 'Edit Customer' : 'New Customer'}</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-4">
            <CustomerForm
              customer={editingCustomer ?? undefined}
              onSubmit={handleSubmit}
              isSubmitting={createCustomer.isPending || updateCustomer.isPending}
              submitLabel={editingCustomer ? 'Save changes' : 'Create customer'}
            />
          </div>
        </SheetContent>
      </Sheet>

      <DeleteCustomerDialog
        customer={deletingCustomer}
        onOpenChange={(open) => !open && setDeletingCustomer(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteCustomer.isPending}
      />
    </div>
  )
}
