import Link from 'next/link';
import { Building2 } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | BildPro',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-construction-500" />
              <span className="text-2xl font-bold text-navy-900">BildPro</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-navy-900 mb-8">Privacy Policy</h1>
        <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
          <p><strong>Effective Date:</strong> February 2026</p>

          <h2 className="text-xl font-semibold text-navy-900 mt-8">1. Information We Collect</h2>
          <p>
            We collect information you provide when creating an account (email, company name, address)
            and data you enter while using the Service (project details, schedule of values, pay application data).
          </p>

          <h2 className="text-xl font-semibold text-navy-900 mt-8">2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Provide and maintain the Service</li>
            <li>Process payments through Stripe</li>
            <li>Send important account notifications</li>
            <li>Improve the Service</li>
          </ul>

          <h2 className="text-xl font-semibold text-navy-900 mt-8">3. Data Storage and Security</h2>
          <p>
            Your data is stored securely using Supabase (hosted on AWS). We use industry-standard
            encryption for data in transit and at rest. We do not sell your data to third parties.
          </p>

          <h2 className="text-xl font-semibold text-navy-900 mt-8">4. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Supabase</strong> — database and authentication</li>
            <li><strong>Stripe</strong> — payment processing</li>
            <li><strong>Vercel</strong> — hosting</li>
          </ul>
          <p>Each operates under their own privacy policies.</p>

          <h2 className="text-xl font-semibold text-navy-900 mt-8">5. Cookies</h2>
          <p>
            We use essential cookies for authentication and session management. We do not use
            third-party advertising or tracking cookies.
          </p>

          <h2 className="text-xl font-semibold text-navy-900 mt-8">6. Your Rights</h2>
          <p>You may:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Access and export your data at any time</li>
            <li>Request deletion of your account and data</li>
            <li>Update your personal information in Settings</li>
          </ul>

          <h2 className="text-xl font-semibold text-navy-900 mt-8">7. Data Retention</h2>
          <p>
            We retain your data for as long as your account is active. Upon account deletion,
            we remove your data within 30 days.
          </p>

          <h2 className="text-xl font-semibold text-navy-900 mt-8">8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material changes
            by posting the new policy on this page.
          </p>

          <h2 className="text-xl font-semibold text-navy-900 mt-8">9. Contact</h2>
          <p>
            If you have questions about this Privacy Policy, contact us at{' '}
            <a href="mailto:support@bildpro.io" className="text-construction-500 hover:underline">
              support@bildpro.io
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
