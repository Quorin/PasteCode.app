import { getBaseUrl } from '@/utils/url'
import { mailer } from './mailer'
import { env } from '@/env/server.mjs'

enum EmailType {
  ResetPassword,
  ConfirmAccount,
}

export const sendConfirmationEmail = async (
  email: string,
  id: string,
  code: string,
) => {
  await sendEmail({
    email,
    subject: getSubject(EmailType.ConfirmAccount),
    html: `<a href="${getBaseUrl()}/confirm-account?id=${id}&code=${code}">Click here to confirm your account.</a>`,
  })
}

export const sendResetPasswordEmail = async (
  email: string,
  id: string,
  code: string,
) => {
  await sendEmail({
    email,
    subject: getSubject(EmailType.ResetPassword),
    html: `<a href="${getBaseUrl()}/reset-password/confirm?id=${id}&code=${code}">Click here to reset your password.</a>`,
  })
}

const emailPrefix = '[PasteCode]'

const getSubject = (emailType: EmailType): string => {
  switch (emailType) {
    case EmailType.ResetPassword:
      return `${emailPrefix} Reset password`
    case EmailType.ConfirmAccount:
      return `${emailPrefix} Confirm account`
  }
}

const sendEmail = async ({
  email,
  subject,
  html,
}: {
  email: string
  subject: string
  html: string
}) => {
  await mailer.sendMail({
    from: env.FROM_EMAIL,
    replyTo: {
      address: env.REPLY_TO_EMAIL,
      name: env.REPLY_TO_NAME,
    },
    to: email,
    subject,
    html,
  })
}
