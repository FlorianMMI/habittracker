import NextAuth from 'next-auth'
import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getUserByEmail } from '@/lib/users'
import bcrypt from 'bcryptjs'

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                try {
                    // Vérifiez les credentials dans votre base de données
                    const user = await getUserByEmail(credentials.email)
                    
                    if (!user) {
                        return null
                    }

                    // Vérifiez le mot de passe
                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
                    
                    if (!isPasswordValid) {
                        return null
                    }

                    // Vérifier que l'email est validé (sécurité supplémentaire)
                    if (!user.isValidated) {
                        return null
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: `${user.firstName} ${user.lastName}`,
                        firstName: user.firstName,
                        lastName: user.lastName
                    }
                } catch (error) {
                    console.error('Auth error:', error)
                    return null
                }
            }
        })
    ],
    session: {
        strategy: 'jwt'
    },
    pages: {
        signIn: '/login'
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.firstName = user.firstName
                token.lastName = user.lastName
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.sub!
                session.user.firstName = token.firstName
                session.user.lastName = token.lastName
            }
            return session
        }
    }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }