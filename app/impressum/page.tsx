'use client'

import { LegalPage } from '@/components/legal-page'
import { useT } from '@/components/language-context'

export default function ImpressumPage() {
  const t = useT()
  return <LegalPage title={t.legal.impressumTitle} sections={t.legal.impressum} />
}
