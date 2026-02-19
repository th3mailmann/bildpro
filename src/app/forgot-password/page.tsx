'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Building2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button, Input, Alert } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setIsSubmitted(true);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2">
          <Building2 className="h-10 w-10 text-construction-500" />
          <span className="text-3xl font-bold text-navy-900">BildPro</span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-navy-900">
          Reset your password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm rounded-xl sm:px-10 border border-gray-200">
          {isSubmitted ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-navy-900 mb-2">Check your email</h3>
              <p className="text-sm text-gray-600 mb-6">
                We've sent a password reset link to <strong>{email}</strong>.
              </p>
              <Link href="/login" className="block w-full">
                <Button variant="outline" className="w-full">
                  Return to login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <Alert type="error" className="mb-6">
                  {error}
                </Alert>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@company.com"
                  autoComplete="email"
                />
                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Send reset link
                </Button>
                <div className="text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center text-sm font-medium text-construction-500 hover:text-construction-600"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
