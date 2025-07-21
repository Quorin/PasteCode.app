'use client'

import { useForm } from 'react-hook-form'
import { defaultLanguage, languageOptions } from '@/utils/lang'
import { TagInput } from '@/components/ui/tag-input'
import { z } from 'zod'
import { updatePasteSchema } from '@/server/schema'
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
import { Loader2 } from 'lucide-react'
import { editPaste } from '@/actions/edit-paste'
import { onError, onSuccess } from '@orpc/client'
import { setFormErrors } from '@/utils/form-handler'
import { useServerAction } from '@orpc/react/hooks'
import { useRouter } from 'next/navigation'

export type FormValues = z.infer<typeof updatePasteSchema> & { tag: string }

const EditPasteForm = ({
  initialValues: defaultValues,
}: {
  initialValues: FormValues
}) => {
  const router = useRouter()

  const { execute } = useServerAction(editPaste, {
    interceptors: [
      onSuccess(async () => {
        form.reset(defaultValues)
        router.push(`/pastes/${defaultValues.id}`)
      }),
      onError(async (error) => {
        setFormErrors(error, form.setError)
      }),
    ],
  })

  const form = useForm<FormValues>({
    defaultValues,
    mode: 'onBlur',
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => execute(data))}
        className="flex flex-col gap-6"
      >
        <FormField
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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
                control={form.control}
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
                          <SelectValue placeholder="No changes" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            { key: 'same', value: 'no changes' },
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
                control={form.control}
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
                          <SelectValue
                            placeholder={field.value || defaultLanguage}
                          />
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
              className="md:w-28"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Save'
              )}
            </Button>
            <Button
              variant={'secondary'}
              onClick={() => form.reset(defaultValues)}
              disabled={!form.formState.isDirty}
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

export default EditPasteForm
