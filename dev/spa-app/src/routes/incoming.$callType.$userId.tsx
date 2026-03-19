import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/incoming/$callType/$userId')({
  component: IncomingCallPage,
})

function IncomingCallPage() {
  return <div>Incoming Call (TODO: implement)</div>
}
