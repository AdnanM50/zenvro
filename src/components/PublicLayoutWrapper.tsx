"use client"

import { usePathname } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/Footer"

export default function PublicLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const hideLayout = pathname.startsWith("/admin") || pathname.startsWith("/user-dashboard")

  if (hideLayout) return <>{children}</>

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}
