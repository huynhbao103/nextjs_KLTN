import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
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
            throw new Error('Tài khoản này chưa được thiết lập mật khẩu. Vui lòng đăng nhập bằng GitHub')
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
      if (account?.provider === "github") {
        try {
          await dbConnect()
          const existingUser = await User.findOne({ email: user.email })
          console.log('GitHub signIn - Existing user:', { 
            exists: !!existingUser, 
            hasPassword: !!existingUser?.password,
            email: existingUser?.email 
          })
          
          if (!existingUser) {
            // Tạo user mới với mật khẩu ngẫu nhiên
            const randomPassword = Math.random().toString(36).slice(-8)
            const hashedPassword = await bcrypt.hash(randomPassword, 10)
            console.log('GitHub signIn - Creating new user with password')
            
            const newUser = await User.create({
              email: user.email,
              name: user.name,
              image: user.image,
              password: hashedPassword,
            })
            console.log('GitHub signIn - New user created:', { 
              id: newUser._id,
              hasPassword: !!newUser.password 
            })
          } else {
            // Nếu user đã tồn tại nhưng chưa có mật khẩu, tạo mật khẩu ngẫu nhiên
            if (!existingUser.password) {
              const randomPassword = Math.random().toString(36).slice(-8)
              const hashedPassword = await bcrypt.hash(randomPassword, 10)
              console.log('GitHub signIn - Adding password to existing user')
              existingUser.password = hashedPassword
              await existingUser.save()
              console.log('GitHub signIn - Password added:', { 
                hasPassword: !!existingUser.password 
              })
            }
            
            // Update existing user's information
            await User.findOneAndUpdate(
              { email: user.email },
              {
                name: user.name,
                image: user.image,
                updatedAt: new Date()
              }
            )
          }
          return true
        } catch (error) {
          console.error("Error in signIn callback:", error)
          return false
        }
      }
      return true
    },
    async session({ session, token }: any) {
      if (session?.user) {
        try {
          await dbConnect()
          const user = await User.findOne({ email: session.user.email })
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
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
            }
          }
        } catch (error) {
          console.error("Error in session callback:", error)
        }
      }
      return session
    },
    async jwt({ token, user, account }: any) {
      if (user) {
        token.id = user.id
      }
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