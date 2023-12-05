import { Option } from '../components/Select'
import { capitalize } from './strings'
import { bundledLanguages } from 'shikiji/langs'

export const defaultLanguage = 'text'

export const isValidLanguage = (lang: string): boolean =>
  lang === defaultLanguage || languages.includes(lang)

export const languages = Object.keys(bundledLanguages).sort()

export const languageOptions: Option[] = [
  { value: '(Text)', key: defaultLanguage },
].concat(
  languages.map((lang) => ({
    value: capitalize(lang),
    key: lang,
  })),
)
