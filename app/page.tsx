import { getCurrentUser } from "@/lib/auth-utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import OrbitingElements from "@/components/OrbitingElements";
import AnimatedNetwork from "@/components/AnimatedNetwork";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen gradient-mesh">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <span className="text-xl font-bold text-[#1F2937]">Corovel</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="px-4 py-2 text-[#6366F1] hover:text-[#8B5CF6] font-medium transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#8B5CF6] transition-all duration-300 font-medium"
              >
                Join Now
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 pt-20 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#6366F1]/10 rounded-full blur-3xl animate-blob-morph"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-[#22D3EE]/10 rounded-full blur-3xl animate-blob-morph" style={{ animationDelay: "2s" }}></div>
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-[#8B5CF6]/10 rounded-full blur-3xl animate-blob-morph" style={{ animationDelay: "4s" }}></div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left: Content */}
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#1F2937] mb-6 leading-tight animate-slide-up">
              Unlock Consistent Habits You Thought Were Hard - Now Just One Click Away!
            </h1>
            <p className="text-xl md:text-2xl text-[#6B7280] mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Build habits through simple daily actions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Link
                href="/register"
                className="px-8 py-4 bg-[#6366F1] text-white rounded-lg hover:bg-[#8B5CF6] transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105 text-lg flex items-center justify-center gap-2 animate-bounce-in"
              >
                Start Building Habits
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a
                href="#how-it-works"
                className="px-8 py-4 bg-white text-[#6366F1] border-2 border-[#6366F1] rounded-lg hover:bg-[#6366F1] hover:text-white transition-all duration-300 font-medium text-lg"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Right: Animated Network & Orbiting Elements */}
          <div className="hidden lg:block animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="premium-card rounded-3xl p-8 relative overflow-hidden min-h-[500px] shadow-2xl">
              <div className="premium-card-content relative h-full">
                {/* Animated Network Background */}
                <div className="absolute inset-0 opacity-70">
                  <AnimatedNetwork />
                </div>
                {/* Orbiting Elements Overlay */}
                <div className="relative z-20">
                  <OrbitingElements />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 bg-white/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1F2937] text-center mb-16">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="premium-card rounded-xl p-8 text-center hover-scale animate-fade-in">
              <div className="premium-card-content">
                <div className="text-6xl mb-6">1️⃣</div>
                <h3 className="text-2xl font-semibold text-[#1F2937] mb-4">Sign Up</h3>
                <p className="text-[#6B7280] text-lg">
                  Create your account in seconds. No complex setup required.
                </p>
              </div>
            </div>
            <div className="premium-card rounded-xl p-8 text-center hover-scale animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="premium-card-content">
                <div className="text-6xl mb-6">2️⃣</div>
                <h3 className="text-2xl font-semibold text-[#1F2937] mb-4">Complete Daily Actions</h3>
                <p className="text-[#6B7280] text-lg">
                  Perform simple daily tasks to build consistency and earn points.
                </p>
              </div>
            </div>
            <div className="premium-card rounded-xl p-8 text-center hover-scale animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="premium-card-content">
                <div className="text-6xl mb-6">3️⃣</div>
                <h3 className="text-2xl font-semibold text-[#1F2937] mb-4">Build Streaks & Consistency</h3>
                <p className="text-[#6B7280] text-lg">
                  Track your progress, maintain streaks, and watch your habits grow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Corovel */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1F2937] text-center mb-16">
            Why Corovel
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="premium-card rounded-xl p-8 text-center hover-scale animate-fade-in">
              <div className="premium-card-content">
                <div className="text-5xl mb-4">✨</div>
                <h3 className="text-xl font-semibold text-[#1F2937] mb-3">Simple</h3>
                <p className="text-[#6B7280]">
                  Easy-to-use interface designed for daily habit building
                </p>
              </div>
            </div>
            <div className="premium-card rounded-xl p-8 text-center hover-scale animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="premium-card-content">
                <div className="text-5xl mb-4">😌</div>
                <h3 className="text-xl font-semibold text-[#1F2937] mb-3">No Pressure</h3>
                <p className="text-[#6B7280]">
                  Build habits at your own pace without stress or deadlines
                </p>
              </div>
            </div>
            <div className="premium-card rounded-xl p-8 text-center hover-scale animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="premium-card-content">
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-[#1F2937] mb-3">Habit-Focused</h3>
                <p className="text-[#6B7280]">
                  Designed specifically to help you build lasting habits
                </p>
              </div>
            </div>
            <div className="premium-card rounded-xl p-8 text-center hover-scale animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="premium-card-content">
                <div className="text-5xl mb-4">🔒</div>
                <h3 className="text-xl font-semibold text-[#1F2937] mb-3">Private & Secure</h3>
                <p className="text-[#6B7280]">
                  Your data is protected and your progress remains private
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-white/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="premium-card rounded-2xl p-12 hover-scale animate-fade-in">
            <div className="premium-card-content">
              <h2 className="text-4xl md:text-5xl font-bold text-[#1F2937] mb-6">
                Ready to build better habits?
              </h2>
              <p className="text-xl text-[#6B7280] mb-10">
                Join Corovel today and start your journey toward consistency.
              </p>
              <Link
                href="/register"
                className="inline-block px-10 py-5 bg-[#6366F1] text-white rounded-lg hover:bg-[#8B5CF6] transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105 text-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-[#6B7280] mb-2">
            © 2024 Corovel. All rights reserved.
          </p>
          <p className="text-xs text-[#9CA3AF]">
            Tasks reward internal points only. Points have no monetary value and are not cryptocurrency.
          </p>
        </div>
      </footer>
    </div>
  );
}
