'use client'

import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { z } from 'zod'
import { removeAccountSchema } from '@/server/schema'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

import type React from 'react'
import { setFormErrors } from '@/utils/form-handler'
import { zodResolver } from '@hookform/resolvers/zod'
import { useServerAction } from '@orpc/react/hooks'
import { removeAccount } from '@/actions/remove-account'
import { onError, onSuccess } from '@orpc/client'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { userQueryOptions } from '@/utils/logout'

type FormValues = z.infer<typeof removeAccountSchema>

const DeletionDialog = (props: React.ComponentProps<typeof Button>) => {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { execute } = useServerAction(removeAccount, {
    interceptors: [
      onSuccess(async () => {
        toast.warning('Account has been removed')
        await queryClient.invalidateQueries(userQueryOptions)
        router.push('/')
      }),
      onError((error) => {
        setFormErrors(error, form.setError)
        toast.error('Could not remove account')
      }),
    ],
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(removeAccountSchema),
    defaultValues: {
      password: '',
    },
  })

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" {...props}>
          Remove Account & Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Removal Confirmation</DialogTitle>
          <DialogDescription>
            Are you sure you want to deactivate your account? All of your data
            will be permanently removed. This action cannot be undone.
          </DialogDescription>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => execute(values))}
              className="flex flex-col gap-6"
            >
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required={true}>Password</FormLabel>
                    <FormControl>
                      <Input
                        required
                        placeholder="********"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide password to confirm your action
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  'Remove Account & Data'
                )}
              </Button>
            </form>
          </Form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default DeletionDialog
