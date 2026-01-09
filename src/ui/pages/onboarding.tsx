// =====================================================
// PRISM V2 - Onboarding Wizard
// Multi-step onboarding flow for new users
// =====================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input, Select } from '@/ui/components';
import { useAuth } from '@/domains/auth';
import { supabase } from '@/domains/auth/service';

type Step = 'welcome' | 'profile' | 'kyc' | 'bank' | 'communication' | 'preferences' | 'complete';

interface OnboardingState {
    step: Step;
    accountType: 'individual' | 'business' | null;
    profile: {
        fullName: string;
        phone: string;
        state: string;
        incomeSource: string;
        tin: string;
        // Business fields
        businessName: string;
        cacNumber: string;
        businessType: string;
        industry: string;
        turnoverRange: string;
        vatRegistered: boolean;
    };
    kycCompleted: boolean;
    bankConnected: boolean;
    communicationChannel: 'telegram' | 'whatsapp' | 'none' | null;
    preferences: {
        reminderDays: number;
        emailNotifications: boolean;
        appNotifications: boolean;
    };
}

const NIGERIAN_STATES = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
    'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
    'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
    'Yobe', 'Zamfara',
];

const INCOME_SOURCES = [
    { value: 'salary', label: 'Salary / Wages' },
    { value: 'freelance', label: 'Freelance / Consulting' },
    { value: 'business', label: 'Business Income' },
    { value: 'investments', label: 'Investments / Dividends' },
    { value: 'rental', label: 'Rental Income' },
    { value: 'mixed', label: 'Multiple Sources' },
];

const BUSINESS_TYPES = [
    { value: 'sole_proprietor', label: 'Sole Proprietorship' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'llc', label: 'Limited Liability Company (LLC)' },
    { value: 'ltd', label: 'Private Limited Company (Ltd)' },
    { value: 'plc', label: 'Public Limited Company (PLC)' },
];

const INDUSTRIES = [
    { value: 'technology', label: 'Technology / IT' },
    { value: 'retail', label: 'Retail / Trading' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'services', label: 'Professional Services' },
    { value: 'hospitality', label: 'Hospitality / Food' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'construction', label: 'Construction' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'other', label: 'Other' },
];

