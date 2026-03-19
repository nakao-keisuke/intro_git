import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/column/10_megane')({
  component: Column10MeganePage,
})

function Column10MeganePage() {
  return <div>Column: Megane (TODO: implement)</div>
}
