import Link from "next/link";

export default function TermsPage() {
    return (
        <div className="bg-black text-on-background min-h-screen">
            <div className="max-w-3xl mx-auto px-6 py-24 md:py-32">
                <Link href="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors text-sm mb-12">
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Back to home
                </Link>

                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">Terms &amp; Conditions</h1>
                <p className="text-neutral-500 text-sm mb-12">Last updated: June 11, 2026</p>

                <div className="space-y-8 text-neutral-300 text-sm md:text-base leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
                        <p>By accessing or using Monolith Chess, you agree to be bound by these Terms &amp; Conditions. If you do not agree to all terms, you must not use the service. Continued use of the platform after changes to these terms constitutes acceptance of those changes.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">2. Description of Service</h2>
                        <p>Monolith Chess provides a chess training platform including but not limited to puzzle solving, game analysis, ELO rating tracking, and learning materials. The service is provided on an "as is" and "as available" basis.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">3. User Accounts</h2>
                        <p className="mb-3">You may create an account via OAuth providers (Google, GitHub) or use the service as a guest. You are responsible for:</p>
                        <ul className="list-disc pl-6 space-y-1.5">
                            <li>Maintaining the confidentiality of your account credentials</li>
                            <li>All activities that occur under your account</li>
                            <li>Ensuring the accuracy of any information you provide</li>
                        </ul>
                        <p className="mt-3">Guest accounts are temporary and may be subject to data loss upon session expiration or system maintenance.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">4. Acceptable Use</h2>
                        <p className="mb-3">You agree not to:</p>
                        <ul className="list-disc pl-6 space-y-1.5">
                            <li>Use the service for any unlawful purpose or in violation of any applicable laws</li>
                            <li>Attempt to gain unauthorized access to any part of the service or its systems</li>
                            <li>Use automated tools (bots, scrapers) to interact with the service without express permission</li>
                            <li>Upload or transmit malicious code, viruses, or harmful content</li>
                            <li>Interfere with or disrupt the integrity or performance of the service</li>
                            <li>Use chess engines or external assistance during rated puzzles or training sessions</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">5. Intellectual Property</h2>
                        <p>All content, design, code, and materials on Monolith Chess are owned by or licensed to Monolith Chess Systems. You may not reproduce, distribute, modify, or create derivative works without explicit permission. The service is for personal, non-commercial use only.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">6. Limitation of Liability</h2>
                        <p>Monolith Chess shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service. In no event shall our total liability exceed the amount paid by you, if any, for accessing the service.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">7. Termination</h2>
                        <p>We reserve the right to suspend or terminate your account at any time for violation of these terms, without prior notice. Upon termination, your right to use the service immediately ceases. Guest accounts may be terminated or purged at our discretion.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">8. Changes to Terms</h2>
                        <p>We reserve the right to modify these terms at any time. Changes will be posted on this page with an updated revision date. Significant changes may be communicated via email or platform notification.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">9. Governing Law</h2>
                        <p>These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Monolith Chess Systems operates, without regard to its conflict of law provisions.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">10. Contact</h2>
                        <p>For questions about these terms, please contact us at legal@monolithchess.com.</p>
                    </section>
                </div>

                <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-4 text-sm text-neutral-500">
                    <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                    <span className="hidden sm:inline">·</span>
                    <Link href="/" className="hover:text-white transition-colors">Home</Link>
                </div>
            </div>
        </div>
    );
}
