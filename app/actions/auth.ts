"use server"

import { prisma } from "@/lib/prisma"
import { compare, hash } from "bcryptjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const SESSION_COOKIE_NAME = "rcrm_session"
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export async function login(username: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { username },
  })

  if (!user) {
    return { error: "Invalid username or password" }
  }

  const isValid = await compare(password, user.password)
  if (!isValid) {
    return { error: "Invalid username or password" }
  }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  })

  redirect("/")
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
  redirect("/login")
}

export async function getSession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionId) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    select: { id: true, username: true },
  })

  return user
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }
  return session
}
