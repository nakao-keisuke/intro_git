import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/lp/free-points')({
  component: LpFreePointsPage,
})

function LpFreePointsPage() {
  return <div>Free Points LP (TODO: implement)</div>
}
