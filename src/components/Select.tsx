import { ErrorMessage, FieldProps } from 'formik'
import Label from './Label'

export type Option = {
  key: string
  value: string
}

type Props = FieldProps & {
  label?: string
  required?: boolean
  options: Option[]
}

const Select = ({ label, required, options, field }: Props) => {
  return (
    <div>
      {label && <Label htmlFor={field.name} required={required} text={label} />}
      <select
        id={field.name}
        className="border text-sm rounded-lg block w-full p-2.5 bg-zinc-700 border-zinc-600 placeholder-zinc-500 text-white focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
        {...field}
      >
        {options.map((o) => (
          <option key={o.key} value={o.key}>
            {o.value}
          </option>
        ))}
      </select>
      <p className="mt-2 text-xs text-red-500">
        <ErrorMessage name={field.name} />
      </p>
    </div>
  )
}

export default Select
