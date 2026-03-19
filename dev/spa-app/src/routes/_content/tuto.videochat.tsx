import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_content/tuto/videochat')({
  component: TutoVideochatPage,
})

function TutoVideochatPage() {
  return <div>Video Chat Tutorial (TODO: implement)</div>
}
