import { bundledLanguages } from 'shikiji/langs'

export const defaultLanguage = 'text'

export const isValidLanguage = (lang: string): boolean =>
  lang === defaultLanguage || languages.includes(lang)

export const languages = Object.keys(bundledLanguages).sort()

export const languageOptions: string[] = [defaultLanguage].concat(languages)
