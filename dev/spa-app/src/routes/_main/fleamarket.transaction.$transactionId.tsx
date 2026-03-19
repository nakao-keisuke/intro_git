import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/fleamarket/transaction/$transactionId')({
  component: FleamarketTransactionPage,
})

function FleamarketTransactionPage() {
  return <div>Transaction Detail (TODO: implement)</div>
}
