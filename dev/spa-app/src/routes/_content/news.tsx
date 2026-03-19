import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_content/news')({
  component: NewsPage,
})

function NewsPage() {
  return <div>News (TODO: implement)</div>
}
