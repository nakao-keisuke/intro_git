import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/favorite-list')({
  component: FavoriteListPage,
})

function FavoriteListPage() {
  return <div>Favorites (TODO: implement)</div>
}
