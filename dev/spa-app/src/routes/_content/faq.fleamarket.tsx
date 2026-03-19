import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_content/faq/fleamarket')({
  component: FaqFleamarketPage,
})

function FaqFleamarketPage() {
  return <div>Flea Market FAQ (TODO: implement)</div>
}
