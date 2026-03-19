import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/purchase')({
  component: PurchasePage,
})

function PurchasePage() {
  return <div>Purchase (TODO: implement)</div>
}
