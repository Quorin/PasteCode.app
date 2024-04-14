'use client'

import { useForm } from 'react-hook-form'
import { Button, ButtonProps } from '@/components/ui/button'
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
import { removeAccountAction } from '@/actions/remove-account'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

import { handleActionError } from '@/utils/error-handler'
import { routes } from '@/constants/routes'
import { logoutAction } from '@/actions/logout'
import { useAuth } from '@/utils/useAuth'

type FormValues = z.infer<typeof removeAccountSchema>

const DeletionDialog = (props: ButtonProps) => {
  const router = useRouter()
  const methods = useForm<FormValues>({
    defaultValues: {
      password: '',
    },
  })
  const { refetchUser } = useAuth()

  const handleDelete = async (values: FormValues) => {
    const action = await removeAccountAction(values)
    if (!action) {
      return
    }

    if (!action.success) {
      handleActionError(methods.setError, action.errors)
      return
    }

    methods.reset()

    router.replace(routes.HOME)

    toast.warning('Account has been removed')

    await logoutAction()

    refetchUser()
  }

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
          <Form {...methods}>
            <form
              onSubmit={methods.handleSubmit(handleDelete)}
              className="flex flex-col gap-6"
            >
              <FormField
                control={methods.control}
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
              <Button type="submit" disabled={methods.formState.isSubmitting}>
                {methods.formState.isSubmitting ? (
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
