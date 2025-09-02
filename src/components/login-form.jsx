"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiService } from "@/lib/api";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export function LoginForm({ className, ...props }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  
  // Check for URL parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('error') === 'unauthorized') {
        setError('Access denied. Admin privileges required.');
      }
      if (urlParams.get('message') === 'password-reset-success') {
        toast.success('Password reset successfully! Please sign in with your new password.', {
          style: {
            backgroundColor: '#DCFCE7',
            color: '#166534',
            borderColor: '#16A34A',
          },
        });
      }
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Try demo login first (for offline demo)
      if (email === 'admin@snk.com' && password === 'admin123') {
        const demoUser = {
          _id: '1',
          email: 'admin@snk.com',
          fullName: 'SNK Admin',
          userType: 'admin',
          contactNumber: '+91 98765 43210',
          location: 'Mumbai',
          isVerified: true,
          verificationStatus: 'verified'
        };
        
        const demoToken = 'demo-admin-token-' + Date.now();
        
        localStorage.setItem('adminToken', demoToken);
        localStorage.setItem('adminUser', JSON.stringify(demoUser));
        
        toast.success('Demo login successful', {
          style: {
            backgroundColor: '#DCFCE7',
            color: '#166534',
            borderColor: '#16A34A',
          },
        });

        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
        return;
      }
      
      // Real API call to backend
      const response = await apiService.login(email, password);
      
      // Allow both admin and broker access (broker has limited admin functions)
      if (response.user.userType !== 'admin' && response.user.userType !== 'broker') {
        setError('Access denied. Admin or broker privileges required.');
        setLoading(false);
        return;
      }
      
      // For broker accounts, add a note about limited access
      if (response.user.userType === 'broker') {
        toast.success('Broker login successful - Limited admin access', {
          style: {
            backgroundColor: '#FEF3C7',
            color: '#92400E',
            borderColor: '#F59E0B',
          },
        });
      }

      localStorage.setItem('adminToken', response.token);
      localStorage.setItem('adminUser', JSON.stringify(response.user));
      
      // Only show success toast for admin users (broker toast already shown above)
      if (response.user.userType === 'admin') {
        toast.success('Admin login successful', {
          style: {
            backgroundColor: '#DCFCE7',
            color: '#166534',
            borderColor: '#16A34A',
          },
        });
      }
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
      
    } catch (error) {
      setLoading(false);
      console.error('Login error:', error);
      const errorMessage = 
        error.response?.data?.message || 
        'Invalid email or password';
      setError(errorMessage);
      toast.error('Login failed', {
        style: {
          backgroundColor: '#FEE2E2',
          color: '#991B1B',
          borderColor: '#EF4444',
        },
      });
    }
  };


  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="bg-muted relative hidden md:block">
            <img
              src="/brand_logo.jpeg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
          <div className="flex flex-col justify-center p-6 md:p-8 min-h-[400px]">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* <div className="flex flex-col items-center text-center mb-6">
                <h1 className="text-2xl font-bold">SNK Admin Login</h1>
                <p className="text-muted-foreground text-balance">
                  Access the admin dashboard
                </p>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                  <p className="font-medium text-blue-800">Available Login Options:</p>
                  <div className="mt-1">
                    <p className="text-blue-600 font-medium">Demo Admin:</p>
                    <p className="text-blue-600 text-xs">admin@snk.com / admin123</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-blue-600 font-medium">Real Account:</p>
                    <p className="text-blue-600 text-xs">snkprop59@gmail.com / 123456</p>
                  </div>
                  <p className="text-xs text-blue-500 mt-2">Note: Real account has broker privileges</p>
                </div>
              </div> */}
              <div className="grid gap-3">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@snk.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !email || !password}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                      />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}
