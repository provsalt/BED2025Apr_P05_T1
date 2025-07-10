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
        role: payload.role
      });
      
      // Redirect based on role
      if (payload.role === 'Admin') {
        setTimeout(() => navigate("/admin/dashboard"), 1500);
      } else {
        setTimeout(() => navigate("/Home"), 1500);
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
    <div className="flex flex-col flex-1 items-center justify-center">

      <Card className="w-full max-w-sm px-2">
        <CardHeader>
          <CardTitle>Log in to Eldercare</CardTitle>
          <CardDescription>
            Please enter your email and password to log in.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Email</Label>
              <Input type="text" placeholder="Enter Your Email" {...register("email", {required: true, maxLength: 255})} />
              {errors.email && <span className="text-red-500">Please enter a valid email.</span>}
            </div>
            <div className="space-y-2">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input type="password" placeholder="Enter Your Password" {...register("password", {required: true, min: 8, maxLength: 255})} />
                {errors.password && <span className="text-red-500">Please enter a valid password.</span>}
              </div>
            </div>

            <Button type="submit" className="w-full cursor-pointer">Log in</Button>

          </form>

        </CardContent>

        <CardFooter>
          <Link className="text-sm hover:underline ease-in-out transition" to="/signup">
            Don't have an account? Sign Up
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}