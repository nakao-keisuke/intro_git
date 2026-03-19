import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_content/faq/benefits')({
  component: FaqBenefitsPage,
})

function FaqBenefitsPage() {
  return <div>Benefits FAQ (TODO: implement)</div>
}
