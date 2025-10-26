import Link from 'next/link'
import { MessageSquare, FileText, Users, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <nav className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                Common Elements
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Connect Your Community with Trusted Vendors
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Common Elements is a comprehensive platform connecting homeowners associations
            with service providers, featuring community forums, RFP management, and vendor directories.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 px-6 py-3 rounded-lg text-lg font-medium border-2 border-gray-300 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Community Forum */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Community Forum</h3>
            <p className="text-gray-600 mb-4">
              Engage with your community through discussions, polls, and announcements.
              Share insights and get help from neighbors.
            </p>
            <Link href="/forum" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
              Explore Forum <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* RFP Management */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">RFP Management</h3>
            <p className="text-gray-600 mb-4">
              Create and manage requests for proposals. Get competitive bids from
              qualified vendors for your community projects.
            </p>
            <Link href="/rfps" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
              Browse RFPs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Vendor Directory */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Vendor Directory</h3>
            <p className="text-gray-600 mb-4">
              Find and connect with trusted service providers. Read reviews and
              compare vendors for your association needs.
            </p>
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
              View Directory <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to strengthen your community?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of associations already using Common Elements
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
          >
            Create Free Account
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Common Elements</h3>
              <p className="text-sm">
                Connecting communities with trusted service providers since 2025.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/forum" className="hover:text-white transition-colors">Forum</Link></li>
                <li><Link href="/rfps" className="hover:text-white transition-colors">RFPs</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Log In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 Common Elements. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
