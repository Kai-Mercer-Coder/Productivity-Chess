
'use client'
import { useSession, signIn, signOut } from "next-auth/react"

const LoginButton = () => {
    const { data: session } = useSession()

    if (session) {
        return (
            <>
                <p>Signed in as {session.user?.email}</p>
                <p>Signed in as {session.user?.image}</p>
                <p>Signed in as {session.user?.id}</p>
                <p>Signed in as {session.user?.name}</p>

                <button onClick={() => signOut()}>Sign out</button>
            </>
        )
    }
    return <button onClick={() => signIn("google")}>Sign in with Google</button>
}

export default LoginButton
