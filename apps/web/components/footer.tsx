import React from 'react';
import Image from "next/image";
import Link from 'next/link';
import logo from "@/public/dark-logo.png";
import { Github, Instagram, Linkedin, Twitter, Facebook } from 'lucide-react';
import { footerItems } from '@repo/ui';
import { Dock, DockIcon } from './magicui/Dock';


const socialLinks = [
  { name: 'Twitter', href: 'https://twitter.com/your-profile', icon: Twitter },
  { name: 'Instagram', href: 'https://instagram.com/your-profile', icon: Instagram },
  { name: 'LinkedIn', href: 'https://linkedin.com/in/your-profile', icon: Linkedin },
  { name: 'GitHub', href: 'https://github.com/your-profile', icon: Github },
  { name: 'Facebook', href: 'https://facebook.com/your-profile', icon: Facebook },
];

const Footer = () => {
  const allLinks = Object.values(footerItems).flat();
  return (
    <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center text-center">


          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-center gap-3">
              <Image src={logo} alt="Script AI Logo" width={40} height={40} />
              <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">Script AI</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm">
              Personalized AI assistant for content creators.
            </p>
          </div>


          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label="Footer">
            {allLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm text-slate-600 dark:text-slate-400 dark:hover:text-slate-100 transition-colors hover:text-purple-500"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="relative mb-8">
            <Dock direction="middle">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <DockIcon key={item.name}>
                    <Link
                      href={item.href}
                      className="p-2.5 flex items-center justify-center rounded-full"
                    >
                      <span className="sr-only">{item.name}</span>
                      <Icon className="h-5 w-5 text-slate-500 dark:text-slate-400 hover:text-purple-500" />
                    </Link>
                  </DockIcon>
                );
              })}
            </Dock>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-700 w-full pt-8 text-sm text-slate-600 dark:text-slate-400">
            &copy; {new Date().getFullYear()} Script AI. All rights reserved.
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;