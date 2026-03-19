import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_content/tos')({
  component: TosPage,
})

function TosPage() {
  return <div>Terms of Service (TODO: implement)</div>
}
