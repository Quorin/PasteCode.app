'use client'

import { z } from 'zod'
import { changeNameSchema } from '@/server/router/schema'
import { useForm } from 'react-hook-form'
import { useAction } from '@/app/api-client'
import { changeNameAction } from '@/actions/change-name'
import { errorHandler } from '@/utils/errorHandler'
import toast from 'react-hot-toast'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

type FormValues = z.infer<typeof changeNameSchema>

const ChangeNameForm = () => {
  const methods = useForm<FormValues>({
    defaultValues: {
      name: '',
    },
  })

  const mutation = useAction(changeNameAction, {
    onSuccess: () => {
      methods.reset()

      toast.custom(
        () => (
          <div className="text-white bg-blue-700 px-5 py-2.5 rounded-lg">
            <p>Name has been changed</p>
          </div>
        ),
        { position: 'bottom-center' },
      )
    },
    onError: (error) => {
      errorHandler(methods.setError, error)
    },
  })

  return (
    <Form {...methods}>
      <form
        onSubmit={methods.handleSubmit((data) => mutation.mutate(data))}
        className="flex flex-col gap-6"
      >
        <FormField
          control={methods.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel required={true}>New Name</FormLabel>
              <FormControl>
                <Input required {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="px-20 md:self-start"
          disabled={mutation.status === 'loading'}
        >
          {mutation.status === 'loading' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit'
          )}
        </Button>
      </form>
    </Form>
  )
}

export default ChangeNameForm
