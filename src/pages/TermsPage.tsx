import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Logo from '../components/Logo';
import Footer from '../components/Footer';

export default function TermsPage() {
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
          <h1 className={`text-4xl font-bold mb-3 ${heading}`}>Terms of Service</h1>
          <p className={`text-sm mb-10 ${muted}`}>Last updated: May 1, 2026</p>

          <div className={`border-b mb-10 ${divider}`} />

          <div className={`space-y-10 ${body}`}>

            <section>
              <h2 className={`text-xl font-bold mb-3 ${heading}`}>1. Acceptance of Terms</h2>
              <p className="mb-4 leading-relaxed">
                By accessing or using Orbit ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service. These Terms apply to all visitors, users, and others who access or use the Service.
              </p>
              <p className="leading-relaxed">
                Orbit reserves the right to modify these Terms at any time. We will notify users of material changes by updating the "Last updated" date. Your continued use of the Service after any changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-bold mb-3 ${heading}`}>2. Description of Service</h2>
              <p className="mb-4 leading-relaxed">
                Orbit is a search engine and content bookmarking application that allows users to discover, save, and organize web content via interactive cards. The Service includes the ability to:
              </p>
              <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                <li>Search and browse curated web results presented as visual cards</li>
                <li>Save cards to a personal library</li>
                <li>Organize saved cards into custom decks</li>
                <li>Share cards and decks with others</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-xl font-bold mb-3 ${heading}`}>3. User Accounts</h2>
              <p className="mb-4 leading-relaxed">
                To access certain features of the Service, you may be required to create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain the security of your password and accept responsibility for all activity under your account</li>
                <li>Notify Orbit immediately of any unauthorized use of your account</li>
                <li>Not create accounts using automated means or under false pretenses</li>
              </ul>
              <p className="mt-4 leading-relaxed">
                Orbit reserves the right to suspend or terminate accounts that violate these Terms or for any other reason at our sole discretion.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-bold mb-3 ${heading}`}>4. Acceptable Use</h2>
              <p className="mb-4 leading-relaxed">You agree not to use the Service to:</p>
              <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                <li>Violate any applicable local, national, or international law or regulation</li>
                <li>Transmit unsolicited or unauthorized advertising or promotional material</li>
                <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity</li>
                <li>Interfere with or disrupt the integrity or performance of the Service</li>
                <li>Attempt to gain unauthorized access to any portion of the Service</li>
                <li>Collect or harvest user data without authorization</li>
                <li>Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Service</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-xl font-bold mb-3 ${heading}`}>5. Intellectual Property</h2>
              <p className="mb-4 leading-relaxed">
                The Service and its original content, features, and functionality are and will remain the exclusive property of Orbit and its licensors. The Service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Orbit.
              </p>
              <p className="leading-relaxed">
                Third-party content surfaced through the search functionality remains the intellectual property of its respective owners. Orbit does not claim ownership of any third-party content displayed within the Service.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-bold mb-3 ${heading}`}>6. Disclaimer of Warranties</h2>
              <p className="leading-relaxed">
                The Service is provided on an "AS IS" and "AS AVAILABLE" basis without any warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement. Orbit does not warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful components.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-bold mb-3 ${heading}`}>7. Limitation of Liability</h2>
              <p className="leading-relaxed">
                To the fullest extent permitted by applicable law, Orbit shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, goodwill, or other intangible losses, resulting from your use of or inability to use the Service.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-bold mb-3 ${heading}`}>8. Governing Law</h2>
              <p className="leading-relaxed">
                These Terms shall be governed and construed in accordance with applicable law, without regard to its conflict of law provisions. Any dispute arising from these Terms or the Service shall be resolved through binding arbitration in accordance with the rules of a recognized arbitration body.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-bold mb-3 ${heading}`}>9. Contact</h2>
              <p className="leading-relaxed">
                If you have any questions about these Terms, please contact us at{' '}
                <a href="mailto:legal@orbitapp.io" className="text-[#4285f4] hover:underline">
                  legal@orbitapp.io
                </a>.
              </p>
            </section>
          </div>

          <div className={`border-t mt-12 pt-8 ${divider}`}>
            <Link
              to="/privacy"
              className="text-[#4285f4] hover:underline text-sm font-medium"
            >
              Read our Privacy Policy →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
