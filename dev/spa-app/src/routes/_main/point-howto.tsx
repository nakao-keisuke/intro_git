import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/point-howto')({
  component: PointHowtoPage,
})

function PointHowtoPage() {
  return <div>Point How-to (TODO: implement)</div>
}
