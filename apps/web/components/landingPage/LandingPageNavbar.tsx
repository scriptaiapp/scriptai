"use client"

import React, { useState } from "react"
import { navItem } from "@repo/ui"
import Image from "next/image"
import Link from "next/link"
import logo from "@/public/dark-logo.png"
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import EarlyAccessModal from "./EarlyAccessModal"

interface LandingPageNavbarProps {
  isEarlyAccessModalOpen: boolean
  setIsEarlyAccessModalOpen: (open: boolean) => void
}

const Logo = () => (
  <Link
    href="#"
    className="flex items-center space-x-2 px-2 py-1 text-sm font-medium text-black dark:text-white"
  >
    <Image src={logo} alt="Logo" width={30} height={30} />
  </Link>
)

const LandingPageNavbar: React.FC<LandingPageNavbarProps> = ({ isEarlyAccessModalOpen, setIsEarlyAccessModalOpen }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setMessage("Thank you! You're on the waitlist.")
        setEmail("")
      } else {
        const data = await response.json()
        setMessage(data.error || "Error: Please try again.")
      }
    } catch (error) {
      setMessage("Error: Something went wrong.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative w-full">
      <Navbar>
        <NavBody>
          <Link
            href="/"
            className="relative z-20 flex items-center px-2 py-1 text-sm font-normal text-black"
          >
            <Image src={logo} alt="Logo" width={30} height={30} />
            <span className="font-bold text-xl text-black dark:text-white">Script AI</span>
          </Link>
          <NavItems items={navItem} />
          {/* <div className="flex items-center gap-4">
            <ShimmerButton className="text-sm h-9" onClick={() => setIsEarlyAccessModalOpen(!isEarlyAccessModalOpen)}>
              Get Early Access
            </ShimmerButton>
          </div> */}
          <Link href={"/login"} className="flex items-center gap-4">
            <ShimmerButton className="text-sm h-9">
              Get Started
            </ShimmerButton>
          </Link>
        </NavBody>

        <MobileNav>
          <MobileNavHeader>
            <Logo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItem.map((item, idx) => (
              <Link
                key={`mobile-link-${idx}`}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-neutral-600 dark:text-neutral-300"
              >
                {item.name}
              </Link>
            ))}
            <div className="flex flex-col gap-4 mt-4">
              <NavbarButton
                onClick={() => setIsMobileMenuOpen(false)}
                variant="primary"
                className="w-full"
              >
                Login
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>


      <EarlyAccessModal
        isOpen={isEarlyAccessModalOpen}
        onOpenChange={setIsEarlyAccessModalOpen}
      />
    </div>
  )
}

export default LandingPageNavbar