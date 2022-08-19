import { NextPage } from 'next'
import { Field, Form, Formik, FormikHelpers } from 'formik'
import Input from '../../../components/Input'
import TagInput from '../../../components/TagInput'
import Textarea from '../../../components/Textarea'
import Select, { Option } from '../../../components/Select'
import Button from '../../../components/Button'
import { trpc } from '../../../utils/trpc'
import { useRouter } from 'next/router'
import { routes } from '../../../constants/routes'
import Spinner from '../../../components/Spinner'
import { DefaultLanguage, Languages } from '../../../components/Code'
import { capitalize } from '../../../utils/strings'

type FormType = {
  id: string
  description: string
  style: string
  tag: string
  title: string
  content: string
  tags: string[]
  currentPassword: string
  password: string
  expiration:
    | 'same'
    | 'never'
    | 'year'
    | 'month'
    | 'week'
    | 'day'
    | 'hour'
    | '10m'
}

const Edit: NextPage = () => {
  const router = useRouter()
  const { isLoading, data, error } = trpc.useQuery(
    [
      'paste.getPaste',
      {
        id: router.query.id as string,
        password: (router.query.password as string) ?? null,
      },
    ],
    {
      onError: (error) => {
        console.error(error)
      },
    },
  )

  const { mutateAsync: mutateUpdateAsync } = trpc.useMutation([
    'paste.updatePaste',
  ])

  const handleSubmit = async (
    values: FormType,
    helpers: FormikHelpers<FormType>,
  ) => {
    await mutateUpdateAsync(values, {
      onError: (error) => {
        helpers.setErrors(error?.data?.zodError?.fieldErrors ?? {})
      },
      onSuccess: () => {
        router.push({
          pathname: routes.PASTES.INDEX,
          query: { id: values.id },
        })
      },
    })
  }

  if (isLoading || error) {
    return (
      <div className="flex justify-center">
        <Spinner />
      </div>
    )
  }

  const getPassword = () =>
    Array.isArray(router.query.password)
      ? router.query.password[0] ?? ''
      : router.query.password ?? ''

  const paste = data?.paste

  const initialValues: FormType = {
    id: paste?.id ?? '',
    title: paste?.title ?? '',
    description: paste?.description ?? '',
    content: paste?.content ?? '',
    style: paste?.style ?? DefaultLanguage.key,
    tag: '',
    tags: paste?.tags.map((tag) => tag.tag.name) ?? [],
    expiration: 'same',
    password: getPassword(),
    currentPassword: getPassword(),
  }

  return (
    <div className="flex flex-col gap-6">
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ handleSubmit, initialValues }) => (
          <Form onSubmit={handleSubmit}>
            <h2 className="text-3xl text-zinc-200 mb-10 font-semibold">
              Edit paste
            </h2>
            <div className="mb-6">
              <Field
                name="title"
                component={Input}
                label="Title"
                defaultValue={initialValues?.title}
                required={true}
              />
            </div>
            <div className="mb-6">
              <Field
                name="description"
                component={Input}
                label="Description"
                defaultValue={initialValues?.description}
              />
            </div>
            <div className="mb-6">
              <Field
                name="tag"
                component={TagInput}
                label="Tags"
                placeholder="hacking"
                arrayProp="tags"
                maxlength={15}
              />
            </div>
            <div className="mb-6">
              <Field
                name="content"
                component={Textarea}
                required
                label="Content"
                defaultValue={initialValues?.content}
              />
            </div>
            <div className="mb-6">
              <Field
                name="password"
                component={Input}
                label="Password"
                placeholder="Optional password..."
                type="password"
              />
            </div>
            <div className="mb-6">
              <div className="flex justify-between flex-col md:flex-row">
                <div className="flex gap-5 mb-6 md:mb-0">
                  <div className="w-1/2 md:w-auto">
                    <Field
                      label="Expiration"
                      name="expiration"
                      defaultValue={initialValues?.expiration}
                      component={Select}
                      options={
                        [
                          { key: 'same', value: 'No Changes' },
                          { key: 'never', value: 'Never' },
                          { key: 'year', value: '1 Year' },
                          { key: 'month', value: '1 Month' },
                          { key: 'week', value: '1 Week' },
                          { key: 'day', value: '1 Day' },
                          { key: 'hour', value: '1 Hour' },
                          { key: '10m', value: '10 Minutes' },
                        ] as Option[]
                      }
                      required
                    ></Field>
                  </div>
                  <div className="w-1/2 md:w-auto">
                    <label
                      htmlFor="style"
                      className="block mb-2 text-sm font-medium text-zinc-300 after:content-['*'] after:ml-0.5 after:text-red-500"
                    >
                      Style
                    </label>
                    <Field
                      name="style"
                      value={DefaultLanguage.key}
                      component={Select}
                      required
                      options={Languages.map((lang) => ({
                        key: lang,
                        value: lang ? capitalize(lang) : DefaultLanguage.value,
                      }))}
                    ></Field>
                  </div>
                </div>

                <div className="flex self-center md:self-end gap-5">
                  <Button type="submit" className="px-10">
                    Submit
                  </Button>
                </div>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default Edit
