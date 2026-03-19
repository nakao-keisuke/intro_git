import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/fleamarket/item/$itemId')({
  component: FleamarketItemPage,
})

function FleamarketItemPage() {
  return <div>Item Detail (TODO: implement)</div>
}
