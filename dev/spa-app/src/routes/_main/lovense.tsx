import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/lovense')({
  component: LovensePage,
})

function LovensePage() {
  return <div>Lovense (TODO: implement)</div>
}
