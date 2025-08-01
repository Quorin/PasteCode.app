import { z } from 'zod'
import { isValidLanguage } from '@/utils/lang'

export const expirationSchema = z.enum([
  'same',
  'never',
  'year',
  'month',
  'week',
  'day',
  'hour',
  '10m',
])

export type Expiration = z.infer<typeof expirationSchema>

/**
 * Settings
 */

export const removeAccountSchema = z.object({
  password: z.string(),
})

export const changeEmailSchema = z
  .object({
    email: z.email('Email is not valid'),
    confirmEmail: z.email('Email is not valid'),
  })
  .refine((data) => data.email === data.confirmEmail, {
    message: 'Emails do not match',
    path: ['confirmEmail'],
  })

export const changePasswordSchema = z
  .object({
    currentPassword: z.string(),
    password: z
      .string()
      .regex(
        new RegExp(
          '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})',
        ),
        'Password must contain at least one lowercase letter, one uppercase letter, one number and one special character',
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

/**
 * Auth
 */

export const loginSchema = z.object({
  email: z.email('Invalid email'),
  password: z.string(),
})

/**
 * User
 */

export const resetPasswordConfirmationSchema = z
  .object({
    id: z.string(),
    code: z.string(),
    password: z
      .string()
      .regex(
        new RegExp(
          '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})',
        ),
        'Password must contain at least one lowercase letter, one uppercase letter, one number and one special character',
      ),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const resetPasswordSchema = z.object({
  email: z.email('Email is not valid'),
})

export const registerSchema = z
  .object({
    email: z.email('Email is not valid'),
    password: z
      .string()
      .regex(
        new RegExp(
          '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})',
        ),
        'Password must contain at least one lowercase letter, one uppercase letter, one number and one special character',
      ),

    confirmPassword: z.string(),
    agree: z
      .boolean()
      .refine((agree) => agree, 'You must agree to the terms and conditions'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const resendConfirmationCodeSchema = z.object({
  email: z.email('Email is not valid'),
})

/**
 * Paste
 */

export const getPasteSchema = z.object({
  id: z.string(),
  password: z.string().nullable(),
})

export const removePasteSchema = z.object({
  id: z.string(),
  password: z.string().optional(),
})

export const createPasteSchema = z.object({
  title: z.string().max(150, 'Title is too long'),
  content: z.string().max(10000000, 'Content is too long'),
  style: z.string().refine(isValidLanguage, 'Invalid style'),
  description: z.string().max(300, 'Description is too long'),
  tags: z
    .array(z.string().max(15, 'Too long name'))
    .max(20, 'Too many tags')
    .optional(),
  expiration: z
    .enum(['never', 'year', 'month', 'week', 'day', 'hour', '10m'])
    .default('never'),
  password: z.string().optional(),
})

export const updatePasteSchema = z.object({
  id: z.string(),
  title: z.string().max(150, 'Title is too long'),
  content: z.string().max(10000000, 'Content is too long'),
  style: z.string().refine(isValidLanguage, 'Invalid style'),
  description: z.string().max(300, 'Description is too long'),
  tags: z
    .array(z.string().max(15, 'Too long name'))
    .max(20, 'Too many tags')
    .optional(),
  expiration: expirationSchema.default('never'),
  currentPassword: z.string().optional(),
  password: z.string().optional(),
})

export const pastesSortBySchema = z.enum([
  'createdAt.asc',
  'createdAt.desc',
  'expiresAt.asc',
  'expiresAt.desc',
  'title.asc',
  'title.desc',
])

export type PastesSortBy = z.infer<typeof pastesSortBySchema>
