import { getCurrentUser } from "@/lib/auth-utils";
import Link from "next/link";
import Image from "next/image";
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
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <Image src="/corovel-logo.png" alt="Corovel Logo" width={32} height={32} className="rounded-lg md:w-10 md:h-10" />
              <span className="text-lg md:text-xl font-bold text-[#1F2937]">Corovel</span>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <Link
                href="/login"
                className="px-3 py-2 md:px-4 text-sm md:text-base text-[#6366F1] hover:text-[#8B5CF6] font-medium transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 md:px-6 text-sm md:text-base bg-[#6366F1] text-white rounded-lg hover:bg-[#8B5CF6] transition-all duration-300 font-medium min-h-[44px] flex items-center"
              >
                Join Now
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 pt-20 pb-8 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-4 md:left-10 w-48 md:w-72 h-48 md:h-72 bg-[#6366F1]/10 rounded-full blur-3xl animate-blob-morph"></div>
          <div className="absolute top-40 right-4 md:right-10 w-64 md:w-96 h-64 md:h-96 bg-[#22D3EE]/10 rounded-full blur-3xl animate-blob-morph" style={{ animationDelay: "2s" }}></div>
          <div className="absolute bottom-20 left-1/2 w-56 md:w-80 h-56 md:h-80 bg-[#8B5CF6]/10 rounded-full blur-3xl animate-blob-morph" style={{ animationDelay: "4s" }}></div>
        </div>

        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
          {/* Left: Content */}
          <div className="animate-fade-in text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#1F2937] mb-4 md:mb-6 leading-tight animate-slide-up">
              See what you&apos;re building.
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-[#6B7280] mb-6 md:mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Turn daily actions into long-term clarity and momentum.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 animate-slide-up justify-center lg:justify-start" style={{ animationDelay: "0.2s" }}>
              <Link
                href="/register"
                className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-[#6366F1] text-white rounded-lg hover:bg-[#8B5CF6] transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105 text-base md:text-lg flex items-center justify-center gap-2 animate-bounce-in min-h-[48px]"
              >
                Get Started
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-white text-[#6366F1] border-2 border-[#6366F1] rounded-lg hover:bg-[#6366F1] hover:text-white transition-all duration-300 font-medium text-base md:text-lg min-h-[48px] flex items-center justify-center"
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
      <section id="how-it-works" className="py-12 md:py-24 px-4 bg-white/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#1F2937] text-center mb-8 md:mb-16">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            <div className="premium-card rounded-xl p-5 md:p-8 text-center hover-scale animate-fade-in">
              <div className="premium-card-content">
                <div className="text-4xl md:text-6xl mb-4 md:mb-6">1️⃣</div>
                <h3 className="text-xl md:text-2xl font-semibold text-[#1F2937] mb-2 md:mb-4">Sign Up</h3>
                <p className="text-[#6B7280] text-base md:text-lg">
                  Create your account in seconds. No complex setup required.
                </p>
              </div>
            </div>
            <div className="premium-card rounded-xl p-5 md:p-8 text-center hover-scale animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="premium-card-content">
                <div className="text-4xl md:text-6xl mb-4 md:mb-6">2️⃣</div>
                <h3 className="text-xl md:text-2xl font-semibold text-[#1F2937] mb-2 md:mb-4">Log Daily Actions</h3>
                <p className="text-[#6B7280] text-base md:text-lg">
                  Record what you&apos;re working on. Small inputs, compounding clarity.
                </p>
              </div>
            </div>
            <div className="premium-card rounded-xl p-5 md:p-8 text-center hover-scale animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="premium-card-content">
                <div className="text-4xl md:text-6xl mb-4 md:mb-6">3️⃣</div>
                <h3 className="text-xl md:text-2xl font-semibold text-[#1F2937] mb-2 md:mb-4">See Your Momentum</h3>
                <p className="text-[#6B7280] text-base md:text-lg">
                  Understand what you&apos;re actually building with your time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Corovel */}
      <section className="py-12 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#1F2937] text-center mb-8 md:mb-16">
            Why Corovel
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
            <div className="premium-card rounded-xl p-4 md:p-8 text-center hover-scale animate-fade-in">
              <div className="premium-card-content">
                <div className="text-3xl md:text-5xl mb-3 md:mb-4">✨</div>
                <h3 className="text-base md:text-xl font-semibold text-[#1F2937] mb-2 md:mb-3">Minimal</h3>
                <p className="text-xs md:text-base text-[#6B7280]">
                  Clean interface. No clutter, no noise.
                </p>
              </div>
            </div>
            <div className="premium-card rounded-xl p-4 md:p-8 text-center hover-scale animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="premium-card-content">
                <div className="text-3xl md:text-5xl mb-3 md:mb-4">⚙️</div>
                <h3 className="text-base md:text-xl font-semibold text-[#1F2937] mb-2 md:mb-3">System-first</h3>
                <p className="text-xs md:text-base text-[#6B7280]">
                  Not about motivation. About direction.
                </p>
              </div>
            </div>
            <div className="premium-card rounded-xl p-4 md:p-8 text-center hover-scale animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="premium-card-content">
                <div className="text-3xl md:text-5xl mb-3 md:mb-4">🎯</div>
                <h3 className="text-base md:text-xl font-semibold text-[#1F2937] mb-2 md:mb-3">Progress-focused</h3>
                <p className="text-xs md:text-base text-[#6B7280]">
                  See the signal through the noise of daily work.
                </p>
              </div>
            </div>
            <div className="premium-card rounded-xl p-4 md:p-8 text-center hover-scale animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="premium-card-content">
                <div className="text-3xl md:text-5xl mb-3 md:mb-4">🔒</div>
                <h3 className="text-base md:text-xl font-semibold text-[#1F2937] mb-2 md:mb-3">Private & Secure</h3>
                <p className="text-xs md:text-base text-[#6B7280]">
                  Your data is protected and your progress remains private
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-24 px-4 bg-white/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="premium-card rounded-xl md:rounded-2xl p-6 md:p-12 hover-scale animate-fade-in">
            <div className="premium-card-content">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#1F2937] mb-4 md:mb-6">
                Ready to see what you&apos;re building?
              </h2>
              <p className="text-base md:text-xl text-[#6B7280] mb-6 md:mb-10">
                A system for people who care about direction, not motivation.
              </p>
              <Link
                href="/register"
                className="inline-block w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 bg-[#6366F1] text-white rounded-lg hover:bg-[#8B5CF6] transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105 text-base md:text-lg min-h-[48px]"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 md:py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs md:text-sm text-[#6B7280] mb-2">
            © 2024 Corovel. All rights reserved.
          </p>
          <p className="text-xs text-[#9CA3AF]">
            Progress signals are for personal tracking only.
          </p>
        </div>
      </footer>
    </div>
  );
}
