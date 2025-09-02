'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

import error404 from '@/public/error-404.png';

export default function NotFound() {
    const router = useRouter();

    return (
        <main className="relative flex min-h-screen w-full flex-col bg-slate-50 text-slate-900 md:flex-row">
            {/* Back Button */}
            <div className="absolute left-3 top-3 z-10 sm:left-4 sm:top-4 md:left-6 md:top-6">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="text-slate-600 hover:bg-slate-200 hover:text-purple-600 text-sm sm:text-base"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </div>

            {/* Left Column: Text Content */}
            <div className="flex w-full flex-col items-center justify-center px-4 pt-20 pb-8 text-center sm:px-6 md:w-1/2 md:items-start md:justify-center md:p-12 md:pt-0 md:text-left lg:p-16">
                <h1 className="text-[clamp(2rem,6vw,5rem)] font-extrabold tracking-tight text-slate-900">
                    Lost in Space?
                </h1>
                <p className="mt-4 max-w-md text-base text-slate-600 sm:mt-6 sm:text-lg md:max-w-lg">
                    The page you're looking for might be in another dimension or exploring a new galaxy. Let's get you back to
                    familiar cosmic coordinates.
                </p>
                <div className="mt-8 flex flex-col items-center gap-4 sm:mt-10 sm:flex-row sm:items-start sm:gap-6">
                    <Link
                        href="/"
                        className="group inline-flex items-center gap-2 text-base sm:text-lg font-semibold text-purple-600 transition-colors hover:text-purple-800"
                    >
                        <span>Go to Home</span>
                        <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                            →
                        </span>
                    </Link>

                    <Link
                        href="/#features"
                        className="relative text-base sm:text-lg font-semibold text-slate-600 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-right after:scale-x-0 after:bg-purple-600 after:transition-transform after:duration-300 after:ease-out hover:text-slate-900 hover:after:origin-left hover:after:scale-x-100"
                    >
                        Features
                    </Link>

                    <Link
                        href="/login"
                        className="relative text-base sm:text-lg font-semibold text-slate-600 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-right after:scale-x-0 after:bg-purple-600 after:transition-transform after:duration-300 after:ease-out hover:text-slate-900 hover:after:origin-left hover:after:scale-x-100"
                    >
                        Login
                    </Link>
                </div>
            </div>

            {/* Right Column: Image */}
            <div className="relative flex w-full items-center justify-center overflow-hidden h-[40vh] sm:h-[50vh] md:h-auto md:w-1/2 md:p-8">
                <Image
                    src={error404}
                    alt="Astronaut floating in space, 404 error"
                    className="h-full w-full object-contain animate-slow-pan z-0"
                    priority
                />

                {/* Twinkling stars */}
                <div
                    className="absolute top-[20%] left-[30%] h-1 w-1 rounded-full bg-white animate-twinkle z-20"
                    style={{ animationDelay: '0s' }}
                />
                <div
                    className="absolute top-[50%] left-[70%] h-1 w-1 rounded-full bg-white animate-twinkle z-20"
                    style={{ animationDelay: '1s' }}
                />
                <div
                    className="absolute top-[80%] left-[45%] h-2 w-2 rounded-full bg-white animate-twinkle z-20"
                    style={{ animationDelay: '2s' }}
                />
                <div
                    className="absolute top-[35%] left-[85%] h-1 w-1 rounded-full bg-white animate-twinkle z-20"
                    style={{ animationDelay: '3s' }}
                />
            </div>
        </main>
    );
}
