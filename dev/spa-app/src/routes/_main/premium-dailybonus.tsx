import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/premium-dailybonus')({
  component: PremiumDailyBonusPage,
})

function PremiumDailyBonusPage() {
  return <div>Premium Daily Bonus (TODO: implement)</div>
}
