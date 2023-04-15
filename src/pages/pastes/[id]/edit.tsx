import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'
import Button from '../../../components/Button'
import { DefaultLanguage, Languages } from '../../../components/Code'
import FormTitle from '../../../components/FormTitle'
import Input from '../../../components/Input'
import Select from '../../../components/Select'
import Spinner from '../../../components/Spinner'
import TagInput from '../../../components/TagInput'
import Textarea from '../../../components/Textarea'
import { routes } from '../../../constants/routes'
import { updatePasteSchema } from '../../../server/router/schema'
import { errorHandler } from '../../../utils/errorHandler'
import { getQueryArg } from '../../../utils/http'
import { capitalize } from '../../../utils/strings'
import { api } from '../../../utils/trpc'
import useAuth from '../../../utils/useAuth'
import Unauthorized from '../../401'
import NotFound from '../../404'

type FormValues = z.infer<typeof updatePasteSchema> & { tag: string }

const Edit: NextPage = () => {
  const { isLoading: isAuthLoading, user } = useAuth()
  const router = useRouter()
  const mutation = api.paste.update.useMutation()
  const utils = api.useContext()

  const methods = useForm<FormValues>({
    defaultValues: {},
    mode: 'onBlur',
  })

  const { isLoading, data, error } = api.paste.get.useQuery(
    {
      id: getQueryArg(router.query.id) ?? '',
      password: getQueryArg(router.query.password) ?? null,
    },

    {
      refetchOnWindowFocus: false,
      onSuccess: ({ paste }) => {
        methods.setValue('id', paste?.id ?? '')
        methods.setValue('tags', paste?.tags.map((tag) => tag.tag.name) ?? [])
      },
      onError: async () => {
        await router.replace(routes.HOME)
      },
    },
  )

  const updatePaste = async (values: FormValues) => {
    mutation.mutate(values, {
      onError: (error) => {
        errorHandler(methods.setError, error)
      },
      onSuccess: async () => {
        await utils.paste.get.invalidate({ id: values.id })
        await router.push({
          pathname: routes.PASTES.INDEX,
          query: { id: values.id },
        })
      },
    })
  }

  if (isLoading || isAuthLoading || error) {
    return (
      <div className="flex justify-center">
        <Spinner />
      </div>
    )
  }

  if (
    !isAuthLoading &&
    (!user?.id || user.id !== data?.paste?.userId || !data?.paste.userId)
  ) {
    return <Unauthorized />
  }

  const paste = data?.paste

  if (!paste) {
    return <NotFound />
  }

  return (
    <FormProvider {...methods}>
      <FormTitle title="Edit paste" />
      <form
        onSubmit={methods.handleSubmit(updatePaste)}
        className="flex flex-col gap-6"
      >
        <Input
          id="title"
          label="Title"
          name="title"
          type="text"
          placeholder="Error"
          required={true}
          defaultValue={paste.title}
        />
        <Input
          id="description"
          label="Description"
          name="description"
          type="text"
          placeholder="System.NullReferenceException"
          required={false}
          defaultValue={paste.description ?? ''}
        />
        <TagInput
          id="tag"
          placeholder="bug"
          label={'Tags'}
          arrayProp={'tags'}
          required={false}
          maxlength={15}
          name={'tag'}
        />
        <Textarea
          id="content"
          label="Content"
          name="content"
          placeholder="Object reference not set to an instance of an object."
          required={true}
          defaultValue={paste.content ?? ''}
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
                defaultValue={'same'}
                name={'expiration'}
                options={[
                  { key: 'same', value: 'No Changes' },
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
                required={false}
                name={'style'}
                defaultValue={paste.style ?? DefaultLanguage.value}
                options={Languages.map((lang) => ({
                  key: lang,
                  value: lang ? capitalize(lang) : DefaultLanguage.value,
                }))}
              />
            </div>
          </div>

          <div className="flex flex-col md:self-end gap-6">
            <Button
              type="submit"
              className="px-10"
              disabled={mutation.isLoading}
            >
              Submit
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}

export default Edit
