'use client'

import React, { useState } from 'react'
import { Fingerprint, Loader2, ShieldCheck, Users, PieChart, Lock } from 'lucide-react'

interface LoginScreenProps {
  onLogin: (username: string) => void
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const handleLogin = () => {
    setIsAuthenticating(true)
    setTimeout(() => {
      onLogin('zaid.alali@m42.ae')
    }, 800)
  }

  if (isAuthenticating) {
    return (
      <div className="fixed inset-0 bg-[#f8f9fc] flex items-center justify-center z-50 animate-in fade-in duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="text-[#0d212c] mb-4">
            <Loader2 className="w-12 h-12 animate-spin text-[#0d212c]" />
          </div>
          <h2 className="text-[20px] font-semibold text-[#0d212c] mb-2">
            Setting up your workspace...
          </h2>
          <p className="text-[14px] text-slate-500">
            Preparing the M42 Onboarding Agent environment.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#f8f9fc] font-sans antialiased text-[#0d212c]">
      {/* Left Side — Information Panel with requested #D9E6EB background color */}
      <div className="flex-1 p-8 lg:p-16 flex flex-col justify-center relative bg-[#D9E6EB] border-r border-[#e2e8f0]">
        <div className="max-w-md mx-auto w-full flex flex-col gap-8">
          {/* Header Brand: Dark Logo PNG without background */}
          <div className="flex items-center gap-3">
            <img
              src="/dark-logo.png"
              alt="M42 logo"
              className="h-8 w-auto object-contain shrink-0"
            />
            <span className="font-semibold text-xl text-[#0d212c] tracking-tight">
              Onboarding Agent
            </span>
          </div>

          {/* Feature points */}
          <div className="space-y-8 pt-4">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-white/70 border border-[#36c0c9]/30 text-[#0d7280] shrink-0 shadow-2xs">
                <Users className="w-6 h-6 text-[#0d7280]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#0d212c] text-base lg:text-lg">Collaborative Evaluations</h3>
                <p className="text-slate-600 text-xs lg:text-sm mt-1 leading-relaxed font-normal">
                  Facilitators and evaluators work together to run test cases.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-white/70 border border-[#36c0c9]/30 text-[#0d7280] shrink-0 shadow-2xs">
                <ShieldCheck className="w-6 h-6 text-[#0d7280]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#0d212c] text-base lg:text-lg">AI-Powered Analysis</h3>
                <p className="text-slate-600 text-xs lg:text-sm mt-1 leading-relaxed font-normal">
                  Automatically capture snapshots, analyze results, and generate verdicts.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-white/70 border border-[#36c0c9]/30 text-[#0d7280] shrink-0 shadow-2xs">
                <PieChart className="w-6 h-6 text-[#0d7280]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#0d212c] text-base lg:text-lg">Clear &amp; Auditable Results</h3>
                <p className="text-slate-600 text-xs lg:text-sm mt-1 leading-relaxed font-normal">
                  Track test case outcomes and get a final verdict for every dataset.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side — Login Panel */}
      <div className="flex-1 bg-white p-8 lg:p-16 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 text-center shadow-xs flex flex-col items-center">
          {/* Welcome Text */}
          <h2 className="text-2xl font-semibold text-[#0d212c] mb-2 tracking-tight">Welcome</h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
            Sign in with your organisational account
          </p>

          {/* Sign in with SSO Action Button */}
          <button
            onClick={handleLogin}
            className="w-full flex items-start gap-3 bg-white border border-gray-200 rounded-xl px-4 py-4 text-left shadow-xs hover:shadow-md hover:border-[#36c0c9]/30 transition-all group cursor-pointer mb-6"
          >
            <div className="mt-0.5 bg-gray-50 p-2 rounded-lg group-hover:bg-[#36c0c9]/10 transition-colors">
              <Fingerprint className="w-5 h-5 text-gray-500 group-hover:text-[#36c0c9] transition-colors" />
            </div>
            <div className="mt-1">
              <div className="font-semibold text-[15px] text-[#0d212c] group-hover:text-[#36c0c9] transition-colors">
                Sign in with SSO
              </div>
              <div className="text-[13px] text-gray-500 mt-0.5">
                Authenticate via your enterprise network
              </div>
            </div>
          </button>

          {/* Protected Note Text aligned from top per user instructions */}
          <div className="flex items-start justify-center gap-2 text-xs text-slate-500 text-left sm:text-center w-full">
            <Lock className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
            <span>
              Protected by your organization&apos;s Single Sign-On.{' '}
              <span className="block sm:inline">
                Need help?{' '}
                <a
                  href="mailto:support@m42.ae"
                  onClick={(e) => {
                    e.preventDefault()
                    alert('For SSO support, contact support@m42.ae')
                  }}
                  className="text-[#0f766e] font-semibold hover:underline inline-block"
                >
                  Contact your administrator.
                </a>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
