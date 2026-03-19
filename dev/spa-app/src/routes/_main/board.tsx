import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/board')({
  component: BoardPage,
})

function BoardPage() {
  return <div>Board (TODO: implement)</div>
}
