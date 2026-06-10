'use client'

import Image from "next/image";
import LandingPage from "@/components/marketing/LandingPage"
import LoginForm from "@/components/auth/LoginForm"
import SessionProvider from "next-auth";
import DashboardPage from "@/components/dashboard/DashboardPage";

export default function Home() {
  return (
    //<LoginForm />
    //<DashboardPage />
    <LandingPage />
  );
}
