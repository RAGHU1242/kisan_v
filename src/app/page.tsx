"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tractor, Users, Building, Shield, MapPin, Calendar, MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, userData } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    if (user && userData) {
      router.push('/dashboard');
    } else {
      router.push('/register');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-2 rounded-lg">
              <Tractor className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-green-600">AgriGo</span>
          </div>
          <div className="flex gap-3">
            {user ? (
              <Button onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Farm Equipment Rental Made Easy
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Connect farmers with resource owners. Book tractors, harvesters, and agricultural equipment with AI-powered recommendations.
        </p>
        <Button size="lg" onClick={handleGetStarted} className="text-lg px-8">
          Get Started
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Interactive Map</CardTitle>
              <CardDescription>
                View all available equipment on an interactive map. Find resources near your farm location.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>AI Recommendations</CardTitle>
              <CardDescription>
                Get smart equipment suggestions based on your crop type, farm stage, and requirements.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Real-time Chat</CardTitle>
              <CardDescription>
                Communicate directly with equipment owners through our integrated chat system.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Easy Booking</CardTitle>
              <CardDescription>
                Simple booking system with date selection, price calculation, and instant confirmation.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Admin Verification</CardTitle>
              <CardDescription>
                All equipment listings are verified by admins to ensure quality and authenticity.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-teal-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Building className="h-6 w-6 text-teal-600" />
              </div>
              <CardTitle>Multi-Role System</CardTitle>
              <CardDescription>
                Separate dashboards for farmers, resource owners, and administrators.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Choose Your Role</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2 border-green-200 hover:border-green-400 transition-colors">
            <CardHeader className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Farmer</CardTitle>
              <CardDescription className="text-left mt-4">
                <ul className="space-y-2">
                  <li>• Browse verified equipment</li>
                  <li>• Get AI-powered recommendations</li>
                  <li>• Book equipment easily</li>
                  <li>• Track bookings</li>
                  <li>• Chat with owners</li>
                </ul>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <Link href="/register">Join as Farmer</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
            <CardHeader className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle>Resource Owner</CardTitle>
              <CardDescription className="text-left mt-4">
                <ul className="space-y-2">
                  <li>• List your equipment</li>
                  <li>• Manage bookings</li>
                  <li>• Set your own prices</li>
                  <li>• Earn extra income</li>
                  <li>• Chat with farmers</li>
                </ul>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <Link href="/register">Join as Owner</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors">
            <CardHeader className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle>Administrator</CardTitle>
              <CardDescription className="text-left mt-4">
                <ul className="space-y-2">
                  <li>• Verify equipment listings</li>
                  <li>• Manage users</li>
                  <li>• Monitor bookings</li>
                  <li>• View analytics</li>
                  <li>• Ensure quality</li>
                </ul>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Admin Access Only
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white border-0">
          <CardHeader>
            <CardTitle className="text-3xl text-white">Ready to Transform Your Farming?</CardTitle>
            <CardDescription className="text-green-50 text-lg">
              Join thousands of farmers and equipment owners on AgriGo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" variant="secondary" onClick={handleGetStarted} className="text-lg">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2024 AgriGo - Farm Equipment Rental Platform</p>
          <p className="text-sm mt-2">Built with Next.js, Firebase, Supabase, and AI/ML</p>
        </div>
      </footer>
    </div>
  );
}