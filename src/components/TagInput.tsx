import { ErrorMessage, FieldProps } from 'formik'
import { KeyboardEvent, useEffect, useState } from 'react'
import Label from './Label'

type Props = FieldProps<string> & {
  label?: string
  placeholder?: string
  required?: boolean
  arrayProp: string
  maxlength?: number
}

const TagInput = ({
  label,
  placeholder,
  required,
  field,
  form,
  arrayProp,
  maxlength,
}: Props) => {
  const [tags, setTags] = useState<string[]>(form.initialValues.tags ?? [])

  useEffect(() => {
    form.setFieldValue(arrayProp, tags)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tags])

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if ([' ', 'enter', ','].includes(e.key.toLowerCase())) {
      e.preventDefault()

      if (field.value && !tags.includes(field.value.toLowerCase())) {
        setTags((t) => [...t, field.value.toLowerCase()])

        field.value = ''
        e.currentTarget.value = ''

        field.onChange(e)
      }
    }
  }

  const removeTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags((t) => t.filter((t) => t !== tag))
    }
  }

  return (
    <div>
      {label && <Label htmlFor={field.name} required={required} text={label} />}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-zinc-600 text-white text-xs px-2.5 py-1.5 rounded-lg"
            >
              {tag}
              <span
                onClick={() => removeTag(tag)}
                className="inline-flex items-center px-1.5 ml-1 text-sm text-red-400 rounded-sm cursor-pointer hover:text-zinc-100 hover:bg-red-400"
              >
                x
              </span>
            </span>
          ))}
        </div>
      )}
      <input
        id={field.name}
        type="text"
        className="border text-sm rounded-lg block w-full p-2.5 bg-zinc-700 border-zinc-600 placeholder-zinc-500 text-white focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
        placeholder={placeholder ?? ''}
        required={required}
        onKeyDownCapture={(e) => handleKey(e)}
        maxLength={maxlength}
        {...field}
      ></input>
      <p className="mt-2 text-xs text-red-500">
        <ErrorMessage name={arrayProp} />
      </p>
    </div>
  )
}

export default TagInput
