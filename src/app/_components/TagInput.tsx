'use client'

import * as React from 'react'

import { cx } from 'class-variance-authority'
import { InputHTMLAttributes, KeyboardEvent } from 'react'
import { useFormContext } from 'react-hook-form'
import { Input } from '../../components/ui/input'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  arrayProp: string
  maxlength?: number
}

const TagInput = React.forwardRef<HTMLInputElement, Props>(
  ({ label, arrayProp, maxlength, defaultValue, ...props }, ref) => {
    const {
      register,
      getValues,
      formState,
      setValue,
      resetField,
      watch,
      trigger,
    } = useFormContext()

    const tags = watch(arrayProp) as string[] | undefined

    const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
      const value = getValues('tag')

      if ([' ', 'enter', ','].includes(e.key.toLowerCase())) {
        e.preventDefault()

        if (
          value &&
          tags !== undefined &&
          !tags.includes(value.toLowerCase())
        ) {
          setValue(arrayProp, [...tags, value.toLowerCase()])
          resetField('tag')
          trigger(arrayProp)
        }
      }
    }

    const removeTag = (tag: string) => {
      if (tags && tags.includes(tag)) {
        setValue(
          arrayProp,
          tags.filter((t) => t !== tag),
        )
        trigger(arrayProp)
      }
    }

    return (
      <div>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-secondary text-xs px-2.5 py-1.5 rounded-lg"
              >
                {tag}
                <span
                  onClick={() => removeTag(tag)}
                  className="inline-flex items-center px-1.5 ml-1 text-sm text-red-400 rounded-sm cursor-pointer hover:text-zinc-100 hover:bg-red-500"
                >
                  x
                </span>
              </span>
            ))}
          </div>
        )}
        <Input
          id={props.id}
          type="text"
          placeholder={props.placeholder}
          required={props.required}
          onKeyDownCapture={(e) => handleKey(e)}
          maxLength={maxlength}
          {...register(props.name ?? '')}
          {...props}
          className={cx(props.className)}
          ref={ref}
        />
      </div>
    )
  },
)

TagInput.displayName = 'TagInput'

export { TagInput }
