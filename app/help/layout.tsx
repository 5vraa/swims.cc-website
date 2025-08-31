import { SiteHeader } from "@/components/site-header"

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SiteHeader />
      {children}
    </>
  )
}
