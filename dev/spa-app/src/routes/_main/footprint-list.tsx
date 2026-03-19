import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/footprint-list')({
  component: FootprintListPage,
})

function FootprintListPage() {
  return <div>Footprints (TODO: implement)</div>
}
