import Link from 'next/link';
import {
  FileText,
  Calculator,
  Clock,
  CheckCircle,
  ArrowRight,
  Building2,
  Shield,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-construction-500" />
              <span className="text-2xl font-bold text-navy-900">BildPro</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-gray-600 hover:text-navy-900">
                How It Works
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-navy-900">
                Pricing
              </a>
              <Link href="/login" className="text-gray-600 hover:text-navy-900">
                Log In
              </Link>
              <Link href="/signup">
                <Button size="sm">Get Started Free</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy-900 leading-tight">
              Stop Losing Money on{' '}
              <span className="text-construction-500">Rejected Pay Apps</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
              Generate AIA-style G702/G703 payment applications in minutes. Free
              forever for up to 2 projects. No more Excel headaches.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                  Start Your First Pay App — Free
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" size="lg">
                  See How It Works
                </Button>
              </a>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              No credit card required • 2 free projects forever
            </p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-900">
              Sound Familiar?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-navy-900 mb-2">
                Every rejected pay app delays your payment 30–60 days
              </h3>
              <p className="text-gray-600">
                One math error, one missed carry-forward, and you&apos;re waiting another
                month for your money.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Calculator className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-navy-900 mb-2">
                Manual carry-forward errors cost you hours every month
              </h3>
              <p className="text-gray-600">
                Copying numbers from last month&apos;s spreadsheet, hoping you didn&apos;t miss
                a cell. There&apos;s a better way.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-navy-900 mb-2">
                You&apos;re doing math that a computer should do
              </h3>
              <p className="text-gray-600">
                Retainage calculations, balance to finish, percent complete — let the
                software handle it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-navy-900">
              How BildPro Works
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Three simple steps to professional pay applications
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-navy-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-navy-900 mb-3">
                Set Up Your Project Once
              </h3>
              <p className="text-gray-600">
                Enter your contract details and Schedule of Values. This is a one-time
                setup that powers all future pay apps.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-navy-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-navy-900 mb-3">
                Enter Only What Changed
              </h3>
              <p className="text-gray-600">
                Each month, just enter your progress this period. Previous billing data
                carries forward automatically.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-navy-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-navy-900 mb-3">
                Generate Professional PDFs
              </h3>
              <p className="text-gray-600">
                Download a complete G702/G703 package ready to submit. All calculations
                verified, all formatting perfect.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-start gap-4">
              <Zap className="h-6 w-6 text-construction-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Instant Calculations</h3>
                <p className="text-gray-300 text-sm">
                  Retainage, percent complete, and balance to finish calculated in
                  real-time.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle className="h-6 w-6 text-construction-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Error Prevention</h3>
                <p className="text-gray-300 text-sm">
                  Built-in validation catches overbilling and mismatched totals before
                  you submit.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <FileText className="h-6 w-6 text-construction-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">AIA-Style PDFs</h3>
                <p className="text-gray-300 text-sm">
                  Professional formatting that GCs and architects expect to see.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Shield className="h-6 w-6 text-construction-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Secure & Private</h3>
                <p className="text-gray-300 text-sm">
                  Your project data is encrypted and never shared with anyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-navy-900">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Start free, upgrade when you need more
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-8">
              <h3 className="text-xl font-bold text-navy-900">Free</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-navy-900">$0</span>
                <span className="text-gray-600">/forever</span>
              </div>
              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>2 active projects</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Unlimited pay applications</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>G702/G703 PDF generation</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <span className="h-5 w-5 flex items-center justify-center text-gray-300">&#10005;</span>
                  <span>PDF includes BildPro watermark</span>
                </li>
              </ul>
              <Link href="/signup" className="block mt-8">
                <Button variant="outline" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="bg-white rounded-xl border-2 border-construction-500 p-8 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-construction-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-xl font-bold text-navy-900">Pro</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-navy-900">$49</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Unlimited projects</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>No watermark on PDFs</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Lien waiver templates</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Change order tracking</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>PDF package bundling</span>
                </li>
              </ul>
              <Link href="/signup?plan=pro" className="block mt-8">
                <Button className="w-full">Get Started with Pro</Button>
              </Link>
            </div>

            {/* Business Tier */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-8">
              <h3 className="text-xl font-bold text-navy-900">Business</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-navy-900">$99</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Multi-user access</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>A/R dashboard</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Billing deadline reminders</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Priority support</span>
                </li>
              </ul>
              <Link href="/signup?plan=business" className="block mt-8">
                <Button variant="outline" className="w-full">
                  Get Started with Business
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-navy-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Never Get a Pay App Rejected Again?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Start saving hours every month on your pay applications.
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              variant="secondary"
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              Start Your First Pay App — Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-construction-500" />
              <span className="text-xl font-bold text-navy-900">BildPro</span>
            </div>
            <div className="flex gap-8 text-sm text-gray-600">
              <Link href="/terms" className="hover:text-navy-900">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-navy-900">
                Privacy Policy
              </Link>
              <a href="mailto:support@bildpro.io" className="hover:text-navy-900">
                Contact
              </a>
            </div>
            <p className="text-sm text-gray-500">
              © 2026 BildPro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
