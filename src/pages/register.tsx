import { NextPage } from 'next'
import Link from 'next/link'
import { FormProvider } from 'react-hook-form'
import toast from 'react-hot-toast'
import Button from '../components/Button'
import Checkbox from '../components/Checkbox'
import FormTitle from '../components/FormTitle'
import Input from '../components/Input'
import { routes } from '../constants/routes'
import { registerSchema } from '../server/router/schema'
import { errorHandler } from '../utils/errorHandler'
import { inferMutationInput, trpc, useZodForm } from '../utils/trpc'

type FormValues = inferMutationInput<'user.register'>

const Register: NextPage = () => {
  const mutation = trpc.useMutation(['user.register'])

  const methods = useZodForm({
    mode: 'onBlur',
    schema: registerSchema,
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      agree: false,
      name: '',
    },
  })

  const handleRegister = async (values: FormValues) => {
    mutation.mutate(values, {
      onError: (error) => {
        errorHandler(methods.setError, error)
      },
      onSuccess: () => {
        methods.reset()
        toast.custom(
          () => (
            <div className="text-white bg-green-500 px-5 py-2.5 rounded-lg">
              <p>Check your inbox to confirm account</p>
            </div>
          ),
          { position: 'bottom-center' },
        )
      },
    })
  }

  return (
    <div>
      <FormProvider {...methods}>
        <FormTitle title="Create an account" />
        <form
          onSubmit={methods.handleSubmit(async (v) => {
            await handleRegister(v)
          })}
          className="flex flex-col gap-6"
        >
          <Input
            id={'email'}
            name={'email'}
            type={'email'}
            label={'Email'}
            required={true}
            placeholder={'hello@world.localhost'}
          />
          <Input
            id={'name'}
            name={'name'}
            type={'name'}
            label={'Name'}
            required={true}
            placeholder={'John Doe'}
          />
          <Input
            id={'password'}
            name={'password'}
            type={'password'}
            label={'Password'}
            placeholder={'********'}
            required={true}
          />
          <Input
            id={'confirmPassword'}
            name={'confirmPassword'}
            type={'password'}
            label={'Confirm Password'}
            placeholder={'********'}
            required={true}
          />
          <Checkbox
            label={
              <>
                I agree with the{' '}
                <div className="inline text-blue-500 hover:underline">
                  <Link href={routes.TERMS_AND_CONDITIONS}>
                    terms and conditions
                  </Link>
                </div>
                .{' '}
              </>
            }
            required={true}
            id={'agree'}
            name={'agree'}
          />
          <Button
            type="submit"
            className="px-20 md:self-start"
            disabled={mutation.isLoading}
          >
            Submit
          </Button>
        </form>
      </FormProvider>
    </div>
  )
}

export default Register
