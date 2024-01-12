import PasteList from '@/app/(root)/profile/paste-list'
import PageTitle from '@/components/ui/page-title'

const ProfilePage = () => {
  return (
    <div className="flex flex-col">
      <PageTitle title="Your content" />
      <PasteList />
    </div>
  )
}

export default ProfilePage
