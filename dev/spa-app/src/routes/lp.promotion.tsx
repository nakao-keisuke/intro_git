import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/lp/promotion')({
  component: LpPromotionPage,
})

function LpPromotionPage() {
  return <div>Promotion (TODO: implement)</div>
}
