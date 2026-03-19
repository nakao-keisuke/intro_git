import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/column')({
  component: ColumnPage,
})

function ColumnPage() {
  return <div>Column List (TODO: implement)</div>
}
