import Link from 'next/link';
import { Building2 } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | BildPro',
};

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-navy-900 mb-8">Terms of Service</h1>
        <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
          <p><strong>Effective Date:</strong> February 2026</p>

          <h2 className="text-xl font-semibold text-navy-900 mt-8">1. Acceptance of Terms</h2>
          <p>
            By accessing or using BildPro (&ldquo;the Service&rdquo;), operated by BildPro (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;),
            you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
          </p>

          <h2 className="text-xl font-semibold text-navy-900 mt-8">2. Description of Service</h2>
          <p>
            BildPro is a web-based tool that helps construction professionals generate AIA-style G702/G703
            payment applications. The Service provides automated calculations, PDF generation, and project
            management features.
          </p>

          <h2 className="text-xl font-semibold text-navy-900 mt-8">3. Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all
            activities that occur under your account. You must provide accurate and complete information
            when creating an account.
          </p>

          <h2 className="text-xl font-semibold text-navy-900 mt-8">4. Subscriptions and Billing</h2>
          <p>
            Paid plans are billed monthly through Stripe. You may cancel at any time; cancellation takes
            effect at the end of the current billing period. Refunds are not provided for partial months.
            We reserve the right to change pricing with 30 days notice.
          </p>

          <h2 className="text-xl font-semibold text-navy-900 mt-8">5. Acceptable Use</h2>
          <p>
            You agree not to misuse the Service, including attempting to access it through unauthorized means,
            interfering with other users, or using the Service for any unlawful purpose.
          </p>

          <h2 className="text-xl font-semibold text-navy-900 mt-8">6. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are owned by BildPro and are
            protected by copyright and other intellectual property laws. Your data remains yours.
          </p>

          <h2 className="text-xl font-semibold text-navy-900 mt-8">7. Disclaimer</h2>
          <p>
            The Service is provided &ldquo;as is&rdquo; without warranties of any kind. BildPro does not guarantee
            that generated documents will be accepted by any third party. You are responsible for reviewing
            all output before submission.
          </p>

          <h2 className="text-xl font-semibold text-navy-900 mt-8">8. Limitation of Liability</h2>
          <p>
            BildPro shall not be liable for any indirect, incidental, special, consequential, or punitive
            damages resulting from your use of the Service.
          </p>

          <h2 className="text-xl font-semibold text-navy-900 mt-8">9. Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. We will notify you of material changes by posting
            the new Terms on this page with an updated effective date.
          </p>

          <h2 className="text-xl font-semibold text-navy-900 mt-8">10. Contact</h2>
          <p>
            If you have questions about these Terms, contact us at{' '}
            <a href="mailto:support@bildpro.io" className="text-construction-500 hover:underline">
              support@bildpro.io
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
