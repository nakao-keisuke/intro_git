import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/daily-bonus')({
  component: DailyBonusPage,
})

function DailyBonusPage() {
  return <div>Daily Bonus (TODO: implement)</div>
}
