'use client'

import { z } from 'zod'
import { changeNameSchema } from '@/server/schema'
import { useForm } from 'react-hook-form'
import { changeNameAction } from '@/actions/change-name'
import { toast } from 'sonner'
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
import { handleActionError } from '@/utils/error-handler'

type FormValues = z.infer<typeof changeNameSchema>

const ChangeNameForm = () => {
  const methods = useForm<FormValues>({
    defaultValues: {
      name: '',
    },
  })

  const handleChange = async (values: FormValues) => {
    const action = await changeNameAction(values)
    if (!action) {
      return
    }

    if (!action.success) {
      handleActionError(methods.setError, action.errors)
      return
    }

    methods.reset()

    toast.success('Your name has been changed')
  }

  return (
    <Form {...methods}>
      <form
        onSubmit={methods.handleSubmit(handleChange)}
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
          className="md:w-44 md:self-start"
          disabled={methods.formState.isSubmitting}
        >
          {methods.formState.isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            'Submit'
          )}
        </Button>
      </form>
    </Form>
  )
}

export default ChangeNameForm
