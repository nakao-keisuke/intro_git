import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/lp/flea-market')({
  component: LpFleaMarketPage,
})

function LpFleaMarketPage() {
  return <div>Flea Market LP (TODO: implement)</div>
}
