import { NextPage } from 'next'
import { FormProvider } from 'react-hook-form'
import toast, { Toaster } from 'react-hot-toast'
import Button from '../components/Button'
import Checkbox from '../components/Checkbox'
import Input from '../components/Input'
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
    <div className="flex flex-col gap-6">
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(
            async (v) => {
              await handleRegister(v)
            },
            async (v) => {
              console.log('error', v)
            },
          )}
        >
          <h2 className="text-3xl text-zinc-200 mb-10 font-semibold">
            Create an account
          </h2>
          <div className="mb-6">
            <Input
              id={'email'}
              name={'email'}
              type={'email'}
              label={'Email'}
              required={true}
              placeholder={'hello@world.localhost'}
            />
          </div>
          <div className="mb-6">
            <Input
              id={'name'}
              name={'name'}
              type={'name'}
              label={'Name'}
              required={true}
              placeholder={'John Doe'}
            />
          </div>
          <div className="mb-6">
            <Input
              id={'password'}
              name={'password'}
              type={'password'}
              label={'Password'}
              placeholder={'********'}
              required={true}
            />
          </div>
          <div className="mb-6">
            <Input
              id={'confirmPassword'}
              name={'confirmPassword'}
              type={'password'}
              label={'Confirm Password'}
              placeholder={'********'}
              required={true}
            />
          </div>
          <div className="mb-6">
            <Checkbox
              label={
                <>
                  I agree with the{' '}
                  <a href="#" className="text-blue-500 hover:underline">
                    terms and conditions
                  </a>
                  .{' '}
                </>
              }
              required={true}
              id={'agree'}
              name={'agree'}
            />
          </div>
          <Button type="submit" className="px-20" disabled={mutation.isLoading}>
            Submit
          </Button>
          <Toaster />
        </form>
      </FormProvider>
    </div>
  )
}

export default Register
