import dayjs from 'dayjs'
import { Field, Form, Formik } from 'formik'
import { NextPage } from 'next'
import Image from 'next/image'
import { useRouter } from 'next/router'
import Button from '../../../components/Button'
import Code from '../../../components/Code'
import Input from '../../../components/Input'
import Spinner from '../../../components/Spinner'
import { routes } from '../../../constants/routes'
import { trpc } from '../../../utils/trpc'
import useAuth from '../../../utils/useAuth'

const initialValues = {
  password: '',
}

type FormValues = typeof initialValues

const Paste: NextPage = () => {
  const router = useRouter()
  const { isLoggedIn, isLoading: isAuthLoading, user } = useAuth()

  const handleSubmit = async (values: FormValues) => {
    router.replace({
      pathname: routes.PASTES.INDEX,
      query: { id: router.query.id, password: values.password },
    })
  }

  const { data, isLoading, error } = trpc.useQuery([
    'paste.getPaste',
    {
      id: router.query.id as string,
      password: (router.query.password as string) ?? null,
    },
  ])

  const canEdit = () =>
    !isAuthLoading && isLoggedIn && user?.id === data?.paste?.userId

  if (data?.secure) {
    return (
      <div className="flex flex-col justify-center items-center">
        <Image
          src="/images/secure.svg"
          alt="Paste is secure"
          width={500}
          height={400}
        />
        <h3 className="text-lg text-red-300">
          Paste is secured with a password
        </h3>
        <div className="flex flex-col gap-6 mt-6">
          <Formik initialValues={initialValues} onSubmit={handleSubmit}>
            {({ handleSubmit, values }) => (
              <Form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <Field
                    name="password"
                    type="password"
                    label=""
                    component={Input}
                    placeholder="*******"
                    required={true}
                    value={values.password}
                  />
                </div>
                <Button type="submit" className="px-20">
                  Decrypt Paste
                </Button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {isLoading || error ? (
        <div className="flex justify-center">
          <Spinner />
        </div>
      ) : !data?.paste ? (
        <h2 className="text-2xl text-zinc-100 text-bold text-center">
          Paste not found
        </h2>
      ) : (
        <div>
          <h2 className="text-3xl text-zinc-200 mb-10 font-semibold">
            {data.paste.title}
          </h2>
          {data.paste.description && (
            <h3 className="text-lg text-zinc-400 mb-10 font-light italic bg-zinc-700 p-5 rounded-2xl">
              {data.paste.description}
            </h3>
          )}
          {data.paste.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              {data.paste.tags.map((tag) => (
                <span
                  key={tag.tag.name}
                  className="text-zinc-100 bg-zinc-700 px-3 py-1 rounded-2xl"
                >
                  {tag.tag.name}
                </span>
              ))}
            </div>
          )}
          <div className="mb-10 grid grid-cols-2 md:grid-cols-4 md:place-items-stretch md:w-2/3 lg:w-1/2 gap-2">
            <button
              className="bg-zinc-200 px-5 py-2 rounded text-zinc-700 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
              type="button"
              onClick={() =>
                navigator.clipboard.writeText(data?.paste?.content ?? '')
              }
            >
              Copy
            </button>
            {canEdit() && (
              <button
                className="bg-zinc-200 px-5 py-2 rounded text-zinc-700 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
                type="button"
                onClick={() =>
                  router.push({
                    pathname: routes.PASTES.EDIT,
                    query: {
                      id: router.query.id,
                      password: router.query.password,
                    },
                  })
                }
              >
                Edit
              </button>
            )}
            <a
              className=" text-center cursor-pointer bg-zinc-200 px-5 py-2 rounded text-zinc-700 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
              type="button"
              href={`${router.asPath.replace(
                router.query.id as string,
                `${router.query.id}/raw`,
              )}`}
            >
              Raw
            </a>
            <button
              className="bg-zinc-200 px-5 py-2 rounded text-zinc-700 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
              type="button"
              onClick={() => {}}
            >
              Fork
            </button>
          </div>
          <div className="mb-10">
            <Code
              code={data.paste.content}
              language={data.paste.style ?? 'txt'}
            />
          </div>
          <p className="text-zinc-300 text-sm">
            Created at:{' '}
            <span className="font-bold">
              {dayjs(data.paste.createdAt).format('YYYY/MM/DD')}
            </span>
          </p>
          <p className="text-zinc-300 text-sm">
            Expires at:{' '}
            <span className="font-bold">
              {data.paste.expiresAt
                ? dayjs(data.paste.expiresAt).format('YYYY/MM/DD')
                : 'Never'}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}

export default Paste
