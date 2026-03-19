import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/phone-verification')({
  component: PhoneVerificationPage,
})

function PhoneVerificationPage() {
  return <div>Phone Verification (TODO: implement)</div>
}
