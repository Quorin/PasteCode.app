import { ErrorMessage } from '@hookform/error-message'
import { cx } from 'class-variance-authority'
import { InputHTMLAttributes } from 'react'
import { useFormContext } from 'react-hook-form'
import Label from './Label'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
}

const Input = ({ label, ...props }: Props) => {
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
      <input
        id={props.id}
        type={props.type}
        placeholder={props.placeholder}
        required={props.required}
        {...register(props.name ?? '')}
        {...props}
        className={cx(
          'border text-sm rounded-lg block w-full p-2.5 bg-zinc-700 border-zinc-600 placeholder-zinc-500 text-white focus:ring-blue-500 focus:border-blue-500 focus:outline-none',
          props.className,
        )}
      ></input>
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

export default Input
