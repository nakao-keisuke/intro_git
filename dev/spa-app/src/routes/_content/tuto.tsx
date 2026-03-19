import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_content/tuto')({
  component: TutoPage,
})

function TutoPage() {
  return <div>Tutorial (TODO: implement)</div>
}
