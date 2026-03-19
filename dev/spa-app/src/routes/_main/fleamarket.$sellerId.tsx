import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/fleamarket/$sellerId')({
  component: FleamarketSellerPage,
})

function FleamarketSellerPage() {
  return <div>Seller Detail (TODO: implement)</div>
}
