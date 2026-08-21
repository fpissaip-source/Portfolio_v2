import type { Metadata } from 'next'

/**
 * The customer-facing group.
 *
 * It exists as its own layout for one reason: everything Hareb Digital shows
 * a paying stranger has different obligations from everything the portfolio
 * shows a fellow engineer. The portfolio may be loud and heavy; this must be
 * quick and plain, and the two must not be able to leak into each other by
 * accident.
 *
 * Right now it is nested under the root layout, which is lean enough to
 * carry it — html, four font variables, the JSON-LD graph and the language
 * provider, no Lenis, no GSAP, no three.js. Once the customer domain exists,
 * the portfolio moves into a `(portfolio)` group of its own and a middleware
 * decides between them by hostname. Nothing written here changes at that
 * point, which is the whole point of putting it in a group now.
 *
 * `noindex` until then. The page is reachable at /start so it can be looked
 * at, and a page that is going to live somewhere else must not first collect
 * rankings under the portfolio's domain and then compete with itself.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function KundenLayout({ children }: { children: React.ReactNode }) {
  return <div className="hd bg-[#07070c] text-white">{children}</div>
}
