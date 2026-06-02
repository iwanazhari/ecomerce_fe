export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'

export default function CatchAllOrderRedirect({ params }: { params: { slug: string[] } }) {
  redirect('/admin/orders')
}
