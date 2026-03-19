import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/callrequest')({
  component: CallRequestPage,
})

function CallRequestPage() {
  return <div>Call Request (TODO: implement)</div>
}
