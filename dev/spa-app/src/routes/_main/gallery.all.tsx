import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/gallery/all')({
  component: GalleryAllPage,
})

function GalleryAllPage() {
  return <div>All Gallery Items (TODO: implement)</div>
}
