import FormTitle from '@/components/ui/form-title'
import PasteForm from '@/components/forms/paste-form'

export default function Home() {
  return (
    <div>
      <FormTitle title="Create new paste" />
      <PasteForm />
    </div>
  )
}
