import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/gallery')({
  component: GalleryPage,
})

function GalleryPage() {
  return <div>Gallery (TODO: implement)</div>
}
