import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_content/sitemap')({
  component: SitemapPage,
})

function SitemapPage() {
  return <div>Sitemap (TODO: implement)</div>
}
