import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'
import Button from '../components/Button'
import FormTitle from '../components/FormTitle'
import Input from '../components/Input'
import Select from '../components/Select'
import Spinner from '../components/Spinner'
import TagInput from '../components/TagInput'
import Textarea from '../components/Textarea'
import { routes } from '../constants/routes'
import { createPasteSchema } from '../server/router/schema'
import { errorHandler } from '../utils/errorHandler'
import { getQueryArg } from '../utils/http'
import { api } from '../utils/trpc'
import { defaultLanguage, languageOptions } from '../utils/lang'

type FormValues = z.infer<typeof createPasteSchema> & { tag: string }

const Home: NextPage = () => {
  const mutation = api.paste.create.useMutation()
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

  const forkId = getQueryArg(router.query.fork)
  const forkPassword = getQueryArg(router.query.password)

  const forkQuery = api.paste.get.useQuery(
    { id: forkId ?? '', password: forkPassword ?? null },
    {
      refetchOnWindowFocus: false,
      enabled: !!forkId,
      onSuccess: ({ paste }) => {
        if (!paste) {
          return
        }

        methods.setValue('title', paste.title)
        methods.setValue('description', paste.description ?? '')
        methods.setValue('content', paste.content)
        methods.setValue('style', paste.style ?? '')
        methods.setValue('tags', paste.tags.map((tag) => tag.tag.name) ?? [])
        methods.resetField('tag')
      },
    },
  )

  const resetForm = async () => {
    methods.setValue('tags', [])

    if (forkId) {
      await router.replace({
        pathname: router.pathname,
      })
      router.reload()
    }
  }

  const createPaste = async (v: FormValues) => {
    mutation.mutate(v, {
      onError: (e) => {
        errorHandler(methods.setError, e)
      },
      async onSuccess(id) {
        await router.push({
          pathname: routes.PASTES.INDEX,
          query: { id },
        })
      },
    })
  }

  if (forkId && (forkQuery.isLoading || forkQuery.error)) {
    return (
      <div className="flex justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <FormProvider {...methods}>
      <FormTitle title="Create new paste" />
      <form
        onSubmit={methods.handleSubmit(createPaste)}
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
              disabled={mutation.isLoading}
            >
              Submit
            </Button>
            <Button
              onClick={() => resetForm()}
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

export default Home
