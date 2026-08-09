"use client"

import { usePathname } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/Footer"
import PageTransition from "@/components/PageTransition"
import { isPublicRoute } from "@/lib/routes"

export default function PublicLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isPublic = isPublicRoute(pathname)

  if (!isPublic) return <>{children}</>

  return (
    <>
      <Navbar />
      <PageTransition>{children}</PageTransition>
      <Footer />
    </>
  )
}
