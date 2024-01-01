'use client'

import { useEffect } from 'react'
import toast from 'react-hot-toast'

const IncorrectPassword = ({ password }: { password: string }) => {
  useEffect(() => {
    toast.custom(
      () => (
        <div className="text-white bg-red-700 px-5 py-2.5 rounded-lg">
          <p>Password is incorrect</p>
        </div>
      ),
      { position: 'bottom-center' },
    )
  }, [password])

  return <></>
}

export default IncorrectPassword
