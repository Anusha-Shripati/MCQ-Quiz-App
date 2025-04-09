"use client";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TypographyH1, TypographyH4 } from "@/styles/typography";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/form/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { FormField } from "@/components/common/form-field";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

const defaultValues = {
  email: "superadmin@example.com",
  password: "superadminpassword",
};

export default function Home() {
  const router = useRouter();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof loginSchema>>({
    defaultValues: defaultValues,
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      await login({ email: data.email, password: data.password });
      toast.success("Login successfully");
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error("Something went wrong");
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => setShowPassword((prev) => !prev);

  return (
    <Card className="bg-gradient-to-r from-gray-700 to-gray-900 h-screen w-screen flex flex-col items-center justify-center gap-5">
      <TypographyH1>Welcome to MCQ APP</TypographyH1>
      <Card className="w-[600px] h-[400px] p-5">
        <CardHeader>
          <CardTitle className="flex items-center justify-center text-3xl font-bold">
            Admin Login
          </CardTitle>
          <CardDescription className="flex items-center justify-center text-base">
            Only users with admin privileges can perform this action.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid w-full items-center gap-5">
              <div className="flex flex-col space-y-1.5">
                <FormField
                  label="Email"
                  id="email"
                  placeholder="Enter your email"
                  {...register("email")}
                  className="h-10"
                  error={errors.email?.message}
                />
              </div>
              <div className="flex flex-col space-y-1.5 relative">
                <FormField
                  label="Password"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password")}
                  className="h-10"
                  error={errors.password?.message}
                />
                <Button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-3 top-[37px] transform -translate-y-1/2 bg-transparent border-none shadow-none"
                >
                  {showPassword ? (
                    <EyeOffIcon size={20} />
                  ) : (
                    <EyeIcon size={20} />
                  )}
                </Button>
              </div>
            </div>
            <div className="mt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-lg"
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <TypographyH4>
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-blue-300 hover:underline">
          Contact Admin
        </Link>
      </TypographyH4>
    </Card>
  );
}
