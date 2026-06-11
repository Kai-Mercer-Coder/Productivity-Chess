import Link from "next/link";

export default function PrivacyPage() {
    return (
        <div className="bg-black text-on-background min-h-screen">
            <div className="max-w-3xl mx-auto px-6 py-24 md:py-32">
                <Link href="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors text-sm mb-12">
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Back to home
                </Link>

                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">Privacy Policy</h1>
                <p className="text-neutral-500 text-sm mb-12">Last updated: June 11, 2026</p>

                <div className="space-y-8 text-neutral-300 text-sm md:text-base leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
                        <p className="mb-3">When you sign up for an account, whether via OAuth (Google, GitHub) or as a guest, we collect:</p>
                        <ul className="list-disc pl-6 space-y-1.5">
                            <li>Your email address (for OAuth users) or a randomly generated identifier (for guest users)</li>
                            <li>Your display name as provided by your OAuth provider or generated for guest sessions</li>
                            <li>Your profile picture (if applicable)</li>
                            <li>Usage data including games played, puzzles solved, and performance metrics (ELO rating, delta value, volatility)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">2. How We Use Your Information</h2>
                        <p className="mb-3">We use the collected information solely to:</p>
                        <ul className="list-disc pl-6 space-y-1.5">
                            <li>Provide and maintain the chess training platform</li>
                            <li>Track your progress, ELO rating, and puzzle-solving statistics</li>
                            <li>Personalize your learning experience based on performance data</li>
                            <li>Improve our services and develop new features</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">3. Data Storage and Security</h2>
                        <p>Your data is stored securely in our Supabase database. We implement industry-standard security measures including encrypted connections and restricted access to personal data. Guest session data is associated with randomly generated identifiers and does not contain personally identifiable information.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">4. Third-Party Services</h2>
                        <p className="mb-3">We use the following third-party services:</p>
                        <ul className="list-disc pl-6 space-y-1.5">
                            <li><strong>Supabase</strong> — for database storage and authentication</li>
                            <li><strong>Google</strong> — for OAuth sign-in (optional)</li>
                            <li><strong>GitHub</strong> — for OAuth sign-in (optional)</li>
                        </ul>
                        <p className="mt-3">Each service operates under its own privacy policy. We do not sell or share your personal data with third parties for their own use.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">5. Data Retention</h2>
                        <p>We retain your account data for as long as your account remains active. You may request deletion of your account and associated data at any time by contacting us. Guest session data may be periodically purged from our systems.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">6. Your Rights</h2>
                        <p className="mb-3">Depending on your jurisdiction, you may have the right to:</p>
                        <ul className="list-disc pl-6 space-y-1.5">
                            <li>Access the personal data we hold about you</li>
                            <li>Request correction or deletion of your data</li>
                            <li>Object to or restrict processing of your data</li>
                            <li>Request portability of your data</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">7. Contact</h2>
                        <p>If you have questions about this Privacy Policy or wish to exercise your data rights, please contact us at privacy@monolithchess.com.</p>
                    </section>
                </div>

                <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-4 text-sm text-neutral-500">
                    <Link href="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link>
                    <span className="hidden sm:inline">·</span>
                    <Link href="/" className="hover:text-white transition-colors">Home</Link>
                </div>
            </div>
        </div>
    );
}
