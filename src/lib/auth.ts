import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const { handlers: { GET, POST }, auth } = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT!,
            clientSecret: process.env.GITHUB_SECRET!,
            userinfo: {
                url: "https://api.github.com/user",
                async request({ tokens, provider }) {
                    const [profile, emailsRes] = await Promise.all([
                        fetch(provider.userinfo?.url, {
                            headers: { Authorization: `Bearer ${tokens.access_token}`, "User-Agent": "authjs" },
                        }).then(r => r.json()),
                        fetch("https://api.github.com/user/emails", {
                            headers: { Authorization: `Bearer ${tokens.access_token}`, "User-Agent": "authjs" },
                        }),
                    ]);
                    const emails = emailsRes.ok ? await emailsRes.json() : [];
                    const primary = emails.find((e: any) => e.primary) ?? emails[0];
                    const email = profile.email ?? primary?.email;
                    profile.email = email;
                    profile.email_verified = emails.find((e: any) => e.email === email)?.verified ?? false;
                    return profile;
                },
            },
            profile(profile: any) {
                return {
                    id: profile.id.toString(),
                    name: profile.name ?? profile.login,
                    email: profile.email,
                    image: profile.avatar_url,
                    emailVerified: profile.email_verified ? new Date() : null,
                };
            },
        }),
        CredentialsProvider({
            id: "guest",
            name: "Guest",
            credentials: {},
            async authorize() {
                const guestId = crypto.randomUUID();
                return {
                    id: guestId,
                    email: `guest_${guestId.slice(0, 8)}@guest.local`,
                    name: `Guest_${Math.random().toString(36).substring(2, 8)}`,
                };
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }: { user: any; account?: any; profile?: any }) {
            if (!user.email) return false;

            // Guest accounts use synthetic emails — nothing to verify.
            if (account?.provider !== "guest") {
                // OAuth only: accept verified emails so an unverified email on one
                // provider can't be used to take over a victim's account.
                const emailVerified =
                    account?.provider === "github"
                        ? user.emailVerified instanceof Date
                        : profile?.email_verified === true;

                if (!emailVerified) return false;
            }

            const { data: existing, error: fetchError } = await supabase
                .from("users")
                .select("*")
                .eq("email", user.email)
                .maybeSingle();

            if (fetchError) {
                console.error("Supabase fetch error in signIn:", fetchError);
            }

            if (!existing) {
                const { error: insertError } = await supabase.from("users").insert({
                    email: user.email,
                    elo: 1200,
                    puzzles_solved: 0,
                    delta_value: 200,
                    volatility: 0.06,
                    course: 1,
                });

                if (insertError) {
                    console.error("CRITICAL: Failed to insert user into DB (Possible RLS issue?):", insertError);
                } else {
                    console.log("Successfully inserted new user into database:", user.email);
                }
            }
            return true;
        },
        async jwt({ token, user, session, trigger }: { token: any; user?: any; session?: any; trigger?: string }) {
            if (user) {
                token.name = user.name;
            }
            if (user?.email) {
                const { data: profile } = await supabase
                    .from("users")
                    .select("id, elo, puzzles_solved, delta_value, volatility, course")
                    .eq("email", user.email)
                    .maybeSingle();

                if (profile) {
                    token.id = profile.id;
                    token.elo = profile.elo;
                    token.puzzles_solved = profile.puzzles_solved;
                    token.delta_value = profile.delta_value;
                    token.volatility = profile.volatility ?? 0.06;
                    token.course = profile.course;
                }
            }

            if (trigger === "update" && session) {
                if (session.elo !== undefined) token.elo = session.elo;
                if (session.delta_value !== undefined) token.delta_value = session.delta_value;
                if (session.volatility !== undefined) token.volatility = session.volatility;
                if (session.puzzles_solved !== undefined) token.puzzles_solved = session.puzzles_solved;
            }

            return token;
        },
        async session({ session, token }: { session: any; token: any }) {
            if (token) {
                session.user.id = token.id;
                session.user.elo = token.elo;
                session.user.puzzles_solved = token.puzzles_solved;
                session.user.delta_value = token.delta_value;
                session.user.volatility = token.volatility;
                session.user.course = token.course;
            }
            return session;
        },
    },
});
