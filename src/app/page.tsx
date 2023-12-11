import FormTitle from './_components/FormTitle'
import PasteForm from './_components/forms/PasteForm'

export default async function Home() {
  return (
    <div>
      <FormTitle title="Create a new paste" />
      <PasteForm />
    </div>
  )
}
