"use client";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TypographyH1, TypographyH4 } from "@/styles/typography";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch } from "@/store/hooks";
import { loginUser } from "@/store/features/authSlice";

const loginSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export default function Home() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    console.log("Form Data:", data);
    try {
      router.push("/dashboard");
      await dispatch(
        loginUser({ email: data.email, password: data.password })
      ).unwrap();
    } catch (err) {
      throw err;
    }
    // toast({ title: "Success!", description: "Form submitted successfully." });
  };

  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  // const { loading, error } = useAppSelector((state) => state.auth);

  // const handleLogin = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   try {
  //     router.push("/dashboard");
  //     // await dispatch(loginUser({ email, password })).unwrap();
  //   } catch (err) {
  //     throw err;
  //   }
  // };

  return (
    <div className="bg-gradient-to-r from-gray-700 to-gray-900 h-screen w-screen flex flex-col items-center justify-center gap-5">
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
                <Label htmlFor="email" className="text-lg">
                  Email
                </Label>
                <Input
                  id="email"
                  placeholder="Enter your email"
                  {...register("email")}
                  className="h-10"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{" Email is required"}</p>
                )}
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password" className="text-lg">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...register("password")}
                  className="h-10"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">
                    {"Invalid password."}
                  </p>
                )}
              </div>
            </div>
            <CardFooter className="flex justify-between mt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-lg"
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
      {/* <div className="text-6xl font-bold text-white mb-8">MCQ APP</div> */}

      {/* <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center dark:text-black">
          Admin Login
        </h2>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
        >
          {loading ? "Logging in..." : "Login"}
        </Button>

        <div className="mt-4 text-center">
          <Link
            href="/forgot-password"
            className="text-blue-500 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
      </form> */}

      {/* <div className="mt-8 text-center">
        <p className="text-white">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-300 hover:underline">
            Contact Admin
          </Link>
        </p>
      </div> */}

      <TypographyH4>
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-blue-300 hover:underline">
          Contact Admin
        </Link>
      </TypographyH4>
    </div>
  );
}
