import {
  ClipboardIcon,
  DocumentTextIcon,
  DocumentDuplicateIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import Button from '../../../components/Button'
import FormTitle from '../../../components/FormTitle'
import Input from '../../../components/Input'
import Modal from '../../../components/Modal'
import { routes } from '../../../constants/routes'
import { getPasteSchema } from '../../../server/router/schema'
import { getQueryArg } from '../../../utils/http'
import { RouterOutputs, api } from '../../../utils/trpc'
import useAuth from '../../../utils/useAuth'
import NotFound from '../../404'
import { z } from 'zod'
import { getHighlighter } from 'shikiji/index.mjs'
import { bundledLanguages } from 'shikiji/langs.mjs'
import { ssrHelper } from '../../../utils/ssr'
import Code from '../../../components/Code'
dayjs.extend(relativeTime)

type FormValues = z.infer<typeof getPasteSchema>

export const getServerSideProps: GetServerSideProps<
  {
    code: string
  } & RouterOutputs['paste']['get']
> = async (context) => {
  const shiki = await getHighlighter({
    themes: ['material-theme-darker'],
    langs: Object.keys(bundledLanguages),
  })
  const { id } = context.query

  const { paste, secure } = await (
    await ssrHelper()
  ).paste.get.fetch({ id: id as string, password: null })

  return {
    props: {
      code: shiki.codeToHtml(paste?.content ?? '', {
        lang: paste?.style ?? 'txt',
        theme: 'material-theme-darker',
      }),
      paste: JSON.parse(JSON.stringify(paste)),
      secure,
    },
  }
}

const Paste = ({
  code,
  paste,
  secure,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const { isLoggedIn, isLoading: isAuthLoading, user } = useAuth()
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)

  const unlockPasteMethods = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues: {
      id: getQueryArg(router.query.id) ?? '',
      password: '',
    },
  })
  const handleUnlockPaste = async (values: FormValues) => {
    router.replace({
      pathname: routes.PASTES.INDEX,
      query: { id: router.query.id, password: values.password },
    })
  }

  const mutation = api.paste.remove.useMutation()

  const handleDelete = async (id: string) => {
    setIsDeleteModalVisible(false)
    mutation.mutate(
      { id, password: getQueryArg(router.query.password) ?? undefined },
      {
        async onSuccess() {
          await router.replace(routes.HOME)
        },
      },
    )
  }

  const canEdit = !isAuthLoading && isLoggedIn && user?.id === paste?.userId

  if (secure) {
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
          <FormProvider {...unlockPasteMethods}>
            <form onSubmit={unlockPasteMethods.handleSubmit(handleUnlockPaste)}>
              <div className="mb-6">
                {' '}
                <Input
                  id="password"
                  name="password"
                  type={'password'}
                  placeholder="*********"
                  required={true}
                />
              </div>

              <Button type="submit" className="px-20">
                Decrypt Paste
              </Button>
            </form>
          </FormProvider>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {!paste ? (
        <h2 className="text-2xl text-zinc-100 text-bold text-center">
          <NotFound />
        </h2>
      ) : (
        <div>
          <FormTitle title={paste.title} />
          {paste.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 my-5">
              {paste.tags.map((tag) => (
                <p
                  key={tag.tag.name}
                  className="inline-flex items-center py-1 px-2 text-sm font-medium  rounded bg-zinc-500 text-zinc-200"
                >
                  #{tag.tag.name}
                </p>
              ))}
            </div>
          )}
          {paste.description && (
            <h3 className="text-sm text-zinc-400 mb-10 font-light italic break-all">
              {paste.description}
            </h3>
          )}

          <div className="mb-10 flex gap-2 flex-wrap">
            <button
              className="bg-zinc-700 px-5 py-2 rounded text-zinc-300 transition-colors hover:bg-zinc-600 hover:text-zinc-200"
              type="button"
              onClick={() => navigator.clipboard.writeText(paste.content)}
            >
              <div className="flex items-center gap-2 justify-center">
                <ClipboardIcon className="w-6" />
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
                    fork: paste?.id,
                    password: router.query.password ?? null,
                  },
                })
              }
            >
              <div className="flex items-center gap-2 justify-center">
                <DocumentDuplicateIcon className="w-6" />
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
              action={() => handleDelete(paste.id)}
              close={() => setIsDeleteModalVisible(false)}
              accentColor="warning"
              title="Remove paste"
              actionTitle="Remove"
              description="Are you sure you want to remove this paste? It's cannot be undone."
            />
          </div>
          <div className="mb-10">
            <Code code={code} />
          </div>
          <p className="text-zinc-300 text-sm">
            Created at:{' '}
            <span className="font-bold">
              {dayjs(paste.createdAt).format('YYYY/MM/DD')}
            </span>
          </p>
          <p className="text-zinc-300 text-sm">
            Expires:{' '}
            <span className="font-bold">
              {paste.expiresAt ? dayjs(paste.expiresAt).fromNow() : 'Never'}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}

export default Paste
