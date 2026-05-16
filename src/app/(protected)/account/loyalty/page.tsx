'use client'

import { useLoyalty, useLoyaltyTransactions } from '@/hooks'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/utils'
import { Star } from 'lucide-react'

const tierColors: Record<string, string> = {
  BRONZE: 'default',
  SILVER: 'default',
  GOLD: 'warning',
  PLATINUM: 'primary',
}

const tierIcons: Record<string, string> = {
  BRONZE: '🥉',
  SILVER: '🥈',
  GOLD: '🥇',
  PLATINUM: '💎',
}

const nextTier: Record<string, string> = {
  BRONZE: 'SILVER (1000 pts)',
  SILVER: 'GOLD (5000 pts)',
  GOLD: 'PLATINUM (15000 pts)',
  PLATINUM: 'Max',
}

export default function LoyaltyPage() {
  const { data: loyalty, isLoading } = useLoyalty()
  const { data: transactions } = useLoyaltyTransactions({ limit: 10 })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-4">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!loyalty) {
    return <p className="mx-auto max-w-7xl text-foreground-muted">Tidak ada data loyalty</p>
  }

  const tierThresholds: Record<string, number> = {
    BRONZE: 1000,
    SILVER: 5000,
    GOLD: 15000,
    PLATINUM: 15000,
  }

  const progressPercent = Math.min((loyalty.points / tierThresholds[loyalty.tier]) * 100, 100)

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Loyalty Points</h1>

      {/* Points Card */}
      <div className="mt-8 rounded-xl border border-border/60 bg-surface p-6 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-indigo-600/10 text-3xl">
            {tierIcons[loyalty.tier]}
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-foreground">{loyalty.tier}</h2>
            <p className="text-sm text-foreground-muted">Tier Anda</p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-4xl font-extrabold text-indigo-600">{loyalty.points.toLocaleString()}</p>
          <p className="text-sm text-foreground-muted">Poin tersedia</p>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground-muted">Progress ke tier berikutnya</span>
            <span className="font-semibold text-indigo-600">{nextTier[loyalty.tier]}</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <p className="mt-4 text-xs text-foreground-subtle">
          Total poin seumur hidup: {loyalty.lifetimePoints.toLocaleString()}
        </p>
      </div>

      {/* Transactions */}
      {transactions?.length ? (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-extrabold tracking-tight text-foreground">Riwayat Transaksi</h2>
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-surface p-4 shadow-soft">
                <div className="flex items-center gap-3">
                  <Badge variant={tx.type === 'EARN' ? 'success' : tx.type === 'BURN' ? 'error' : 'default'} size="sm">
                    {tx.type}
                  </Badge>
                  <div>
                    <p className="text-sm font-bold text-foreground">{tx.description}</p>
                    <p className="text-xs text-foreground-muted">{formatDate(tx.createdAt)}</p>
                  </div>
                </div>
                <span className={`text-lg font-extrabold ${tx.type === 'EARN' ? 'text-indigo-600' : 'text-red-600'}`}>
                  {tx.type === 'EARN' ? '+' : '-'}{tx.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
