import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/column/05_nurse')({
  component: Column05NursePage,
})

function Column05NursePage() {
  return <div>Column: Nurse (TODO: implement)</div>
}
