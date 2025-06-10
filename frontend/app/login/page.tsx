"use client"

import { redirect } from "next/navigation"

export default function LoginRedirectPage() {
  redirect("/")
  return null
}