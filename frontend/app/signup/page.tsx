import Aurora from "@/components/Aurora/Aurora";
import { SignupForm } from "@/components/signup-form";

export default function LoginPage() {
  return (
    <div className="relative min-h-svh flex items-center justify-center overflow-hidden">
      <Aurora className="absolute inset-0 z-0" />
      <div className=" flex min-h-svh flex-col items-center justify-center p-6 md:p-10 z-10 w-full">
        <div className="w-full max-w-sm md:max-w-4xl">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
