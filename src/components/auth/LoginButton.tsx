
'use client'
import { useSession, signIn } from "next-auth/react"
import { useSignOut } from "@/lib/hooks/useSignOut"
import SignOutConfirmDialog from "@/components/auth/SignOutConfirmDialog"

const LoginButton = () => {
    const { data: session } = useSession()
    const signOut = useSignOut({ user: session?.user })

    if (session) {
        return (
            <>
                <p>Signed in as {session.user?.email}</p>
                <p>Signed in as {session.user?.image}</p>
                <p>Signed in as {session.user?.id}</p>
                <p>Signed in as {session.user?.name}</p>

                <button onClick={signOut.requestSignOut}>Sign out</button>
                <SignOutConfirmDialog
                    open={signOut.confirmOpen}
                    onCancel={signOut.cancelSignOut}
                    onConfirm={signOut.confirmSignOut}
                />
            </>
        )
    }
    return <button onClick={() => signIn("google")}>Sign in with Google</button>
}

export default LoginButton
