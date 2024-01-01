'use client'

import { useForm } from 'react-hook-form'
import { defaultLanguage, languageOptions } from '@/utils/lang'
import { TagInput } from '@/components/ui/tag-input'
import { z } from 'zod'
import { createPasteSchema } from '@/server/schema'
import { createPasteAction } from '@/actions/create-paste'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { handleActionError } from '@/utils/error-handler'
import { Loader2 } from 'lucide-react'

export type FormValues = z.infer<typeof createPasteSchema> & { tag: string }

const defaultValues: FormValues = {
  title: '',
  description: '',
  content: '',
  expiration: 'never',
  style: defaultLanguage,
  tag: '',
  tags: [],
  password: '',
}

const PasteForm = (
  { initialValues }: { initialValues?: FormValues } = {
    initialValues: undefined,
  },
) => {
  const router = useRouter()
  const methods = useForm<FormValues>({
    defaultValues: {
      ...defaultValues,
      ...initialValues,
    },
    values: initialValues,
    mode: 'onBlur',
  })

  const handleSubmit = async (values: FormValues) => {
    const action = await createPasteAction(values)
    if (!action) {
      return
    }

    if (action.success) {
      router.push(`/pastes/${action.data.id}`)
      return
    }

    if (!action.success) {
      handleActionError(methods.setError, action.errors)
    }
  }

  const resetForm = () => {
    methods.reset(defaultValues)
  }

  return (
    <Form {...methods}>
      <form
        onSubmit={methods.handleSubmit((data) => handleSubmit(data))}
        className="flex flex-col gap-6"
      >
        <FormField
          control={methods.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel required={true}>Title</FormLabel>
              <FormControl>
                <Input required placeholder="Error" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={methods.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="System.NullReferenceException" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={methods.control}
          name="tag"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <TagInput
                  {...field}
                  placeholder="bug"
                  arrayProp={'tags'}
                  required={false}
                  maxlength={15}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={methods.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel required={true}>Content</FormLabel>
              <FormControl>
                <Textarea
                  required={true}
                  placeholder="Object reference not set to an instance of an object."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={methods.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="Secure your paste" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between flex-col md:flex-row">
          <div className="flex gap-6 mb-6 md:mb-0">
            <div className="w-1/2 md:w-[150px]">
              <FormField
                control={methods.control}
                name="expiration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required={true}>Expiration</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        {...field}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Never" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            { key: 'never', value: 'never' },
                            { key: 'year', value: '1 year' },
                            { key: 'month', value: '1 month' },
                            { key: 'week', value: '1 week' },
                            { key: 'day', value: '1 day' },
                            { key: 'hour', value: '1 hour' },
                            { key: '10m', value: '10 minutes' },
                          ].map((option) => (
                            <SelectItem key={option.key} value={option.key}>
                              {option.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="w-1/2 md:w-[150px]">
              <FormField
                control={methods.control}
                name="style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required={true}>Style</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        {...field}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={field.value} />
                        </SelectTrigger>
                        <SelectContent>
                          {languageOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:self-end gap-2 md:gap-6">
            <Button
              type="submit"
              className="md:w-32"
              disabled={methods.formState.isSubmitting}
            >
              {methods.formState.isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Submit'
              )}
            </Button>
            <Button
              variant={'secondary'}
              onClick={resetForm}
              disabled={!methods.formState.isDirty}
              type="button"
              className=" px-5"
            >
              Reset
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}

export default PasteForm
