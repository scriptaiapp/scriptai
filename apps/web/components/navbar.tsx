import React from 'react'
import { navItem } from '@repo/ui';
import Image from "next/image"
import logo from "@/public/dark-logo.png"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const Navbar = () => {
  return (
    <header className="border-b border-slate-200 dark:border-slate-700">
      <div className="container flex items-center justify-between py-4">
        <div className="flex items-center">
          <Image src={logo} alt="Script AI" width={32} height={32} />
          <span className="text-xl font-bold">Script AI</span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          {navItem.map((option, key) => {
            return (
              <Link key={key}
                href={option.href}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100">
                {option.name}
              </Link>
            )
          })}
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="outline" className="hidden sm:inline-flex">
              Log In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white">Sign Up Free</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Navbar