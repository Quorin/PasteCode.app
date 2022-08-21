type Props = {
  title: string
}

const FormTitle = ({ title }: Props) => {
  return <h2 className="text-3xl text-zinc-200 mb-10 font-semibold">{title}</h2>
}

export default FormTitle
