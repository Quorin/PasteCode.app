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
import { removeAccountSchema } from '@/server/router/schema'
import { removeAccountAction } from '@/actions/remove-account'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { errorHandler } from '@/utils/errorHandler'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { useAction } from '@/app/api-client'

type FormValues = z.infer<typeof removeAccountSchema>

const DeletionDialog = (props: ButtonProps) => {
  const router = useRouter()
  const methods = useForm<FormValues>({
    defaultValues: {
      password: '',
    },
  })

  const mutation = useAction(removeAccountAction, {
    onError: (error) => {
      errorHandler(methods.setError, error)
    },

    onSuccess: () => {
      methods.reset()
      router.replace('/')

      toast.custom(
        () => (
          <div className="text-white bg-red-700 px-5 py-2.5 rounded-lg">
            <p>Account has been removed</p>
          </div>
        ),
        { position: 'bottom-center' },
      )
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
          {/* <Button variant="ghost">Cancel</Button>
          <Button variant="destructive">Remove Account & Data</Button> */}
          <Form {...methods}>
            <form
              onSubmit={methods.handleSubmit((data) => mutation.mutate(data))}
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
              <Button
                type="submit"
                className="px-10"
                disabled={mutation.status === 'loading'}
              >
                {mutation.status === 'loading' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Removing...
                  </>
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
