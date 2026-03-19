import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/purchase/payment-success')({
  component: PaymentSuccessPage,
})

function PaymentSuccessPage() {
  return <div>Payment Success (TODO: implement)</div>
}