export function OnboardingPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [state, setState] = useState<OnboardingState>({
        step: 'welcome',
        accountType: null,
        profile: {
            fullName: '',
            phone: '',
            state: '',
            incomeSource: '',
            tin: '',
            businessName: '',
            cacNumber: '',
            businessType: '',
            industry: '',
            turnoverRange: '',
            vatRegistered: false,
        },
        kycCompleted: false,
        bankConnected: false,
        communicationChannel: null,
        preferences: {
            reminderDays: 3,
            emailNotifications: true,
            appNotifications: true,
        },
    });

    const updateProfile = (field: string, value: string | boolean) => {
        setState(prev => ({
            ...prev,
            profile: { ...prev.profile, [field]: value },
        }));
    };

    const goToStep = (step: Step) => {
        setState(prev => ({ ...prev, step }));
    };

    const saveProgress = async () => {
        if (!user) return;
        // TODO: Create onboarding_progress table in database
        console.log('Saving onboarding progress:', {
            user_id: user.id,
            current_step: state.step,
            account_type: state.accountType,
            profile_data: state.profile,
        });
    };

    const completeOnboarding = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Update user profile
            await supabase.from('users').update({
                full_name: state.profile.fullName,
                phone: state.profile.phone,
                onboarding_complete: true,
            }).eq('auth_user_id', user.id);

            goToStep('complete');
        } catch (error) {
            console.error('Error completing onboarding:', error);
        } finally {
            setLoading(false);
        }
    };

    // Save progress on step change
    useEffect(() => {
        if (state.step !== 'welcome' && state.step !== 'complete') {
            saveProgress();
        }
    }, [state.step]);

    const steps: { key: Step; label: string }[] = [
        { key: 'welcome', label: 'Welcome' },
        { key: 'profile', label: 'Profile' },
        { key: 'kyc', label: 'Identity' },
        { key: 'bank', label: 'Bank' },
        { key: 'communication', label: 'Comms' },
        { key: 'preferences', label: 'Preferences' },
    ];

    const currentStepIndex = steps.findIndex(s => s.key === state.step);
    const progress = ((currentStepIndex + 1) / steps.length) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-b from-[hsl(248,80%,36%)] to-[hsl(240,27%,10%)] flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                {/* Progress Bar */}
                {state.step !== 'welcome' && state.step !== 'complete' && (
                    <div className="mb-6">
                        <div className="flex justify-between text-xs text-white/60 mb-2">
                            {steps.map((s, i) => (
                                <span
                                    key={s.key}
                                    className={i <= currentStepIndex ? 'text-white' : ''}
                                >
                                    {s.label}
                                </span>
                            ))}
                        </div>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Step 1: Welcome */}
                {state.step === 'welcome' && (
                    <Card className="text-center">
                        <span className="text-6xl mb-6 block">👋</span>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Welcome to PRISM!
                        </h1>
                        <p className="text-gray-500 mb-8">
                            Let's set up your Nigerian tax assistant in just a few steps.
                        </p>
                        <p className="text-sm text-gray-500 mb-6">First, tell us about yourself:</p>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => {
                                    setState(prev => ({ ...prev, accountType: 'individual' }));
                                    goToStep('profile');
                                }}
                                className="p-6 rounded-2xl border-2 border-gray-200 dark:border-[hsl(240,24%,30%)] hover:border-[hsl(248,80%,36%)] transition-colors text-center"
                            >
                                <span className="text-4xl block mb-2">👤</span>
                                <p className="font-semibold text-gray-900 dark:text-white">Individual</p>
                                <p className="text-xs text-gray-500">Freelancer, salary earner</p>
                            </button>
                            <button
                                onClick={() => {
                                    setState(prev => ({ ...prev, accountType: 'business' }));
                                    goToStep('profile');
                                }}
                                className="p-6 rounded-2xl border-2 border-gray-200 dark:border-[hsl(240,24%,30%)] hover:border-[hsl(248,80%,36%)] transition-colors text-center"
                            >
                                <span className="text-4xl block mb-2">🏢</span>
                                <p className="font-semibold text-gray-900 dark:text-white">Business</p>
                                <p className="text-xs text-gray-500">Company, SME</p>
                            </button>
                        </div>
                    </Card>
                )}

                {/* Step 2: Profile */}
                {state.step === 'profile' && (
                    <Card>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                            {state.accountType === 'individual' ? '👤 Personal Details' : '🏢 Business Details'}
                        </h2>

                        {state.accountType === 'individual' ? (
                            <div className="space-y-4">
                                <Input
                                    label="Full Name"
                                    value={state.profile.fullName}
                                    onChange={(e) => updateProfile('fullName', e.target.value)}
                                    placeholder="John Adebayo"
                                />
                                <Input
                                    label="Phone Number"
                                    type="tel"
                                    value={state.profile.phone}
                                    onChange={(e) => updateProfile('phone', e.target.value)}
                                    placeholder="+234 XXX XXX XXXX"
                                />
                                <Select
                                    label="State of Residence"
                                    value={state.profile.state}
                                    onChange={(e) => updateProfile('state', e.target.value)}
                                    options={[
                                        { value: '', label: 'Select state...' },
                                        ...NIGERIAN_STATES.map(s => ({ value: s, label: s })),
                                    ]}
                                />
                                <Select
                                    label="Primary Income Source"
                                    value={state.profile.incomeSource}
                                    onChange={(e) => updateProfile('incomeSource', e.target.value)}
                                    options={[{ value: '', label: 'Select...' }, ...INCOME_SOURCES]}
                                />
                                <Input
                                    label="Tax Identification Number (Optional)"
                                    value={state.profile.tin}
                                    onChange={(e) => updateProfile('tin', e.target.value)}
                                    placeholder="12345678-0001"
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Input
                                    label="Business Name"
                                    value={state.profile.businessName}
                                    onChange={(e) => updateProfile('businessName', e.target.value)}
                                    placeholder="Acme Nigeria Ltd"
                                />
                                <Input
                                    label="CAC Registration Number"
                                    value={state.profile.cacNumber}
                                    onChange={(e) => updateProfile('cacNumber', e.target.value)}
                                    placeholder="RC123456"
                                />
                                <Select
                                    label="Business Type"
                                    value={state.profile.businessType}
                                    onChange={(e) => updateProfile('businessType', e.target.value)}
                                    options={[{ value: '', label: 'Select...' }, ...BUSINESS_TYPES]}
                                />
                                <Select
                                    label="Industry"
                                    value={state.profile.industry}
                                    onChange={(e) => updateProfile('industry', e.target.value)}
                                    options={[{ value: '', label: 'Select...' }, ...INDUSTRIES]}
                                />
                                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-[hsl(240,24%,26%)] rounded-xl">
                                    <input
                                        type="checkbox"
                                        id="vatRegistered"
                                        checked={state.profile.vatRegistered}
                                        onChange={(e) => updateProfile('vatRegistered', e.target.checked)}
                                        className="w-5 h-5"
                                    />
                                    <label htmlFor="vatRegistered" className="text-sm">
                                        This business is VAT registered
                                    </label>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 mt-6">
                            <Button variant="ghost" onClick={() => goToStep('welcome')}>Back</Button>
                            <Button fullWidth onClick={() => goToStep('kyc')}>Continue</Button>
                        </div>
                    </Card>
                )}

                {/* Step 3: KYC */}
                {state.step === 'kyc' && (
                    <Card>
                        <div className="text-center mb-6">
                            <span className="text-5xl block mb-4">🛡️</span>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Verify Your Identity
                            </h2>
                            <p className="text-gray-500 text-sm mt-2">
                                Optional but recommended for full features
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <button className="p-4 rounded-xl border-2 border-gray-200 dark:border-[hsl(240,24%,30%)] hover:border-[hsl(248,80%,36%)] text-center">
                                <span className="text-2xl block mb-2">📱</span>
                                <p className="font-medium text-sm">NIN</p>
                                <p className="text-xs text-gray-500">11 digits</p>
                            </button>
                            <button className="p-4 rounded-xl border-2 border-gray-200 dark:border-[hsl(240,24%,30%)] hover:border-[hsl(248,80%,36%)] text-center">
                                <span className="text-2xl block mb-2">🏦</span>
                                <p className="font-medium text-sm">BVN</p>
                                <p className="text-xs text-gray-500">11 digits</p>
                            </button>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="ghost" onClick={() => goToStep('profile')}>Back</Button>
                            <Button variant="outline" fullWidth onClick={() => goToStep('bank')}>
                                Skip for Now
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Step 4: Bank */}
                {state.step === 'bank' && (
                    <Card>
                        <div className="text-center mb-6">
                            <span className="text-5xl block mb-4">🏦</span>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Connect Your Bank
                            </h2>
                            <p className="text-gray-500 text-sm mt-2">
                                PRISM auto-tracks transactions to calculate taxes
                            </p>
                        </div>

                        <Button fullWidth className="mb-4">
                            🔗 Connect with Mono
                        </Button>

                        <div className="space-y-2 text-sm text-gray-500 mb-6">
                            <p>✅ Read-only access</p>
                            <p>✅ Bank-grade security (CBN licensed)</p>
                            <p>✅ Can disconnect anytime</p>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="ghost" onClick={() => goToStep('kyc')}>Back</Button>
                            <Button variant="outline" fullWidth onClick={() => goToStep('communication')}>
                                Skip for Now
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Step 5: Communication */}
                {state.step === 'communication' && (
                    <Card>
                        <div className="text-center mb-6">
                            <span className="text-5xl block mb-4">📱</span>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Stay Updated
                            </h2>
                            <p className="text-gray-500 text-sm mt-2">
                                Get tax reminders and chat with PRISM
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <button
                                onClick={() => setState(prev => ({ ...prev, communicationChannel: 'telegram' }))}
                                className={`p-4 rounded-xl border-2 text-center transition-colors ${state.communicationChannel === 'telegram'
                                        ? 'border-[#0088cc] bg-[#0088cc]/10'
                                        : 'border-gray-200 dark:border-[hsl(240,24%,30%)]'
                                    }`}
                            >
                                <span className="text-2xl block mb-2">📱</span>
                                <p className="font-medium text-sm">Telegram</p>
                            </button>
                            <button
                                onClick={() => setState(prev => ({ ...prev, communicationChannel: 'whatsapp' }))}
                                className={`p-4 rounded-xl border-2 text-center transition-colors ${state.communicationChannel === 'whatsapp'
                                        ? 'border-[#25D366] bg-[#25D366]/10'
                                        : 'border-gray-200 dark:border-[hsl(240,24%,30%)]'
                                    }`}
                            >
                                <span className="text-2xl block mb-2">📲</span>
                                <p className="font-medium text-sm">WhatsApp</p>
                            </button>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="ghost" onClick={() => goToStep('bank')}>Back</Button>
                            <Button fullWidth onClick={() => goToStep('preferences')}>
                                {state.communicationChannel ? 'Continue' : 'Skip'}
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Step 6: Preferences */}
                {state.step === 'preferences' && (
                    <Card>
                        <div className="text-center mb-6">
                            <span className="text-5xl block mb-4">⚙️</span>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Almost Done!
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white mb-2">
                                    Tax Deadline Reminders
                                </p>
                                <div className="flex gap-2">
                                    {[7, 3, 1].map(days => (
                                        <button
                                            key={days}
                                            onClick={() => setState(prev => ({
                                                ...prev,
                                                preferences: { ...prev.preferences, reminderDays: days },
                                            }))}
                                            className={`flex-1 py-2 rounded-xl text-sm ${state.preferences.reminderDays === days
                                                    ? 'bg-[hsl(248,80%,36%)] text-white'
                                                    : 'bg-gray-100 dark:bg-[hsl(240,24%,26%)]'
                                                }`}
                                        >
                                            {days} day{days > 1 ? 's' : ''}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="font-medium text-gray-900 dark:text-white">
                                    Notifications
                                </p>
                                {[
                                    { key: 'emailNotifications', label: 'Email notifications' },
                                    { key: 'appNotifications', label: 'In-app notifications' },
                                ].map(item => (
                                    <div key={item.key} className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={state.preferences[item.key as keyof typeof state.preferences] as boolean}
                                                onChange={(e) => setState(prev => ({
                                                    ...prev,
                                                    preferences: { ...prev.preferences, [item.key]: e.target.checked },
                                                }))}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[hsl(248,80%,36%)]" />
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button variant="ghost" onClick={() => goToStep('communication')}>Back</Button>
                            <Button fullWidth loading={loading} onClick={completeOnboarding}>
                                Complete Setup
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Step 7: Complete */}
                {state.step === 'complete' && (
                    <Card className="text-center">
                        <span className="text-6xl mb-6 block">🎉</span>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            You're All Set!
                        </h1>
                        <p className="text-gray-500 mb-8">
                            Your PRISM account is ready to help with Nigerian taxes.
                        </p>

                        <div className="space-y-3 text-left mb-8">
                            {[
                                { icon: '📊', label: 'Dashboard', desc: 'View your financial overview' },
                                { icon: '🏦', label: 'Transactions', desc: 'See categorized transactions' },
                                { icon: '📚', label: 'Education', desc: 'Learn about Nigerian taxes' },
                            ].map(item => (
                                <div key={item.label} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[hsl(240,24%,26%)] rounded-xl">
                                    <span className="text-xl">{item.icon}</span>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                                        <p className="text-xs text-gray-500">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button fullWidth onClick={() => navigate('/dashboard')}>
                            🚀 Go to Dashboard
                        </Button>
                    </Card>
                )}
            </div>
        </div>
    );
}
