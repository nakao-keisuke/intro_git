import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/lp/transition')({
  component: LpTransitionPage,
})

function LpTransitionPage() {
  return <div>Transition Page (TODO: implement)</div>
}
