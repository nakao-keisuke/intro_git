import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/search')({
  component: SearchPage,
})

function SearchPage() {
  return <div>Search (TODO: implement)</div>
}
