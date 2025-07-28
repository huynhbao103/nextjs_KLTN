import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/lib/mongodb-adapter"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GithubProvider({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials:', { email: !!credentials?.email, password: !!credentials?.password })
          throw new Error('Vui lòng nhập email và mật khẩu')
        }

        try {
          await dbConnect()
          const user = await User.findOne({ email: credentials.email })
          console.log('Found user:', { 
            exists: !!user, 
            hasPassword: !!user?.password,
            email: user?.email,
            password: user?.password ? 'exists' : 'missing'
          })

          if (!user) {
            throw new Error('Email chưa được đăng ký')
          }

          if (!user.password) {
            throw new Error('Tài khoản này chưa được thiết lập mật khẩu. Vui lòng đăng nhập bằng GitHub hoặc Google')
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password as string
          )
          console.log('Password validation:', { isValid: isPasswordValid })

          if (!isPasswordValid) {
            throw new Error('Mật khẩu không đúng')
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (error: any) {
          console.error('Error in authorize:', error)
          throw new Error(error.message || 'Đã xảy ra lỗi khi đăng nhập')
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }: any) {
      console.log('signIn callback triggered:', { 
        provider: account?.provider, 
        email: user?.email,
        hasAccount: !!account 
      })
      
      // Với OAuth providers, adapter sẽ tự động tạo user và account
      // Chỉ cần log để debug
      if (account?.provider === "github" || account?.provider === "google") {
        console.log(`${account.provider} OAuth signIn - User will be created by adapter`)
      }
      
      return true
    },
    async session({ session, token }: any) {
      console.log('session callback triggered:', { 
        hasSession: !!session, 
        hasUser: !!session?.user,
        userEmail: session?.user?.email 
      })
      
      if (session?.user) {
        try {
          await dbConnect()
          const user = await User.findOne({ email: session.user.email })
          console.log('session callback - Found user:', { 
            exists: !!user, 
            email: user?.email,
            providers: user?.providers 
          })
          
          if (user) {
            session.user = {
              ...session.user,
              id: user._id.toString(),
              phone: user.phone,
              address: user.address,
              bio: user.bio,
              age: user.age,
              gender: user.gender,
              weight: user.weight,
              height: user.height,
              activityLevel: user.activityLevel,
              medicalConditions: user.medicalConditions,
              allergies: user.allergies, // Added allergies
              providers: user.providers,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
            }
            console.log('session callback - User data loaded:', { 
              id: session.user.id,
              providers: session.user.providers 
            })
          }
        } catch (error) {
          console.error("Error in session callback:", error)
        }
      }
      // Đảm bảo luôn gán id vào session.user
      if (session?.user && token?.id) {
        session.user.id = token.id;
      }
      return session
    },
    async jwt({ token, user, account }: any) {
      if (user) {
        token.id = user.id;
      }
      console.log('JWT callback - token:', token);
      return token
    }
  },
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: false,
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
      },
    },
  },
  debug: process.env.NODE_ENV === "development",
})