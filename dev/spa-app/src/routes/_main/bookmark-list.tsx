import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/bookmark-list')({
  component: BookmarkListPage,
})

function BookmarkListPage() {
  return <div>Bookmark List (TODO: implement)</div>
}
