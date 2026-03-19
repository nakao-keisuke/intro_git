import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/lp/review')({
  component: LpReviewPage,
})

function LpReviewPage() {
  return <div>Review LP (TODO: implement)</div>
}
