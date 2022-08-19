import { Field, Form, Formik, FormikHelpers } from 'formik'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Button from '../components/Button'
import Input from '../components/Input'
import Select, { Option } from '../components/Select'
import TagInput from '../components/TagInput'
import Textarea from '../components/Textarea'
import { routes } from '../constants/routes'
import { trpc } from '../utils/trpc'
import Spinner from '../components/Spinner'
import { DefaultLanguage, Languages } from '../components/Code'
import { capitalize } from '../utils/strings'

let values: FormValues = {
  title: '',
  description: '',
  content: '',
  expiration: 'never',
  style: DefaultLanguage.key,
  tag: '',
  tags: [],
  password: '',
}

type FormValues = {
  password: string
  description: string
  expiration: 'year' | 'never' | 'month' | 'week' | 'day' | 'hour' | '10m'
  style: string
  tag: string
  title: string
  content: string
  tags: string[]
}

const Home: NextPage = () => {
  const { mutateAsync } = trpc.useMutation(['paste.createPaste'])
  const router = useRouter()

  const forkId = Array.isArray(router.query.fork)
    ? router.query.fork[0]
    : router.query.fork

  const forkPassword = Array.isArray(router.query.password)
    ? router.query.password[0]
    : router.query.password

  const forkQuery = trpc.useQuery(
    ['paste.getPaste', { id: forkId ?? '', password: forkPassword ?? null }],
    {
      enabled: !!forkId,
      onSuccess: ({ paste }) => {
        values.title = paste?.title ?? ''
        values.description = paste?.description ?? ''
        values.content = paste?.content ?? ''
        values.style = paste?.style ?? DefaultLanguage.key
        values.tags = paste?.tags.map((tag) => tag.tag.name) ?? []
        values.tag = ''
      },
    },
  )

  const resetFork = async () => {
    if (forkId) {
      await router.replace({
        pathname: router.pathname,
      })
      router.reload()
    }
  }

  const handleSubmit = async (
    values: FormValues,
    helpers: FormikHelpers<FormValues>,
  ) => {
    await mutateAsync(values, {
      onError: (error) => {
        helpers.setErrors(error?.data?.zodError?.fieldErrors ?? {})
      },
      onSuccess: (id) => {
        router.push({
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
    <div className="flex flex-col gap-6">
      <Formik initialValues={values} onSubmit={handleSubmit}>
        {({ handleSubmit, values }) => (
          <Form onSubmit={handleSubmit}>
            <h2 className="text-3xl text-zinc-200 mb-10 font-semibold">
              Create new paste
            </h2>
            <div className="mb-6">
              <Field
                name="title"
                component={Input}
                label="Title"
                placeholder="In file included from a.cpp:1:0,
              from a.cpp:1,
              from a.cpp:1,
              from a.cpp:1,
              from a.cpp:1:
  a.cpp:2:1: error: ‘p’ does not name a type"
                required={true}
              />
            </div>
            <div className="mb-6">
              <Field
                name="description"
                component={Input}
                label="Description"
                placeholder={
                  "ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'by pwd' at line 1"
                }
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
                placeholder="c++ foo.cpp -o foo -ferror-limit=-1
              In file included from foo.cpp:2:
              In file included from /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/../lib/c++/v1/map:422:
              /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/../lib/c++/v1/__config:347:11: error: expected identifier or '{'
              namespace std {
                        ^
              foo.cpp:1:13: note: expanded from macro 'std'
              #define std +
                          ^"
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
                      value={values.expiration}
                      component={Select}
                      options={
                        [
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
                      value={values.style}
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
                  <Button
                    onClick={() => resetFork()}
                    type="reset"
                    className="bg-red-600 hover:bg-red-700 focus:ring-red-800 px-5"
                  >
                    Reset
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

export default Home
