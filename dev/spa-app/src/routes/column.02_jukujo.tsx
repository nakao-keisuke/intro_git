import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/column/02_jukujo')({
  component: Column02JukujoPage,
})

function Column02JukujoPage() {
  return <div>Column: Jukujo (TODO: implement)</div>
}
