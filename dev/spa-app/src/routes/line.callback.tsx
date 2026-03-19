import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/line/callback')({
  component: LineCallbackPage,
})

function LineCallbackPage() {
  return <div>LINE OAuth Callback (TODO: implement)</div>
}
