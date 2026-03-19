import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/fleamarket')({
  component: FleamarketPage,
})

function FleamarketPage() {
  return <div>Flea Market (TODO: implement)</div>
}
