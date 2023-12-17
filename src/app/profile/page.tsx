import PageTitle from '../../components/ui/page-title'
import PasteList from './paste-list'

const ProfilePage = () => {
  return (
    <div className="flex flex-col">
      <PageTitle title="Your content" />
      <PasteList />
    </div>
  )
}

export default ProfilePage
