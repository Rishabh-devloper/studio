import { SignInButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, TrendingUp, Target, BarChart3, Smartphone, Lock, Zap } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const user = await currentUser();
  
  // Redirect signed-in users to dashboard
  if (user) {
    redirect("/dashboard");
  }
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[size:32px_32px]" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center rounded-full border bg-background/60 px-4 py-2 text-sm backdrop-blur-sm">
              <Shield className="mr-2 h-4 w-4 text-primary" aria-hidden="true" />
              <span className="font-medium">Bank-level security for your financial data</span>
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              Take Control of Your{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Financial Future
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Smart budgeting, intelligent tracking, and goal-driven savings—all in one beautiful platform. 
              Join thousands managing their wealth wisely.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <SignInButton mode="modal">
                <Button size="lg" className="group h-12 gap-2 px-8 text-base font-semibold shadow-lg transition-all hover:shadow-xl" aria-label="Get started with WealthWise">
                  Get Started Free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Button>
              </SignInButton>
              <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base font-semibold">
                <a href="#features">Learn More</a>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              No credit card required • Free forever • 2 minutes setup
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">10K+</div>
              <div className="mt-2 text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">$2M+</div>
              <div className="mt-2 text-sm text-muted-foreground">Money Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">50K+</div>
              <div className="mt-2 text-sm text-muted-foreground">Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">98%</div>
              <div className="mt-2 text-sm text-muted-foreground">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Everything you need to manage your finances
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful features designed to simplify your financial life
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8" aria-hidden="true" />}
              title="Smart Analytics"
              description="Visualize your spending patterns with beautiful charts and insights that help you make better financial decisions."
            />
            <FeatureCard
              icon={<Target className="h-8 w-8" aria-hidden="true" />}
              title="Goal Tracking"
              description="Set financial goals and track your progress. From emergency funds to dream vacations, we keep you on track."
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8" aria-hidden="true" />}
              title="Budget Management"
              description="Create custom budgets for each category and get real-time alerts when you're approaching your limits."
            />
            <FeatureCard
              icon={<Smartphone className="h-8 w-8" aria-hidden="true" />}
              title="Fully Responsive"
              description="Access your finances anywhere, anytime. Perfect experience on desktop, tablet, and mobile devices."
            />
            <FeatureCard
              icon={<Lock className="h-8 w-8" aria-hidden="true" />}
              title="Bank-Level Security"
              description="Your data is encrypted and protected with the same security standards used by major financial institutions."
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8" aria-hidden="true" />}
              title="AI-Powered Insights"
              description="Get intelligent suggestions for transaction categorization and personalized financial recommendations."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Get started in minutes
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Three simple steps to financial clarity
            </p>
          </div>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            <StepCard number="1" title="Create Account" description="Sign up in seconds with your email or social account. No lengthy forms." />
            <StepCard number="2" title="Add Transactions" description="Manually add transactions or connect your accounts for automatic tracking." />
            <StepCard number="3" title="Track & Optimize" description="Watch your money flow, set goals, and make smarter financial decisions." />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Loved by users worldwide
            </h2>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <TestimonialCard
              quote="WealthWise transformed how I manage money. I've saved $5,000 in just 6 months!"
              author="Sarah Johnson"
              role="Marketing Manager"
            />
            <TestimonialCard
              quote="The goal tracking feature helped me finally save for my dream vacation. Highly recommend!"
              author="Michael Chen"
              role="Software Engineer"
            />
            <TestimonialCard
              quote="Beautiful UI, powerful features. This is the personal finance app I've been waiting for."
              author="Emma Williams"
              role="Freelance Designer"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground sm:py-28">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]" aria-hidden="true" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Ready to take control of your finances?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg opacity-90">
            Join thousands of users who are already managing their wealth wisely. Get started for free today.
          </p>
          <div className="mt-10">
            <SignInButton mode="modal">
              <Button size="lg" variant="secondary" className="group h-12 gap-2 px-8 text-base font-semibold shadow-lg transition-all hover:shadow-xl" aria-label="Start your journey with WealthWise">
                Start Your Journey
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Button>
            </SignInButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="text-center sm:text-left">
              <p className="text-xl font-bold">WealthWise</p>
              <p className="mt-1 text-sm text-muted-foreground">Smart financial management for everyone</p>
            </div>
            <nav className="flex gap-6" aria-label="Footer">
              <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded">Privacy</Link>
              <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded">Terms</Link>
              <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded">Contact</Link>
            </nav>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} WealthWise. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <article className="group relative rounded-xl border bg-card p-8 shadow-sm transition-all hover:shadow-md focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
      <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
        {icon}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-3 text-muted-foreground">{description}</p>
    </article>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <article className="relative text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground shadow-lg">
        {number}
      </div>
      <h3 className="mt-6 text-xl font-semibold">{title}</h3>
      <p className="mt-3 text-muted-foreground">{description}</p>
    </article>
  );
}

function TestimonialCard({ quote, author, role }: { quote: string; author: string; role: string }) {
  return (
    <article className="rounded-xl border bg-card p-8 shadow-sm">
      <blockquote>
        <p className="text-lg italic leading-relaxed text-muted-foreground">"{quote}"</p>
      </blockquote>
      <div className="mt-6 border-t pt-6">
        <cite className="not-italic">
          <p className="font-semibold">{author}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
        </cite>
      </div>
    </article>
  );
}
