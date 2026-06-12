'use client'

import { useSession, signIn, signOut } from "next-auth/react"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import '../../app/globals.css'
import Link from "next/link"

const Login = () => {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [focused, setFocused] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        setMounted(true)
        const t = setTimeout(() => setVisible(true), 50)
        return () => clearTimeout(t)
    }, [])

    useEffect(() => {
        if (session?.user?.email) {
            setEmail(session.user.email)
        }
    }, [session])

    useEffect(() => {
        if (status === 'authenticated') {
            router.push('/dashboard')
        }
    }, [status, router])

    if (!mounted) return null

    const isLoading = status === 'loading'
    const initial = session?.user?.name?.[0] || session?.user?.email?.[0] || '?'
    const isGuest = session?.user?.email?.endsWith('@guest.local')

    return (
        <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-black select-none">

            {/* grain */}<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
            <div
                className="absolute inset-0 opacity-[0.025] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "repeat",
                }}
            />

            {/* radial glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/15.5 blur-[100px] pointer-events-none" />

            {/* top line accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-linear-to-b from-white/8 to-transparent pointer-events-none" />

            <div
                className={`w-full max-w-[380px] relative z-10 transition-all duration-1000 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
            >

                {/* Logo / Avatar */}
                <div className="mb-12 flex justify-center">
                    {session ? (
                        <div className="w-12 h-12 rounded-full border border-white/15 flex items-center justify-center bg-white/4 shadow-[0_0_30px_rgba(255,255,255,0.03)]">
                            <span className="text-white/80 text-[15px] font-medium">{initial}</span>
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-full border border-white/8 flex items-center justify-center group hover:border-white/15 transition-all duration-700">
                            <div className="w-1.5 h-1.5 rounded-full bg-white/50 group-hover:bg-white/70 transition-colors duration-700" />
                        </div>
                    )}
                </div>

                {/* Heading */}
                <div className="mb-10 text-center">
                    <h1 className="text-white text-[22px] font-medium tracking-tight mb-2.5">
                        {session ? `Welcome, ${session.user?.name?.split(' ')[0] || ''}` : "Welcome back"}
                    </h1>
                    <p className="text-white/25 text-[13px] font-light tracking-wide leading-relaxed">
                        {isLoading
                            ? 'Checking your session…'
                            : session
                                ? isGuest
                                    ? `Signed in as ${session.user?.name || 'Guest'}`
                                    : `Signed in as ${session.user?.email}`
                                : 'Sign in to continue to your account'}
                    </p>
                </div>

                {/* Loading skeleton */}
                {isLoading && (
                    <div className="space-y-5">
                        <div className="h-[58px] rounded-xl bg-white/3 border border-white/4 animate-pulse" />
                        <div className="h-[46px] rounded-xl bg-white/4 animate-pulse" />
                        <div className="flex items-center gap-4 my-8">
                            <div className="flex-1 h-px bg-white/4" />
                            <div className="w-4 h-2 rounded bg-white/4 animate-pulse" />
                            <div className="flex-1 h-px bg-white/4" />
                        </div>
                        <div className="h-[46px] rounded-xl bg-white/2 border border-white/4 animate-pulse" />
                    </div>
                )}

                {/* Signed out form */}
                {!isLoading && !session && (
                    <div className="space-y-5">
                        {/* Email */}


                        <button
                            onClick={() => signIn("google")}
                            className="w-full py-3.5 rounded-xl text-[13px] font-light tracking-wide bg-white/2.5 text-white/50 border border-white/6 transition-all duration-500 flex items-center justify-center gap-3 hover:bg-white/5 hover:border-white/10 hover:text-white/80 active:scale-[0.98] cursor-pointer"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="rgba(255,255,255,0.65)" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="rgba(255,255,255,0.45)" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="rgba(255,255,255,0.55)" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="rgba(255,255,255,0.35)" />
                            </svg>
                            Continue with Google
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-8">
                            <div className="flex-1 h-px bg-white/5" />
                            <span className="text-white/15 text-[10px] tracking-[0.2em] uppercase font-medium">or</span>
                            <div className="flex-1 h-px bg-white/5" />
                        </div>

                        {/* Google */}

                        <button
                            onClick={() => signIn("github")}
                            className="w-full py-3.5 rounded-xl text-[13px] font-light tracking-wide bg-white/2.5 text-white/50 border border-white/6 transition-all duration-500 flex items-center justify-center gap-3 hover:bg-white/5 hover:border-white/10 hover:text-white/80 active:scale-[0.98] cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 16 16">
                                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
                            </svg>
                            Continue with Github
                        </button>

                        <div className="pt-5 mt-5 border-t border-white/5">
                            <button
                                onClick={() => signIn("guest")}
                                className="w-full py-3 rounded-xl text-[12px] font-light tracking-wide text-white/25 border border-dashed border-white/6 transition-all duration-500 flex items-center justify-center gap-2.5 hover:text-white/50 hover:border-white/10 hover:bg-white/[0.02] active:scale-[0.98] cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[14px]">person_outline</span>
                                Continue as Guest
                            </button>
                        </div>
                    </div>
                )}

                {/* Signed in state */}
                {!isLoading && session && (
                    <div className="space-y-5">
                        {/* Read-only email display */}
                        <div className="relative">
                            <div className="absolute inset-0 rounded-xl border border-white/6 bg-white/1.5" />
                            <div className="relative px-7 pt-7 pb-6">
                                <span className="block text-[10px] text-white/25 tracking-[0.12em] uppercase font-medium mb-0.5">{isGuest ? 'Signed in as' : 'Email address'}</span>
                                <span className="block text-[14px] text-white/50 font-light truncate">{isGuest ? (session.user?.name || 'Guest') : session.user?.email}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => signOut()}
                            className="w-full py-3.5 rounded-xl text-[13px] font-medium tracking-wide bg-red-800/4 text-white/50 border border-white/8 transition-all duration-500 hover:bg-white/[0.07] hover:text-white/70 hover:border-white/12 active:scale-[0.98] cursor-pointer"
                        >
                            Sign out
                        </button>
                        <Link
                            href="/dashboard"
                            className="block w-full py-3.5 rounded-xl text-[13px] font-medium tracking-wide bg-white/4 text-white/50 border border-white/8 transition-all duration-500 hover:bg-white/[0.07] hover:text-white/70 hover:border-white/12 active:scale-[0.98] cursor-pointer text-center"
                        >
                            Continue to Website
                        </Link>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-12 flex flex-col items-center gap-3">
                    <p className="text-white/12 text-[10px] font-light tracking-[0.06em]">
                        By continuing, you agree to our Terms of Service
                    </p>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-white/10" />
                        <div className="w-1 h-1 rounded-full bg-white/6" />
                        <div className="w-1 h-1 rounded-full bg-white/3" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login