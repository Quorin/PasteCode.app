'use client'

import { ErrorMessage } from '@hookform/error-message'
import { InputHTMLAttributes, ReactElement } from 'react'
import { useFormContext } from 'react-hook-form'
import Label from './Label'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string | ReactElement
}

const Checkbox = ({ label, ...props }: Props) => {
  const { register, formState } = useFormContext()
  return (
    <div>
      <div className="flex flex-row gap-3 place-items-center">
        <input
          id={props.id}
          type="checkbox"
          multiple={false}
          {...register(props.name ?? '')}
          {...props}
          className="w-4 h-4 text-blue-600 accent-blue-500 rounded focus:ring-blue-600 ring-offset-gray-800 focus:ring-2 bg-gray-700 border-gray-600"
        />
        {label && (
          <div className="-mb-2">
            <Label
              htmlFor={props.id ?? ''}
              required={props.required}
              text={label}
            />
          </div>
        )}
      </div>
      <ErrorMessage
        name={props.name ?? ''}
        errors={formState.errors}
        render={({ message }) => (
          <p className="mt-2 text-xs text-red-500">{message}</p>
        )}
      />
    </div>
  )
}

export default Checkbox
