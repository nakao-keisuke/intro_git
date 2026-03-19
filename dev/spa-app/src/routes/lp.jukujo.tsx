import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/lp/jukujo')({
  component: LpJukujoPage,
})

function LpJukujoPage() {
  return <div>Mature LP (TODO: implement)</div>
}
