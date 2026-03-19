import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/video-list')({
  component: VideoListPage,
})

function VideoListPage() {
  return <div>Video List (TODO: implement)</div>
}
