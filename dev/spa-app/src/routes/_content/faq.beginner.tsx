import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_content/faq/beginner')({
  component: FaqBeginnerPage,
})

function FaqBeginnerPage() {
  return <div>Beginner FAQ (TODO: implement)</div>
}
