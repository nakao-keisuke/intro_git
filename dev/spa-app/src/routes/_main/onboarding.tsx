import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/onboarding')({
  component: OnboardingPage,
})

function OnboardingPage() {
  return <div>Onboarding Missions (TODO: implement)</div>
}
