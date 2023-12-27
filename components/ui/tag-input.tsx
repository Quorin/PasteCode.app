'use client'

import * as React from 'react'

import { cx } from 'class-variance-authority'
import { InputHTMLAttributes, KeyboardEvent } from 'react'
import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { TagRemoveAction, Tag, TagList } from '@/components/ui/tag'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  arrayProp: string
  maxlength?: number
}

const TagInput = React.forwardRef<HTMLInputElement, Props>(
  ({ label, arrayProp, maxlength, defaultValue, ...props }, ref) => {
    const { register, getValues, setValue, resetField, watch, trigger } =
      useFormContext()

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
      <div className=" flex flex-col gap-3">
        {tags && tags.length > 0 && (
          <TagList>
            {tags.map((tag) => (
              <Tag key={tag} value={tag}>
                <TagRemoveAction onClick={() => removeTag(tag)} />
              </Tag>
            ))}
          </TagList>
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
