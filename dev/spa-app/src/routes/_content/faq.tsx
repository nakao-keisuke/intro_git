import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_content/faq')({
  component: FaqPage,
})

function FaqPage() {
  return <div>FAQ (TODO: implement)</div>
}
