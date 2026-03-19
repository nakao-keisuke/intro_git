import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/mission/onboarding/add-line-friend')({
  component: MissionAddLineFriendPage,
})

function MissionAddLineFriendPage() {
  return <div>LINE Friend Mission (TODO: implement)</div>
}
