import React from 'react'
import Image from "next/image";
import logo from "@/public/dark-logo.png";
import { footerItems } from '@repo/ui';
import Link from 'next/link';
const Footer = () => {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 pt-8">
      <div className="container py-8 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center">
              <Image src={logo} alt="Script AI" width={55} height={55} />
              <span className="text-4xl font-bold">Script AI</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Personalized AI assistant for YouTubers, simplifying the content creation process.
            </p>
          </div>
          {(Object.keys(footerItems) as Array<keyof typeof footerItems>).map((value, key) => {
            const options = footerItems[value]
            return <div key={key}>
              <h3 className="font-semibold mb-4 text-slate-900 dark:text-slate-50">{value}</h3>
              <ul className="space-y-2 text-sm">
                {options.map((option, key) => {
                  return <li key={key}>
                    <Link href={option.href}
                      className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
                      {option.name}
                    </Link>
                  </li>
                })}
              </ul>
            </div>
          })}
        </div>
        <div className="border-t border-slate-200 dark:border-slate-700 mt-8 pt-8 text-center text-sm text-slate-600 dark:text-slate-400">
          &copy; {new Date().getFullYear()} Script AI. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer