import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/message/$userId')({
  component: MessagePage,
})

function MessagePage() {
  return <div>Message Detail (TODO: implement)</div>
}
