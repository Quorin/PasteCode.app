'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

const IncorrectPassword = ({ password }: { password: string }) => {
  useEffect(() => {
    toast.error('Password is incorrect')
  }, [password])

  return <></>
}

export default IncorrectPassword
