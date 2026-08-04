import type { Metadata } from 'next'
import { AffiliatePage } from '@/components/affiliate-page'

const title = 'Affiliate-Partnerprogramm'
const description =
  'Mindestens 660,00 € Provision pro erfolgreicher Vermittlung. Je nach Projektart, Umfang und Auftragswert ist eine deutlich höhere Vergütung möglich.'

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/affiliate',
  },
  openGraph: {
    title: `${title} | Issa Hareb`,
    description,
    url: '/affiliate',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: `${title} | Issa Hareb`,
    description,
  },
}

export default function AffiliateRoute() {
  return <AffiliatePage />
}
