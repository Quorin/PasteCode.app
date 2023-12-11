'use client'

import { ErrorMessage } from '@hookform/error-message'
import { cx } from 'class-variance-authority'
import { SelectHTMLAttributes } from 'react'
import { useFormContext } from 'react-hook-form'
import Label from './Label'

export type Option = {
  key: string
  value: string
}

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  options: Option[]
}

const Select = ({ label, options, ...props }: Props) => {
  const { register, formState } = useFormContext()
  return (
    <div>
      {label && (
        <Label
          htmlFor={props.id ?? ''}
          required={props.required}
          text={label}
        />
      )}
      <select
        id={props.id}
        {...register(props.name ?? '')}
        {...props}
        className={cx(
          'border text-sm rounded-lg block w-full p-2.5 bg-zinc-700 border-zinc-600 placeholder-zinc-500 text-white focus:ring-blue-500 focus:border-blue-500 focus:outline-none',
          props.className,
        )}
      >
        {options.map((o) => (
          <option key={o.key} value={o.key}>
            {o.value}
          </option>
        ))}
      </select>
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

export default Select
