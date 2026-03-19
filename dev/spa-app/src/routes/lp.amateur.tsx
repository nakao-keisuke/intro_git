import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/lp/amateur')({
  component: LpAmateurPage,
})

function LpAmateurPage() {
  return <div>Amateur LP (TODO: implement)</div>
}
