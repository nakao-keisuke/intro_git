import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/quickcharge')({
  component: QuickChargePage,
})

function QuickChargePage() {
  return <div>Quick Charge (TODO: implement)</div>
}
