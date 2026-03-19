import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/column/01_amateur')({
  component: Column01AmateurPage,
})

function Column01AmateurPage() {
  return <div>Column: Amateur (TODO: implement)</div>
}
