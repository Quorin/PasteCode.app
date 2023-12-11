'use client'

import { FormProvider, useForm } from 'react-hook-form'
import { defaultLanguage, languageOptions } from '../../../utils/lang'
import { useAction } from '../../api-client'
import Button from '../Button'
import Input from '../Input'
import Select from '../Select'
import TagInput from '../TagInput'
import Textarea from '../Textarea'
import { z } from 'zod'
import { createPasteSchema } from '../../../server/router/schema'
import { createPasteAction } from '../../_actions/create-paste'
import { errorHandler } from '../../../utils/errorHandler'

type FormValues = z.infer<typeof createPasteSchema> & { tag: string }

const PasteForm = () => {
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
    onSuccess: (data) => {
      console.log(data)
    },
    onError: (error) => {
      errorHandler(methods.setError, error)
    },
  })

  const resetForm = () => {
    methods.setValue('tags', [])
  }

  return (
    <FormProvider {...methods}>
      <form
        action={createPasteAction}
        onSubmit={methods.handleSubmit((data) => mutation.mutate(data))}
        className="flex flex-col gap-6"
      >
        <Input
          id="title"
          label="Title"
          name="title"
          type="text"
          placeholder="Error"
          required={true}
        />
        <Input
          id="description"
          label="Description"
          name="description"
          type="text"
          placeholder="System.NullReferenceException"
          required={false}
        />
        <TagInput
          id="tag"
          placeholder="bug"
          name="tag"
          label={'Tags'}
          arrayProp={'tags'}
          required={false}
          maxlength={15}
        />
        <Textarea
          id="content"
          label="Content"
          name="content"
          placeholder="Object reference not set to an instance of an object."
          required={true}
        />
        <Input
          id="password"
          label="Password"
          type="password"
          name="password"
          placeholder="Secure your paste"
          required={false}
        />
        <div className="flex justify-between flex-col md:flex-row">
          <div className="flex gap-6 mb-6 md:mb-0">
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
          </div>
          <div className="flex flex-col md:flex-row md:self-end gap-2 md:gap-6">
            <Button
              type="submit"
              className="px-10"
              disabled={mutation.status === 'loading'}
            >
              Submit
            </Button>
            <Button
              onClick={resetForm}
              type="reset"
              className="bg-red-600 hover:bg-red-700 focus:ring-red-800 px-5"
            >
              Reset
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}

export default PasteForm
