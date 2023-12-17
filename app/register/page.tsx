import RegisterForm from '@/components/forms/register-form'
import FormTitle from '@/components/ui/form-title'

export default function Register() {
  return (
    <div>
      <FormTitle title="Create an account" />
      <RegisterForm />
    </div>
  )
}
