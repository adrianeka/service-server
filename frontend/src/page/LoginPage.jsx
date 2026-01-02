import Navbar from "@/components/Navbar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Konten utama */}
      <div className="flex items-center justify-center flex-1 bg-gray-100">
        <Card className="w-[450px] h-[500px] border-2">
          <CardHeader className="pt-8 pb-6 text-center">
            <CardTitle className="text-2xl font-bold">Login</CardTitle>
          </CardHeader>

          <CardContent className="px-8">
            <form className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full h-10 px-4 border border-gray-200 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full h-10 px-4 pr-10 border border-gray-200 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-white"
                  />
                  <button
                    type="button"
                    className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                <a
                  href="#"
                  className="inline-block mt-1 text-xs text-blue-500 hover:underline"
                >
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full mt-6 font-medium text-white transition bg-blue-600 rounded-full h-11 hover:bg-blue-700"
              >
                Login
              </button>
            </form>
          </CardContent>

          <CardFooter className="justify-center pb-8 pt-[90px]">
            <p className="text-sm text-gray-600">
              Don't have account?{" "}
              <a href="/Register" className="text-blue-600 hover:underline">
                Register here
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default LoginPage;
