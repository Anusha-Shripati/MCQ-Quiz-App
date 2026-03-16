'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  CircleGauge,
  Layers,
  Lock,
  MonitorSmartphone,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/form/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/common/theme-toggle';
import ImageLinks from '@/app/assets/images/image-links';

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Security', href: '#security' },
];

const featureCards = [
  {
    title: 'Question Bank at Scale',
    description:
      'Create and manage MCQs, coding, video, and text questions with category-level control and bulk import.',
    icon: Layers,
  },
  {
    title: 'Candidate & Exam Orchestration',
    description:
      'Assign assessments, schedule exam windows, and track candidate progress in one streamlined workflow.',
    icon: Users,
  },
  {
    title: 'Proctored Test Experience',
    description:
      'Built-in camera checks, screen sharing, integrity snapshots, and violation tracking for reliable remote exams.',
    icon: ShieldCheck,
  },
  {
    title: 'Real-time Analytics',
    description:
      'Get actionable insights across score trends, technology-wise strengths, and assessment performance.',
    icon: BarChart3,
  },
  {
    title: 'Multi-Tenant SaaS Ready',
    description:
      'Each organization runs in isolated context with role-based access, plan limits, and secure data boundaries.',
    icon: Lock,
  },
  {
    title: 'Cross-Device Friendly',
    description:
      'Fast, responsive flows for admins and candidates across desktop and modern browsers.',
    icon: MonitorSmartphone,
  },
];

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    description: 'For early teams validating their hiring workflow.',
    points: ['Create up to 10 candidates/month', 'Create 5 assessments/month', 'Create 50 questions/month', 'Basic analytics', 'All created data retained forever'],
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$99',
    description: 'For growing teams running frequent assessments.',
    points: ['Create up to 100 candidates/month', 'Create 50 assessments/month', 'Create 500 questions/month', 'Advanced analytics', 'Unlimited data retention'],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For scale, compliance, and advanced governance needs.',
    points: ['Unlimited monthly creation limits', 'Priority support', 'Custom onboarding', 'Extended controls', 'Full data ownership'],
    highlighted: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50 text-slate-900 dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 dark:text-slate-100 scroll-smooth w-full">
      <div className="fixed inset-x-0 top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/80">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center">
            <Image
              src={ImageLinks.logicrays_logo_bg}
              alt="LogicRays Logo"
              width={155}
              height={42}
              className="h-11 w-auto object-contain dark:hidden"
              priority
            />
            <Image
              src={ImageLinks.logicrays_logo_bg_white}
              alt="LogicRays Logo"
              width={155}
              height={42}
              className="hidden h-9 w-auto object-contain dark:block"
              priority
            />
            <span className="ml-4 text-lg font-semibold text-slate-700 dark:text-slate-200">LR-MCQ</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-sky-300"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link href="/organization-login" className="hidden sm:block">
              <Button variant="outline" className="border-slate-300 bg-white/80 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-blue-600 text-white hover:bg-blue-500 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <main className="relative overflow-hidden pt-24">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-20 top-24 h-72 w-72 rounded-full bg-blue-200/60 blur-3xl dark:bg-blue-500/20" />
          <div className="absolute right-0 top-10 h-80 w-80 rounded-full bg-cyan-200/60 blur-3xl dark:bg-cyan-400/20" />
        </div>

        <section className="mx-auto w-full max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/90 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm dark:border-blue-700/40 dark:bg-slate-800 dark:text-sky-300">
                <BadgeCheck className="h-3.5 w-3.5" />
                Multi-tenant assessment platform for modern teams
              </div>
              <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                Run smarter assessments with a platform built for scale.
              </h1>
              <p className="mt-5 max-w-xl text-base text-slate-600 dark:text-slate-300 sm:text-lg">
                LR-MCQ helps organizations create structured evaluations, enforce exam integrity,
                and make faster hiring decisions with real-time analytics.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/signup">
                  <Button className="h-11 bg-blue-600 px-6 text-white hover:bg-blue-500 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400">
                    Request Access
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/request-status">
                  <Button variant="outline" className="h-11 border-slate-300 bg-white/90 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700">
                    Track Request Status
                  </Button>
                </Link>
              </div>
            </div>

            <Card className="border-slate-200 bg-white/90 shadow-xl dark:border-slate-700 dark:bg-slate-800/80">
              <CardContent className="space-y-5 p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Platform Insights</span>
                  <CircleGauge className="h-4 w-4 text-blue-500" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-xs text-slate-500">Question Types</p>
                    <p className="mt-1 text-2xl font-bold">7+</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-xs text-slate-500">Tenant Isolation</p>
                    <p className="mt-1 text-2xl font-bold">100%</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-xs text-slate-500">Billing Model</p>
                    <p className="mt-1 text-2xl font-bold">Creation</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-xs text-slate-500">Exam Integrity</p>
                    <p className="mt-1 text-2xl font-bold">Proctored</p>
                  </div>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Pay for creation capacity, not storage. All your data stays with you forever as you grow.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="features" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-sky-400">Features</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Everything you need to run technical assessments</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featureCards.map(({ title, description, icon: Icon }) => (
              <Card key={title} className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-sky-500/20 dark:text-sky-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="bg-indigo-50/60 py-16 dark:bg-slate-900/40">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-sky-400">How It Works</p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Launch your assessment workflow in three steps</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {[
                'Create your organization and configure role-based access.',
                'Build assessments with technology-wise and difficulty-wise distribution.',
                'Invite candidates, run proctored exams, and analyze outcomes instantly.',
              ].map((text, i) => (
                <Card key={text} className="border-slate-200 dark:border-slate-700 dark:bg-slate-800">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white dark:bg-sky-500 dark:text-slate-950">
                      {i + 1}
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-sky-400">Pricing</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Flexible plans for every stage</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={`border ${
                  plan.highlighted
                    ? 'border-blue-500 bg-blue-50 shadow-lg dark:border-sky-400 dark:bg-sky-500/10'
                    : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
                }`}
              >
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="mt-2 text-3xl font-extrabold">{plan.price}</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{plan.description}</p>
                  <div className="mt-5 space-y-2">
                    {plan.points.map((point) => (
                      <div key={point} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
                        <Check className="mt-0.5 h-4 w-4 text-blue-500 dark:text-sky-400" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/signup" className="mt-6 block">
                    <Button className="w-full bg-blue-600 text-white hover:bg-blue-500 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400">
                      Choose {plan.name}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="security" className="bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600 py-16 text-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 dark:text-slate-100">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-cyan-100 dark:text-sky-300">Security & Trust</p>
                <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Designed for reliable, isolated, and auditable assessments</h2>
                <p className="mt-4 text-sm text-slate-100/90 dark:text-slate-300 sm:text-base">
                  LR-MCQ is built with tenant-level isolation, permission-driven access, and exam integrity workflows to support secure hiring operations.
                </p>
              </div>
              <div className="space-y-3">
                {[
                  'Database-per-tenant architecture for strict isolation',
                  'Role and permission controls for admin operations',
                  'Usage limits and subscription status enforcement',
                  'Exam-time security events and evidence capture',
                ].map((line) => (
                  <div
                    key={line}
                    className="flex items-start gap-2 rounded-xl border border-white/30 bg-white/15 p-4 text-sm backdrop-blur dark:border-slate-700 dark:bg-slate-800"
                  >
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-cyan-100 dark:text-sky-400" />
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white/90 py-8 dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-slate-600 sm:flex-row sm:px-6 lg:px-8 dark:text-slate-300">
          <p>© {new Date().getFullYear()} LR-MCQ. Built for modern assessment workflows.</p>
          <div className="flex items-center gap-4">
            <Link href="/signup" className="hover:text-slate-900 dark:hover:text-white">Request Access</Link>
            <Link href="/organization-login" className="hover:text-slate-900 dark:hover:text-white">Organization Login</Link>
            <Link href="/request-status" className="hover:text-slate-900 dark:hover:text-white">Request Status</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
