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
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-navy-900">Sound Familiar?</h2>
          </div>
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="h-12 w-12 bg-red-50 rounded-lg flex items-center justify-center mb-6">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-4">
                Every rejected pay app delays your payment 30–60 days
              </h3>
              <p className="text-gray-600">
                One math error, one missed carry-forward, and you're waiting
                another month for your money.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="h-12 w-12 bg-amber-50 rounded-lg flex items-center justify-center mb-6">
                <Calculator className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-4">
                Manual carry-forward errors cost you hours every month
              </h3>
              <p className="text-gray-600">
                Copying numbers from last month's spreadsheet, hoping you didn't
                miss a cell. There's a better way.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-4">
                You're doing math that a computer should do
              </h3>
              <p className="text-gray-600">
                Retainage calculations, balance to finish, percent complete — let
                the software handle it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-navy-900">How BildPro Works</h2>
            <p className="mt-4 text-lg text-gray-600">
              Three simple steps to professional pay applications
            </p>
          </div>
          <div className="mt-20 grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="h-16 w-16 bg-navy-900 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-4">
                Set Up Your Project Once
              </h3>
              <p className="text-gray-600">
                Enter your contract details and Schedule of Values. This is a
                one-time setup that powers all future pay apps.
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 bg-navy-900 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-4">
                Enter Only What Changed
              </h3>
              <p className="text-gray-600">
                Each month, just enter your progress this period. Previous
                billing data carries forward automatically.
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 bg-navy-900 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-4">
                Generate Professional PDFs
              </h3>
              <p className="text-gray-600">
                Download a complete G702/G703 package ready to submit. All
                calculations verified, all formatting perfect.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex gap-4">
              <Zap className="h-6 w-6 text-construction-500 shrink-0" />
              <div>
                <h3 className="font-bold mb-2">Instant Calculations</h3>
                <p className="text-navy-100 text-sm">
                  Retainage, percent complete, and balance to finish calculated in
                  real-time.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="h-6 w-6 text-construction-500 shrink-0" />
              <div>
                <h3 className="font-bold mb-2">Error Prevention</h3>
                <p className="text-navy-100 text-sm">
                  Built-in validation catches overbilling and mismatched totals
                  before you submit.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <FileText className="h-6 w-6 text-construction-500 shrink-0" />
              <div>
                <h3 className="font-bold mb-2">AIA-Style PDFs</h3>
                <p className="text-navy-100 text-sm">
                  Professional formatting that GCs and architects expect to see.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Shield className="h-6 w-6 text-construction-500 shrink-0" />
              <div>
                <h3 className="font-bold mb-2">Secure & Private</h3>
                <p className="text-navy-100 text-sm">
                  Your project data is encrypted and never shared with anyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-navy-900">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {/* Free Tier */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
              <h3 className="text-lg font-bold text-navy-900">Free</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold text-navy-900">$0</span>
                <span className="ml-1 text-gray-500">/forever</span>
              </div>
              <ul className="mt-8 space-y-4 flex-grow">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600">2 active projects</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600">Unlimited pay applications</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600">G702/G703 PDF generation</span>
                </li>
                <li className="flex items-center gap-3 opacity-60">
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  <span className="text-gray-500">BildPro watermark on PDF</span>
                </li>
              </ul>
              <Link href="/signup">
                <Button className="w-full mt-8" variant="outline">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="bg-white p-8 rounded-2xl shadow-md border-2 border-construction-500 flex flex-col relative scale-105">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-construction-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                Most Popular
              </div>
              <h3 className="text-lg font-bold text-navy-900">Pro</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold text-navy-900">$49</span>
                <span className="ml-1 text-gray-500">/month</span>
              </div>
              <ul className="mt-8 space-y-4 flex-grow">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600">Unlimited projects</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600">No watermark on PDFs</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600">Lien waiver templates</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600">Change order tracking</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600">PDF package bundling</span>
                </li>
              </ul>
              <Link href="/signup?plan=pro">
                <Button className="w-full mt-8">Start 14-Day Trial</Button>
              </Link>
            </div>

            {/* Business Tier */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
              <h3 className="text-lg font-bold text-navy-900">Business</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold text-navy-900">$99</span>
                <span className="ml-1 text-gray-500">/month</span>
              </div>
              <ul className="mt-8 space-y-4 flex-grow">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600">Everything in Pro</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600">Multi-user access</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600">A/R dashboard</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600">Billing deadline reminders</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600">Priority support</span>
                </li>
              </ul>
              <Link href="/signup?plan=business">
                <Button className="w-full mt-8" variant="outline">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900">
            Ready to Never Get a Pay App Rejected Again?
          </h2>
          <p className="mt-6 text-xl text-gray-600">
            Join contractors who save hours every month with BildPro.
          </p>
          <Link href="/signup">
            <Button size="lg" className="mt-10 bg-orange-600 hover:bg-orange-700">
              Start Your First Pay App — Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-construction-500" />
              <span className="text-xl font-bold text-navy-900">BildPro</span>
            </div>
            <div className="flex gap-8">
              <Link href="/terms" className="text-sm text-gray-500 hover:text-navy-900">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-navy-900">
                Privacy Policy
              </Link>
              <Link href="/contact" className="text-sm text-gray-500 hover:text-navy-900">
                Contact
              </Link>
            </div>
            <p className="text-sm text-gray-400">
              © 2026 BildPro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
