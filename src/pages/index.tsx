import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { FormProvider } from 'react-hook-form'
import { z } from 'zod'
import Button from '../components/Button'
import { DefaultLanguage, Languages } from '../components/Code'
import Input from '../components/Input'
import Select from '../components/Select'
import Spinner from '../components/Spinner'
import TagInput from '../components/TagInput'
import Textarea from '../components/Textarea'
import { routes } from '../constants/routes'
import { createPasteSchema } from '../server/router/schema'
import { errorHandler } from '../utils/errorHandler'
import { getQueryArg } from '../utils/http'
import { capitalize } from '../utils/strings'
import { inferMutationInput, trpc, useZodForm } from '../utils/trpc'

type FormValues = inferMutationInput<'paste.createPaste'> & { tag: string }

const Home: NextPage = () => {
  const mutation = trpc.useMutation(['paste.createPaste'])
  const router = useRouter()

  const methods = useZodForm({
    schema: createPasteSchema.extend({ tag: z.string() }),
    defaultValues: {
      title: '',
      description: '',
      content: '',
      expiration: 'never',
      style: DefaultLanguage.key,
      tag: '',
      tags: [],
      password: '',
    },
    mode: 'onBlur',
  })

  const forkId = getQueryArg(router.query.fork)
  const forkPassword = getQueryArg(router.query.password)

  const forkQuery = trpc.useQuery(
    ['paste.getPaste', { id: forkId ?? '', password: forkPassword ?? null }],
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
        methods.setValue('style', paste.style ?? DefaultLanguage.key)
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
      <form
        onSubmit={methods.handleSubmit(async (v) => {
          await createPaste(v)
        })}
      >
        <h2 className="text-3xl text-zinc-200 mb-10 font-semibold">
          Create new paste
        </h2>
        <div className="mb-6">
          <Input
            id="title"
            label="Title"
            name="title"
            type="text"
            placeholder="Error"
            required={true}
          />
        </div>
        <div className="mb-6">
          <Input
            id="description"
            label="Description"
            name="description"
            type="text"
            placeholder="System.NullReferenceException"
            required={false}
          />
        </div>
        <div className="mb-6">
          <TagInput
            id="tag"
            placeholder="bug"
            name="tag"
            label={'Tags'}
            arrayProp={'tags'}
            required={false}
            maxlength={15}
          />
        </div>
        <div className="mb-6">
          <Textarea
            id="content"
            label="Content"
            name="content"
            placeholder="Object reference not set to an instance of an object."
            required={true}
          />
        </div>
        <div className="mb-6">
          <Input
            id="password"
            label="Password"
            type="password"
            name="password"
            placeholder="Secure your paste"
            required={false}
          />
        </div>
        <div className="mb-6">
          <div className="flex justify-between flex-col md:flex-row">
            <div className="flex gap-5 mb-6 md:mb-0">
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
                  required={false}
                  options={Languages.map((lang) => ({
                    key: lang,
                    value: lang ? capitalize(lang) : DefaultLanguage.value,
                  }))}
                />
              </div>
            </div>

            <div className="flex self-center md:self-end gap-5">
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
        </div>
      </form>
    </FormProvider>
  )
}

export default Home
