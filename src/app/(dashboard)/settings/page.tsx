'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Badge, Alert } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { User, Building2, CreditCard, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import type { User as UserType } from '@/lib/types';

export default function SettingsPage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');

  useEffect(() => {
    loadUserData();

    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      toast.success('Subscription activated! Welcome to your new plan.');
      window.history.replaceState({}, '', '/settings');
    }
    if (params.get('canceled') === 'true') {
      toast('Checkout canceled.', { icon: 'ℹ️' });
      window.history.replaceState({}, '', '/settings');
    }
  }, []);

  const loadUserData = async () => {
    const supabase = createClient();
    
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (authUser) {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        setUser(profile);
        setCompanyName(profile.company_name || '');
        setCompanyAddress(profile.company_address || '');
        setCompanyPhone(profile.company_phone || '');
        setLogoUrl(profile.company_logo_url || null);
      }
    }

    setIsLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('users')
        .update({
          company_name: companyName,
          company_address: companyAddress,
          company_phone: companyPhone,
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCheckout = async (tier: 'pro' | 'business') => {
    setIsCheckoutLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Something went wrong');
      }
    } catch {
      toast.error('Failed to start checkout');
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      toast.error('Only PNG and JPG files are allowed');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File must be under 2MB');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const res = await fetch('/api/logo/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setLogoUrl(data.url);
        toast.success('Logo uploaded successfully');
      } else {
        toast.error(data.error || 'Failed to upload logo');
      }
    } catch {
      toast.error('Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Something went wrong');
      }
    } catch {
      toast.error('Failed to open billing portal');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Settings</h1>
          <p className="text-gray-600 mt-1">Loading...</p>
        </div>
      </div>
    );
  }

  const tierColors = {
    free: 'default' as const,
    pro: 'success' as const,
    business: 'info' as const,
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account and company settings.
        </p>
      </div>

      {/* Company Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-navy-100 rounded-full flex items-center justify-center">
              <Building2 className="h-5 w-5 text-navy-600" />
            </div>
            <CardTitle>Company Profile</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Input
              label="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Your Construction Co."
            />

            <Input
              label="Company Address"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              placeholder="123 Main St, City, State ZIP"
              hint="This will appear on your pay applications"
            />

            <Input
              label="Phone Number"
              type="tel"
              value={companyPhone}
              onChange={(e) => setCompanyPhone(e.target.value)}
              placeholder="(555) 123-4567"
            />

            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} isLoading={isSaving}>
                Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-construction-100 rounded-full flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-construction-600" />
              </div>
              <CardTitle>Subscription</CardTitle>
            </div>
            <Badge variant={tierColors[user?.subscription_tier || 'free']} size="md">
              {user?.subscription_tier?.charAt(0).toUpperCase()}
              {user?.subscription_tier?.slice(1)} Plan
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {user?.subscription_tier === 'free' ? (
            <div className="space-y-4">
              <Alert type="info">
                You&apos;re on the <strong>Free plan</strong> with 2 active projects.
                Upgrade to Pro for unlimited projects, no watermarks, and more features.
              </Alert>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-navy-900 mb-2">Pro — $49/month</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>✓ Unlimited projects</li>
                    <li>✓ No watermark on PDFs</li>
                    <li>✓ Lien waiver templates</li>
                    <li>✓ Change order tracking</li>
                    <li>✓ PDF package bundling</li>
                  </ul>
                  <Button
                    className="w-full mt-4"
                    variant="secondary"
                    onClick={() => handleCheckout('pro')}
                    isLoading={isCheckoutLoading}
                  >
                    Upgrade to Pro
                  </Button>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-navy-900 mb-2">Business — $99/month</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>✓ Everything in Pro</li>
                    <li>✓ Multi-user access</li>
                    <li>✓ A/R dashboard</li>
                    <li>✓ Billing reminders</li>
                    <li>✓ Priority support</li>
                  </ul>
                  <Button
                    className="w-full mt-4"
                    variant="outline"
                    onClick={() => handleCheckout('business')}
                    isLoading={isCheckoutLoading}
                  >
                    Upgrade to Business
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-navy-900">
                    {user?.subscription_tier === 'pro' ? 'Pro' : 'Business'} Plan
                  </p>
                  <p className="text-sm text-gray-600">
                    ${user?.subscription_tier === 'pro' ? '49' : '99'}/month
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleManageSubscription}>
                  Manage Subscription
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PDF Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle>PDF Preferences</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Logo
              </label>
              {user?.subscription_tier !== 'free' ? (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Company logo"
                        className="h-16 mx-auto mb-3 object-contain"
                      />
                    ) : (
                      <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    )}
                    <p className="text-sm text-gray-600">
                      {logoUrl ? 'Click below to replace your logo' : 'Drag and drop your logo, or click to browse'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG up to 2MB. Will appear on your G702 documents.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => fileInputRef.current?.click()}
                      isLoading={isUploading}
                    >
                      {logoUrl ? 'Replace Logo' : 'Upload Logo'}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Upload your company logo to appear on G702 documents.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG up to 2MB.
                    </p>
                  </div>
                  <Alert type="info">
                    Logo upload requires a Pro or Business subscription.
                  </Alert>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-gray-600" />
            </div>
            <CardTitle>Account</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <p className="text-gray-900">{user?.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Member Since
              </label>
              <p className="text-gray-900">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </div>

            <div className="pt-4 border-t">
              <Button variant="outline" className="text-red-600 hover:bg-red-50">
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
