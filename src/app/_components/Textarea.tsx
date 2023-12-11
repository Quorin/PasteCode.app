'use client'

import { ErrorMessage } from '@hookform/error-message'
import { cx } from 'class-variance-authority'
import { TextareaHTMLAttributes } from 'react'
import { useFormContext } from 'react-hook-form'
import Label from './Label'

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
}

const Textarea = ({ label, ...props }: Props) => {
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
      <textarea
        id={props.id}
        placeholder={props.placeholder}
        required={props.required}
        {...register(props.name ?? '')}
        {...props}
        className={cx(
          'block min-h-[30vh] max-h-[50vh] p-2.5 w-full text-sm rounded-lg border bg-zinc-700 border-zinc-600 placeholder-zinc-500 text-white focus:ring-blue-500 focus:border-blue-500 focus:outline-none',
          props.className,
        )}
      ></textarea>
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

export default Textarea
