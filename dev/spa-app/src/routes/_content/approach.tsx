import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_content/approach')({
  component: ApproachPage,
})

function ApproachPage() {
  return <div>Call Troubleshooting (TODO: implement)</div>
}
