import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/search/result')({
  component: SearchResultPage,
})

function SearchResultPage() {
  return <div>Search Results (TODO: implement)</div>
}
