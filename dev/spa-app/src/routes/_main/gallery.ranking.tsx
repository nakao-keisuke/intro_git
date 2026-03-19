import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/gallery/ranking')({
  component: GalleryRankingPage,
})

function GalleryRankingPage() {
  return <div>Gallery Ranking (TODO: implement)</div>
}
