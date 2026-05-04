import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Logo from '../components/Logo';
import Footer from '../components/Footer';

export default function PrivacyPage() {
  const { darkMode } = useApp();

  const bg = darkMode ? 'bg-zinc-900 text-white' : 'bg-white text-gray-900';
  const muted = darkMode ? 'text-white/40' : 'text-gray-400';
  const heading = darkMode ? 'text-white' : 'text-gray-900';
  const body = darkMode ? 'text-white/65' : 'text-gray-600';
  const divider = darkMode ? 'border-white/8' : 'border-gray-100';

  return (
    <div className={`min-h-screen flex flex-col ${bg}`}>
      <header className={`sticky top-0 z-30 flex items-center gap-4 px-6 py-3.5 border-b backdrop-blur-xl ${
        darkMode ? 'bg-zinc-900/80 border-white/8' : 'bg-white/80 border-gray-200'
      }`}>
        <Link
          to="/"
          className={`p-2 rounded-full transition-colors ${
            darkMode ? 'text-white/40 hover:text-white/80 hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-black/5'
          }`}
        >
          <ChevronLeft size={18} />
        </Link>
        <Logo size="sm" />
      </header>

      <main className="flex-1">
        <div className="max-w-3xl mx-auto py-16 px-8">
          <p className={`text-sm font-medium mb-3 ${muted}`}>Legal</p>
          <h1 className={`text-4xl font-bold mb-3 ${heading}`}>Privacy Policy</h1>
          <p className={`text-sm mb-10 ${muted}`}>Last updated: May 1, 2026</p>

          <div className={`border-b mb-10 ${divider}`} />

          <div className={`space-y-10 ${body}`}>

            <section>
              <h2 className={`text-xl font-bold mb-3 ${heading}`}>1. Introduction</h2>
              <p className="mb-4 leading-relaxed">
                Orbit ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the Orbit application and services (the "Service").
              </p>
              <p className="leading-relaxed">
                Please read this policy carefully. If you disagree with its terms, please discontinue use of the Service.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-bold mb-3 ${heading}`}>2. Information We Collect</h2>
              <p className="mb-4 leading-relaxed">We may collect the following types of information:</p>

              <h3 className={`text-base font-semibold mb-2 ${heading}`}>Information you provide directly</h3>
              <ul className="list-disc pl-6 space-y-2 leading-relaxed mb-5">
                <li>Account registration information (email address, display name)</li>
                <li>Content you create, such as saved cards, deck names, and personal notes</li>
                <li>Communications you send to us</li>
              </ul>

              <h3 className={`text-base font-semibold mb-2 ${heading}`}>Information collected automatically</h3>
              <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                <li>Log data including IP address, browser type, pages visited, and timestamps</li>
                <li>Device information such as hardware model and operating system</li>
                <li>Usage patterns and interactions with the Service (searches performed, cards saved)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-xl font-bold mb-3 ${heading}`}>3. How We Use Your Information</h2>
              <p className="mb-4 leading-relaxed">We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                <li>Provide, operate, and maintain the Service</li>
                <li>Personalize your experience and deliver relevant search results</li>
                <li>Process transactions and send related information</li>
                <li>Send administrative information such as updates, security alerts, and support messages</li>
                <li>Respond to comments and questions</li>
                <li>Monitor and analyze usage trends to improve the Service</li>
                <li>Detect, prevent, and address technical issues and abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-xl font-bold mb-3 ${heading}`}>4. Sharing Your Information</h2>
              <p className="mb-4 leading-relaxed">
                We do not sell, trade, or rent your personal information to third parties. We may share information in the following limited circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                <li><strong>Service providers:</strong> Trusted third-party vendors who assist in operating the Service (e.g., hosting, analytics) under strict confidentiality agreements</li>
                <li><strong>Legal requirements:</strong> When required by law, court order, or governmental authority</li>
                <li><strong>Protection of rights:</strong> To protect the rights, property, or safety of Orbit, our users, or others</li>
                <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets, with prior notice to users</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-xl font-bold mb-3 ${heading}`}>5. Cookies and Tracking</h2>
              <p className="mb-4 leading-relaxed">
                Orbit uses cookies and similar tracking technologies to enhance your experience. Cookies are small data files stored on your device. We use:
              </p>
              <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                <li><strong>Essential cookies:</strong> Required for the Service to function, including authentication sessions</li>
                <li><strong>Preference cookies:</strong> Remember your settings such as dark mode preference</li>
                <li><strong>Analytics cookies:</strong> Help us understand how users interact with the Service</li>
              </ul>
              <p className="mt-4 leading-relaxed">
                You may instruct your browser to refuse cookies, though this may affect functionality. Most browsers provide instructions for managing cookies in their help documentation.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-bold mb-3 ${heading}`}>6. Data Retention</h2>
              <p className="leading-relaxed">
                We retain your personal information for as long as your account is active or as needed to provide the Service. You may request deletion of your account and associated data at any time by contacting us. We will retain and use your information as necessary to comply with legal obligations, resolve disputes, and enforce agreements.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-bold mb-3 ${heading}`}>7. Data Security</h2>
              <p className="leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include encryption in transit, secure authentication, and regular security reviews. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-bold mb-3 ${heading}`}>8. Your Rights</h2>
              <p className="mb-4 leading-relaxed">Depending on your jurisdiction, you may have the following rights regarding your personal data:</p>
              <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data ("right to be forgotten")</li>
                <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
                <li><strong>Objection:</strong> Object to certain types of processing, including direct marketing</li>
                <li><strong>Withdrawal of consent:</strong> Withdraw consent where processing is based on consent</li>
              </ul>
              <p className="mt-4 leading-relaxed">
                To exercise any of these rights, please contact us at{' '}
                <a href="mailto:privacy@orbitapp.io" className="text-[#4285f4] hover:underline">
                  privacy@orbitapp.io
                </a>.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-bold mb-3 ${heading}`}>9. Children's Privacy</h2>
              <p className="leading-relaxed">
                The Service is not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal information, we will take steps to delete such information. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-bold mb-3 ${heading}`}>10. Changes to This Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. For significant changes, we will provide a more prominent notice. Your continued use of the Service after changes are posted constitutes your acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-bold mb-3 ${heading}`}>11. Contact Us</h2>
              <p className="leading-relaxed">
                If you have questions or concerns about this Privacy Policy, please contact us at{' '}
                <a href="mailto:privacy@orbitapp.io" className="text-[#4285f4] hover:underline">
                  privacy@orbitapp.io
                </a>{' '}
                or write to us at: Orbit, Inc., Privacy Team, San Francisco, CA 94105.
              </p>
            </section>
          </div>

          <div className={`border-t mt-12 pt-8 ${divider}`}>
            <Link
              to="/terms"
              className="text-[#4285f4] hover:underline text-sm font-medium"
            >
              Read our Terms of Service →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
