import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { 
  FileText, 
  Calculator, 
  CreditCard, 
  Mail, 
  HelpCircle,
  ExternalLink,
  Book 
} from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Help & Support</h1>
        <p className="text-gray-600 mt-1">
          Get help with BildPro and learn how to make the most of your pay applications.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card hover>
          <CardContent className="py-6 text-center">
            <FileText className="h-8 w-8 text-construction-500 mx-auto mb-3" />
            <h3 className="font-semibold text-navy-900 mb-1">Getting Started</h3>
            <p className="text-sm text-gray-600">
              Learn the basics of creating projects and pay applications.
            </p>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="py-6 text-center">
            <Calculator className="h-8 w-8 text-construction-500 mx-auto mb-3" />
            <h3 className="font-semibold text-navy-900 mb-1">G702/G703 Guide</h3>
            <p className="text-sm text-gray-600">
              Understand AIA payment application forms.
            </p>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="py-6 text-center">
            <CreditCard className="h-8 w-8 text-construction-500 mx-auto mb-3" />
            <h3 className="font-semibold text-navy-900 mb-1">Billing & Plans</h3>
            <p className="text-sm text-gray-600">
              Manage your subscription and billing.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-gray-100">
            <div className="py-4">
              <h4 className="font-semibold text-navy-900 mb-2">
                How do I create my first pay application?
              </h4>
              <p className="text-gray-600 text-sm">
                First, create a project and set up your Schedule of Values. Then, from the
                project page, click &ldquo;Create Pay App&rdquo; to start your first payment application.
                Enter your work completed this period for each line item, and the system will
                automatically calculate totals, percentages, and retainage.
              </p>
            </div>

            <div className="py-4">
              <h4 className="font-semibold text-navy-900 mb-2">
                What&apos;s the difference between G702 and G703?
              </h4>
              <p className="text-gray-600 text-sm">
                The G702 is the main Application and Certificate for Payment — it shows the
                contract summary, retainage, and the amount due. The G703 is the Continuation
                Sheet that breaks down the work by line item (your Schedule of Values). They
                work together as a complete payment application package.
              </p>
            </div>

            <div className="py-4">
              <h4 className="font-semibold text-navy-900 mb-2">
                How does the carry-forward work?
              </h4>
              <p className="text-gray-600 text-sm">
                When you create a new pay application, BildPro automatically pulls in all
                previous billing data. The &ldquo;Work Completed — Previous Applications&rdquo; column
                shows what you&apos;ve already billed. You only need to enter the new work
                completed this period.
              </p>
            </div>

            <div className="py-4">
              <h4 className="font-semibold text-navy-900 mb-2">
                What happens when I add a change order?
              </h4>
              <p className="text-gray-600 text-sm">
                When you add an approved change order, it increases (or decreases for
                deductions) your contract sum. You can also add it as a new line item in
                your Schedule of Values. The G702 summary will automatically show the net
                change by change orders.
              </p>
            </div>

            <div className="py-4">
              <h4 className="font-semibold text-navy-900 mb-2">
                Can I edit a submitted pay application?
              </h4>
              <p className="text-gray-600 text-sm">
                Submitted pay applications are locked to maintain an accurate billing history.
                If you need to make changes, you can create a new pay application with
                corrected values. The carry-forward will still work correctly based on
                your historical data.
              </p>
            </div>

            <div className="py-4">
              <h4 className="font-semibold text-navy-900 mb-2">
                How do I remove the watermark from my PDFs?
              </h4>
              <p className="text-gray-600 text-sm">
                Upgrade to our Pro plan ($49/month) to generate PDFs without the BildPro
                watermark. Pro also includes unlimited projects, lien waiver templates,
                and PDF package bundling.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Can&apos;t find what you&apos;re looking for? Our support team is here to help.
          </p>
          <div className="flex gap-4">
            <a
              href="mailto:support@bildpro.io"
              className="inline-flex items-center gap-2 text-construction-500 hover:text-construction-600"
            >
              <Mail className="h-4 w-4" />
              support@bildpro.io
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <a
              href="https://www.aiacontracts.org/contract-documents/21621-2021-aia-g702-application-and-certificate-for-payment"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-navy-900">Official AIA G702 Information</p>
                <p className="text-sm text-gray-600">AIA Contract Documents website</p>
              </div>
            </a>

            <a
              href="#"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-navy-900">Sample Pay Application</p>
                <p className="text-sm text-gray-600">Download a completed example</p>
              </div>
            </a>

            <a
              href="#"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Calculator className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-navy-900">Retainage Calculator</p>
                <p className="text-sm text-gray-600">Understand retainage calculations</p>
              </div>
            </a>

            <a
              href="#"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Book className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-navy-900">Video Tutorials</p>
                <p className="text-sm text-gray-600">Step-by-step walkthrough videos</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
