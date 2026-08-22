'use client'

import { LegalPage } from '@/components/legal-page'
import { useT } from '@/components/language-context'

export default function DatenschutzPage() {
  const t = useT()
  return <LegalPage title={t.legal.datenschutzTitle} sections={t.legal.datenschutz} />
}
