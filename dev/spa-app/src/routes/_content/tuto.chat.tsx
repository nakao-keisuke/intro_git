import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_content/tuto/chat')({
  component: TutoChatPage,
})

function TutoChatPage() {
  return <div>Chat Tutorial (TODO: implement)</div>
}
