import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/block')({
  component: BlockPage,
})

function BlockPage() {
  return <div>Block List (TODO: implement)</div>
}
