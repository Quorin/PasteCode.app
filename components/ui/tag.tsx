'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

const TagList = ({
  ref,
  children,
  className,
  ...props
}: React.ComponentPropsWithRef<'div'>) => (
  <div ref={ref} className={cn('flex flex-wrap gap-2', className)} {...props}>
    {children}
  </div>
)

TagList.displayName = 'TagList'

type TagProps = React.HTMLAttributes<HTMLSpanElement> & {
  value: string
}

const Tag = ({
  ref,
  children,
  className,
  value,
  ...props
}: TagProps & React.ComponentPropsWithRef<'span'>) => (
  <span
    ref={ref}
    className={cn('bg-secondary text-xs px-2.5 py-1.5 rounded-lg', className)}
    {...props}
  >
    {value}
    {children}
  </span>
)

Tag.displayName = 'Tag'

const TagRemoveAction = ({
  ref,
  className,
  ...props
}: React.ComponentPropsWithRef<'span'>) => (
  <span
    ref={ref}
    className={cn(
      'inline-flex items-center text-xs px-1.5 ml-1 text-red-400 rounded-sm cursor-pointer hover:text-white hover:bg-red-500',
      className,
    )}
    {...props}
  >
    x
  </span>
)

TagRemoveAction.displayName = 'TagRemoveAction'

export { Tag, TagList, TagRemoveAction }
