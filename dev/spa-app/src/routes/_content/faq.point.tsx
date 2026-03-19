import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_content/faq/point')({
  component: FaqPointPage,
})

function FaqPointPage() {
  return <div>Points FAQ (TODO: implement)</div>
}
