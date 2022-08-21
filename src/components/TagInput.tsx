import { cx } from 'class-variance-authority'
import { InputHTMLAttributes, KeyboardEvent } from 'react'
import Label from './Label'

import { ErrorMessage } from '@hookform/error-message'
import { useFormContext } from 'react-hook-form'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  arrayProp: string
  maxlength?: number
}

const TagInput = ({
  label,
  arrayProp,
  maxlength,
  defaultValue,
  ...props
}: Props) => {
  const {
    register,
    getValues,
    formState,
    setValue,
    resetField,
    watch,
    trigger,
  } = useFormContext()

  const tags = watch('tags') as string[] | undefined

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const value = getValues('tag')

    if ([' ', 'enter', ','].includes(e.key.toLowerCase())) {
      e.preventDefault()

      if (value && tags !== undefined && !tags.includes(value.toLowerCase())) {
        setValue('tags', [...tags, value.toLowerCase()])
        resetField('tag')
        trigger('tags')
      }
    }
  }

  const removeTag = (tag: string) => {
    if (tags && tags.includes(tag)) {
      setValue(
        'tags',
        tags.filter((t) => t !== tag),
      )
      trigger('tags')
    }
  }

  return (
    <div>
      {label && (
        <Label
          htmlFor={props.id ?? ''}
          required={props.required}
          text={label}
        />
      )}
      {tags && tags.length > 0 && (
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
        id={props.id}
        type="text"
        placeholder={props.placeholder}
        required={props.required}
        onKeyDownCapture={(e) => handleKey(e)}
        maxLength={maxlength}
        {...register(props.name ?? '')}
        {...props}
        className={cx(
          'border text-sm rounded-lg block w-full p-2.5 bg-zinc-700 border-zinc-600 placeholder-zinc-500 text-white focus:ring-blue-500 focus:border-blue-500 focus:outline-none',
          props.className,
        )}
      ></input>
      <ErrorMessage
        name={arrayProp ?? ''}
        errors={formState.errors}
        render={({ message }) => (
          <p className="mt-2 text-xs text-red-500">{message}</p>
        )}
      />
    </div>
  )
}

export default TagInput
