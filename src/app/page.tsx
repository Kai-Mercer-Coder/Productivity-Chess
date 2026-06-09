'use client'

import Image from "next/image";
import GrandmasterMonolith from "./Components/Home"
import Login from "./Components/Login"
import SessionProvider from "next-auth";
import Dashboard from "./Components/Dashboard";

export default function Home() {
  return (
    //<Login />
    //<Dashboard />
    <GrandmasterMonolith />
  );
}
