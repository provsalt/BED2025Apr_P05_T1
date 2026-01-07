import {useAlert} from "@/provider/AlertProvider.jsx";
import {Link, useNavigate} from "react-router";
import {useContext} from "react";
import {Label} from "@radix-ui/react-label";
import {Input} from "@/components/ui/input.jsx";
import {Button} from "@/components/ui/button.jsx";
import {useForm} from "react-hook-form";
import {UserContext} from "@/provider/UserContext.js";
import {User, X} from "lucide-react";

export const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const alert = useAlert();
  const navigate = useNavigate();
  const auth = useContext(UserContext);

  /**
   * onSubmit runs when the form is submitted
   * @param data
   */
  const onSubmit = async data => {
    const res = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password
      })
    });
    if (res.ok) {
      alert.success({
        title: "Success",
        description: "Login successful. Redirecting...",
      });
      const resp = await res.json();
      
      // Decode token to get user info
      const payload = JSON.parse(atob(resp.token.split('.')[1]));
      
      auth.setUser({
        id: resp.id,
        token: resp.token,
        isAuthenticated: true,
        role: payload.role,
        data: {
          name: resp.name || "",
          email: resp.email || "",
          language: resp.language || "",
          profile_picture_url: resp.profile_picture_url || "",
        }
      });
      
      // Redirect based on role
      if (payload.role === 'Admin') {
        setTimeout(() => navigate("/admin"), 1500);
      } else {
        setTimeout(() => navigate("/"), 1500);
      }
    } else {
      alert.error({
        title: "Error",
        description: "Invalid username or password",
        variant: "destructive"
      });
    }
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-gradient-to-b from-slate-50 to-slate-100">

      {/* Image section - Right on desktop */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 p-12">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-32 h-32 mx-auto bg-primary rounded-full flex items-center justify-center shadow-lg">
            <User className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800">Welcome Back</h2>
          <p className="text-slate-600 text-lg">Your health and wellness journey continues here</p>
        </div>
      </div>

      {/* Form section - Bottom on mobile, Left on desktop */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Log in to Eldercare
            </h1>
            <p className="text-sm text-slate-600">
              Welcome back. Please enter your details to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="h-11 text-base"
                {...register("email", { required: true, maxLength: 255 })}
              />
              {errors.email && (
                <span className="text-destructive text-xs">
                  Please enter a valid email address.
                </span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                className="h-11 text-base"
                {...register("password", { required: true, minLength: 8, maxLength: 255 })}
              />
              {errors.password && (
                <span className="text-destructive text-xs">
                  Please enter your password (at least 8 characters).
                </span>
              )}
            </div>

            <Button type="submit" className="w-full h-11">
              Log in
            </Button>
          </form>

          <div className="flex flex-col gap-3 items-center justify-center pt-4">
            <p className="text-xs text-slate-500 text-center">
              By continuing, you agree to our terms and privacy policy.
            </p>
            <p className="text-sm text-slate-700">
              Don't have an account?{" "}
              <Link className="font-medium text-primary hover:underline" to="/signup">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}