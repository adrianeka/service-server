import Navbar from "@/components/Navbar"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Konten utama */}
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <Card className="w-[450px] border-2">
          <CardHeader className="text-center pt-5">
            <CardTitle className="text-2xl font-bold">Register</CardTitle>
          </CardHeader>

          <CardContent className="px-8">
            <form className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  className="w-full h-10 px-4 rounded-md border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-white"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full h-10 px-4 rounded-md border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-white"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full h-10 px-4 pr-10 rounded-md border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-white"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="w-full h-10 px-4 pr-10 rounded-md border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-white"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* Button Register */}
              <button
                type="submit"
                className="w-full h-11 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition mt-4"
              >
                Register
              </button>
            </form>
          </CardContent>

          {/* Footer */}
          <CardFooter className="justify-center pb-6 pt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <a href="/Login" className="text-blue-600 hover:underline">
                Login here
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default RegisterPage
