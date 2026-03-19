import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_content/faq/account')({
  component: FaqAccountPage,
})

function FaqAccountPage() {
  return <div>Account FAQ (TODO: implement)</div>
}
