"use client";
import { useState } from "react";
import Aurora from "@/components/Aurora/Aurora";
import { LoginForm } from "@/components/login-form";
import { SignupForm } from "@/components/signup-form";

export default function AuthPage() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="relative min-h-svh flex items-center justify-center overflow-hidden">
      <Aurora className="absolute inset-0 z-0" />
      <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10 z-10 w-full">
        <div className="w-full max-w-sm md:max-w-4xl">
          {showLogin ? <LoginForm /> : <SignupForm />}
          <div className="mt-4 text-center">
            {showLogin ? (
              <span>
                Don&apos;t have an account?{" "}
                <button
                  className="underline text-primary"
                  onClick={() => setShowLogin(false)}
                  type="button"
                >
                  Sign up
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{" "}
                <button
                  className="underline text-primary"
                  onClick={() => setShowLogin(true)}
                  type="button"
                >
                  Log in
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
