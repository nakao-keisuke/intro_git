import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/outgoing/$callType/$userId')({
  component: OutgoingCallPage,
})

function OutgoingCallPage() {
  return <div>Outgoing Call (TODO: implement)</div>
}
