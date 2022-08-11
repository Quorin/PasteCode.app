import { ErrorMessage, FieldProps } from 'formik'
import Label from './Label'

type Props = FieldProps & {
  label?: string
  placeholder?: string
  required?: boolean
  type?: string
}

const Input = ({
  label,
  required,
  field,
  placeholder,
  type = 'text',
}: Props) => {
  return (
    <div>
      {label && <Label htmlFor={field.name} required={required} text={label} />}
      <input
        id={field.name}
        type={type}
        className="border text-sm rounded-lg block w-full p-2.5 bg-zinc-700 border-zinc-600 placeholder-zinc-500 text-white focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
        placeholder={placeholder ?? ''}
        required={required}
        {...field}
      ></input>
      <p className="mt-2 text-xs text-red-500">
        <ErrorMessage name={field.name} />
      </p>
    </div>
  )
}

export default Input
