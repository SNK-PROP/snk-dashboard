"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { apiService } from "@/lib/api";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    const checkAuth = async () => {
      // Skip auth check for public routes
      if (isPublicRoute) {
        setIsAuthenticated(false);
        return;
      }

      const token = localStorage.getItem("adminToken");
      if (!token) {
        setIsAuthenticated(false);
        router.push("/login");
        return;
      }

      try {
        // For demo purposes, check if it's a demo token
        if (token.startsWith('demo-admin-token-')) {
          const storedUser = localStorage.getItem('adminUser');
          if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user.userType === 'admin' || user.userType === 'broker') {
              setIsAdmin(true);
              setIsAuthenticated(true);
              
              // If user is authenticated and on login page, redirect to dashboard
              if (pathname === '/login') {
                router.push('/dashboard');
              }
              return;
            }
          }
        }
        
        // Real API call for actual authentication
        const profileData = await apiService.getProfile();
        const user = profileData.user;
        
        // Check if user is admin or broker
        if (user.userType !== 'admin' && user.userType !== 'broker') {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          setIsAuthenticated(false);
          router.push("/login?error=unauthorized");
          return;
        }

        setIsAdmin(true);
        setIsAuthenticated(true);
        localStorage.setItem('adminUser', JSON.stringify(user));
        
        // If user is authenticated and on login page, redirect to dashboard
        if (pathname === '/login') {
          router.push('/dashboard');
        }
        
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setIsAuthenticated(false);
        if (!isPublicRoute) {
          router.push("/login");
        }
      }
    };

    checkAuth();
  }, [router, pathname, isPublicRoute]);

  // Show loading only for protected routes
  if (isAuthenticated === null && !isPublicRoute) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading SNK Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  // Allow public routes to render without authentication
  if (isPublicRoute) {
    return children;
  }

  // Protect all other routes
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return children;
}
