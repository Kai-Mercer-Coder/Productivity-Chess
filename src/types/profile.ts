import type { DefaultSession } from "next-auth";

export interface UserProfile {
    elo: number;
    puzzles_solved: number;
    delta_value: number;
    volatility: number;
    course: number;
}

export type SessionWithProfile = DefaultSession & {
    user: DefaultSession["user"] & UserProfile;
};
