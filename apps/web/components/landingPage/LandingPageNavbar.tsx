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

const Logo = () => (
  <Link
    href="#"
    className="flex items-center space-x-2 px-2 py-1 text-sm font-medium text-black dark:text-white"
  >
    <Image src={logo} alt="Logo" width={30} height={30} />
    {/* <span>Script AI</span> */}
  </Link>
)

const LandingPageNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="relative w-full">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <Logo />
          <NavItems items={navItem} />
          <div className="flex items-center gap-4">
            <NavbarButton variant="dark">Sign Up Free</NavbarButton>
          </div>
        </NavBody>

        {/* Mobile Navigation */}
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
    </div>
  )
}

export default LandingPageNavbar
