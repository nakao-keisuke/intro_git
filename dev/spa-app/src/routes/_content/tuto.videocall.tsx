import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_content/tuto/videocall')({
  component: TutoVideocallPage,
})

function TutoVideocallPage() {
  return <div>Video Call Tutorial (TODO: implement)</div>
}
