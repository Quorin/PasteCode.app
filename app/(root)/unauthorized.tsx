import { routes } from '@/constants/routes'
import { redirect } from 'next/navigation'

export default function Unauthorized() {
  redirect(routes.AUTH.LOGIN)
}
