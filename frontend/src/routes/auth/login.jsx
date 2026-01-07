import {useAlert} from "@/provider/AlertProvider.jsx";
import {Link, useNavigate} from "react-router";
import {useContext} from "react";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.jsx";
import {Label} from "@radix-ui/react-label";
import {Input} from "@/components/ui/input.jsx";
import {Button} from "@/components/ui/button.jsx";
import {useForm} from "react-hook-form";
import {UserContext} from "@/provider/UserContext.js";

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
    <div className="min-h-screen flex flex-col flex-1 items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-8">
      <Card className="w-full max-w-md px-3 py-2 shadow-lg border border-slate-200">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Log in to Eldercare
          </CardTitle>
          <CardDescription className="text-sm text-slate-600">
            Welcome back. Please enter your details to continue.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
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

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                className="h-11 text-base"
                {...register("password", { required: true, min: 8, maxLength: 255 })}
              />
              {errors.password && (
                <span className="text-destructive text-xs">
                  Please enter your password (at least 8 characters).
                </span>
              )}
            </div>

            <Button
              type="submit"
              className="w-full cursor-pointer h-11 text-base font-medium mt-2"
            >
              Log in
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 items-center justify-center pt-0 mt-2">
          <p className="text-xs text-slate-500 text-center">
            By continuing, you agree to our terms and privacy policy.
          </p>
          <p className="text-sm text-slate-700">
            Don't have an account?{" "}
            <Link
              className="font-medium text-primary hover:underline ease-in-out transition"
              to="/signup"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}