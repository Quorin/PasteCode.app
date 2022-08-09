import { cva } from 'class-variance-authority'

type Props = {
  text: string
  htmlFor: string
  required?: boolean
}

const labelText = cva(['block mb-2 text-sm font-medium text-zinc-300'], {
  variants: {
    required: {
      true: ['after:content-["*"] after:ml-0.5 after:text-red-500'],
    },
  },
})

const Label = ({ text, htmlFor, required }: Props) => {
  return (
    <label htmlFor={htmlFor} className={labelText({ required })}>
      {text}
    </label>
  )
}

export default Label
