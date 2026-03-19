import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/fleamarket/todos')({
  component: FleamarketTodosPage,
})

function FleamarketTodosPage() {
  return <div>Flea Market Todos (TODO: implement)</div>
}
