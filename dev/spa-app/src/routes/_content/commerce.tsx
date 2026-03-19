import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_content/commerce')({
  component: CommercePage,
})

function CommercePage() {
  return <div>Commercial Law (TODO: implement)</div>
}
