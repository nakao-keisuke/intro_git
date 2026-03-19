import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_content/faq/girls')({
  component: FaqGirlsPage,
})

function FaqGirlsPage() {
  return <div>Girls FAQ (TODO: implement)</div>
}
