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
import relativeTime from 'dayjs/plugin/relativeTime'
import {
  ClipboardCopyIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/outline'
import { DuplicateIcon } from '@heroicons/react/outline'
import Modal from '../../../components/Modal'
import { useState } from 'react'

dayjs.extend(relativeTime)

const initialValues = {
  password: '',
}

type FormValues = typeof initialValues

const Paste: NextPage = () => {
  const router = useRouter()
  const { isLoggedIn, isLoading: isAuthLoading, user } = useAuth()
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)

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

  const { mutateAsync: deletePasteAsync } = trpc.useMutation([
    'paste.removePaste',
  ])

  const handleDelete = async (id: string) => {
    setIsDeleteModalVisible(false)
    await deletePasteAsync(
      { id, password: (router.query.password as string) ?? null },
      {
        async onSuccess() {
          await router.replace(routes.HOME)
        },
      },
    )
  }

  const canEdit =
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
          <h2 className="text-3xl text-zinc-200 mb-10 font-semibold break-all">
            {data.paste.title}
          </h2>
          {data.paste.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 my-5">
              {data.paste.tags.map((tag) => (
                <p
                  key={tag.tag.name}
                  className="inline-flex items-center py-1 px-2 text-sm font-medium text-gray-800 bg-gray-100 rounded dark:bg-zinc-500 dark:text-zinc-200"
                >
                  #{tag.tag.name}
                </p>
              ))}
            </div>
          )}
          {data.paste.description && (
            <h3 className="text-sm text-zinc-400 mb-10 font-light italic break-all">
              {data.paste.description}
            </h3>
          )}

          <div className="mb-10 flex gap-2 flex-wrap">
            <button
              className="bg-zinc-700 px-5 py-2 rounded text-zinc-300 transition-colors hover:bg-zinc-600 hover:text-zinc-200"
              type="button"
              onClick={() =>
                navigator.clipboard.writeText(data?.paste?.content ?? '')
              }
            >
              <div className="flex items-center gap-2 justify-center">
                <ClipboardCopyIcon className="w-6" />
                Copy
              </div>
            </button>
            {canEdit && (
              <button
                className="bg-zinc-700 px-5 py-2 rounded text-zinc-300 transition-colors hover:bg-zinc-600 hover:text-zinc-200"
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
                <div className="flex items-center gap-2 justify-center">
                  <PencilIcon className="w-6" />
                  Edit
                </div>
              </button>
            )}
            <a
              className="text-center cursor-pointer bg-zinc-700 px-5 py-2 rounded text-zinc-300 transition-colors hover:bg-zinc-600 hover:text-zinc-200"
              type="button"
              href={`${router.asPath.replace(
                router.query.id as string,
                `${router.query.id}/raw`,
              )}`}
            >
              <div className="flex items-center gap-2 justify-center">
                <DocumentTextIcon className="w-6" />
                Raw View
              </div>
            </a>
            <button
              className="bg-zinc-700 px-5 py-2 rounded text-zinc-300 transition-colors hover:bg-zinc-600 hover:text-zinc-200"
              type="button"
              onClick={() =>
                router.push({
                  pathname: routes.HOME,
                  query: {
                    fork: data.paste?.id,
                    password: router.query.password ?? null,
                  },
                })
              }
            >
              <div className="flex items-center gap-2 justify-center">
                <DuplicateIcon className="w-6" />
                Duplicate
              </div>
            </button>
            {canEdit && (
              <button
                className="bg-zinc-700 px-5 py-2 rounded text-zinc-300 transition-colors hover:bg-zinc-600 hover:text-zinc-200"
                type="button"
                onClick={() => setIsDeleteModalVisible(true)}
              >
                <div className="flex items-center gap-2 justify-center">
                  <TrashIcon className="w-6" />
                  Delete
                </div>
              </button>
            )}
            <Modal
              visible={isDeleteModalVisible}
              action={() => handleDelete(data.paste?.id ?? '')}
              close={() => setIsDeleteModalVisible(false)}
              accentColor="red"
              title="Remove paste"
              actionTitle="Remove"
              description="Are you sure you want to remove this paste? It's cannot be undone."
            />
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
            Expires:{' '}
            <span className="font-bold">
              {data.paste.expiresAt
                ? dayjs(data.paste.expiresAt).fromNow()
                : 'Never'}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}

export default Paste
