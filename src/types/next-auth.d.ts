import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      isAdmin: boolean
      xp: number
      isWhitelisted: boolean
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    image?: string | null
    isAdmin?: boolean
    xp?: number
    isWhitelisted?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
  }
}
