import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/callhistory-list')({
  component: CallHistoryListPage,
})

function CallHistoryListPage() {
  return <div>Call History (TODO: implement)</div>
}
