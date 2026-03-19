import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_content/privacy')({
  component: PrivacyPage,
})

function PrivacyPage() {
  return <div>Privacy Policy (TODO: implement)</div>
}
