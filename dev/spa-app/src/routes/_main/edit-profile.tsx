import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/edit-profile')({
  component: EditProfilePage,
})

function EditProfilePage() {
  return <div>Edit Profile (TODO: implement)</div>
}
