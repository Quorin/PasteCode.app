type Props = {
  title: string
}

const PageTitle = ({ title }: Props) => {
  return (
    <h2 className="text-3xl text-primary pb-10 font-semibold self-center">
      {title}
    </h2>
  )
}

export default PageTitle
