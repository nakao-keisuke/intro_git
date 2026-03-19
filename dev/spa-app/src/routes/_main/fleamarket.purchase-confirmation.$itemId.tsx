import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/fleamarket/purchase-confirmation/$itemId')({
  component: FleamarketPurchaseConfirmationPage,
})

function FleamarketPurchaseConfirmationPage() {
  return <div>Purchase Confirmation (TODO: implement)</div>
}
