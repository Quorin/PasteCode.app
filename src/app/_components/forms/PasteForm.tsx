'use client'

import { useForm } from 'react-hook-form'
import { defaultLanguage, languageOptions } from '../../../utils/lang'
import { useAction } from '../../api-client'
import { TagInput } from '../TagInput'
import { z } from 'zod'
import { createPasteSchema } from '../../../server/router/schema'
import { createPasteAction } from '../../_actions/create-paste'
import { errorHandler } from '../../../utils/errorHandler'
import { useRouter } from 'next/navigation'
import { Input } from '../../../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { Button } from '../../../components/ui/button'
import { Textarea } from '../../../components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form'

type FormValues = z.infer<typeof createPasteSchema> & { tag: string }

const PasteForm = () => {
  const router = useRouter()
  const methods = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
      content: '',
      expiration: 'never',
      style: defaultLanguage,
      tag: '',
      tags: [],
      password: '',
    },
    mode: 'onBlur',
  })

  const mutation = useAction(createPasteAction, {
    onSuccess: (id) => {
      router.push(`/pastes/${id}`)
    },
    onError: (error) => {
      errorHandler(methods.setError, error)
    },
  })

  const resetForm = () => {
    methods.setValue('tags', [])
  }

  return (
    <Form {...methods}>
      <form
        action={createPasteAction}
        onSubmit={methods.handleSubmit((data) => mutation.mutate(data))}
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
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Never" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            { key: 'never', value: 'Never' },
                            { key: 'year', value: '1 Year' },
                            { key: 'month', value: '1 Month' },
                            { key: 'week', value: '1 Week' },
                            { key: 'day', value: '1 Day' },
                            { key: 'hour', value: '1 Hour' },
                            { key: '10m', value: '10 Minutes' },
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
            {/* <div className="w-1/2 md:w-auto"> */}

            {/* </div> */}
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
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="(Text)" />
                        </SelectTrigger>
                        <SelectContent>
                          {languageOptions.map((option) => (
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
          </div>
          {/* <div className="flex gap-6 mb-6 md:mb-0">
            <div className="w-1/2 md:w-auto">
              <Select
                id={'expiration'}
                label={'Expiration'}
                required={true}
                name={'expiration'}
                options={[
                  { key: 'never', value: 'Never' },
                  { key: 'year', value: '1 Year' },
                  { key: 'month', value: '1 Month' },
                  { key: 'week', value: '1 Week' },
                  { key: 'day', value: '1 Day' },
                  { key: 'hour', value: '1 Hour' },
                  { key: '10m', value: '10 Minutes' },
                ]}
              />
            </div>
            <div className="w-1/2 md:w-auto">
              <Select
                id={'style'}
                label={'Style'}
                name={'style'}
                required={true}
                options={languageOptions}
              />
            </div>
          </div> */}
          <div className="flex flex-col md:flex-row md:self-end gap-2 md:gap-6">
            <Button
              type="submit"
              className="px-10"
              aria-disabled={mutation.status === 'loading'}
            >
              Submit
            </Button>
            <Button
              variant={'secondary'}
              onClick={resetForm}
              type="reset"
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
