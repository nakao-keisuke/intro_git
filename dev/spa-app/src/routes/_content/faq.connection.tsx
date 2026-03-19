import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_content/faq/connection')({
  component: FaqConnectionPage,
})

function FaqConnectionPage() {
  return <div>Connection FAQ (TODO: implement)</div>
}
