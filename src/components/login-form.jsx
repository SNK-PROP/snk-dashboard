"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export function LoginForm({ className, ...props }) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}sendOtp`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          "Content-Type": "application/json",
        },
        data: {
          type: "mobile",
          mobile: phone,
        },
      };

      const response = await axios.request(config);
      console.log("Send OTP Response:", response.data);
      setLoading(false);
      setStep(2);
    } catch (error) {
      setLoading(false);
      console.error("Error sending OTP:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to send OTP. Please check your phone number and try again.";
      setError(errorMessage);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}verifyOtp`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          "Content-Type": "application/json",
        },
        data: {
          mobile: phone,
          otp,
          type: "mobile",
        },
      };

      const response = await axios.request(config);
      console.log("Verify OTP Response:", response.data);

      if (response.data.success && response.data.userToken) {
        const { userToken, user } = response.data;

        // Store values in localStorage, relying only on API response
        localStorage.setItem("userToken", userToken);
        localStorage.setItem("userName", user?.fullName || "User");
        localStorage.setItem("userEmail", user?.email || "no-email");

        console.log("Stored Values:", {
          userToken,
          userName: user?.fullName || "User",
          userEmail: user?.email || "no-email",
        });

        setLoading(false);
        toast.success("Log in successfully", {
          style: {
            backgroundColor: "#DCFCE7",
            color: "#166534",
            borderColor: "#16A34A",
          },
        });
        setTimeout(() => {
          router.push("/dashboard");
        }, 500);
      } else {
        throw new Error("No user token received");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error verifying OTP:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });
      const errorMessage =
        error.response?.data?.msg ||
        error.response?.data?.error ||
        "Invalid or expired OTP. Please try again.";
      setError(errorMessage);
      toast.error("Log in failed", {
        style: {
          backgroundColor: "#FEE2E2",
          color: "#991B1B",
          borderColor: "#EF4444",
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
              src="/login.png"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
          <div className="flex flex-col justify-center p-6 md:p-8 min-h-[400px]">
            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <h1 className="text-2xl font-bold">Welcome back</h1>
                  <p className="text-muted-foreground text-balance">
                    Login to your account
                  </p>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    required
                    maxLength={15}
                  />
                </div>
                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || phone.length < 10}
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
                      Sending...
                    </span>
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              </form>
            )}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <h1 className="text-2xl font-bold">Enter OTP</h1>
                  <p className="text-muted-foreground text-balance">
                    Enter the 6-digit code sent to your phone
                  </p>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="otp">OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    required
                    className="tracking-widest text-center text-lg"
                  />
                </div>
                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || otp.length !== 6}
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
                      Verifying...
                    </span>
                  ) : (
                    "Verify OTP"
                  )}
                </Button>
                <Button
                  variant="link"
                  className="w-full"
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  Change phone number
                </Button>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
      <Toaster />
    </div>
  );
}
