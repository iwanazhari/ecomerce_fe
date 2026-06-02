export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
export default function OrderDetailRedirect() { redirect('/admin/orders') }
