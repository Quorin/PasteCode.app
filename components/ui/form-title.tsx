type Props = {
  title: string
}

const FormTitle = ({ title }: Props) => {
  return <h2 className="text-3xl text-primary mb-10 font-bold">{title}</h2>
}

export default FormTitle
