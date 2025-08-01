import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card.jsx";
import {Link, useNavigate} from "react-router";
import {Controller, useForm} from "react-hook-form";
import {Input} from "@/components/ui/input.jsx";
import {Label} from "@radix-ui/react-label";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group.jsx";
import {Button} from "@/components/ui/button.jsx";
import {useAlert} from "@/provider/AlertProvider.jsx";
import {useContext} from "react";
import {UserContext} from "@/provider/UserContext.js";


export const Signup = () => {
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      gender: "female"
    }
  });
  const alert = useAlert();
  const navigate = useNavigate();
  const auth = useContext(UserContext);

  /**
   * onSubmit runs when the form is submitted
   * @param data
   */
  const onSubmit = async data => {
    console.log(data)
    if (data["confirm-password"] !== data["password"]) {
      alert.error({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive"
      })
      return;
    }
    const dob = new Date(data.dob);
    const today = new Date();
    if (dob >= today) {
      alert.error({
        title: "Error",
        description: "Date of birth must be in the past.",
        variant: "destructive"
      });
      return;
    }

    const res = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
        date_of_birth: new Date(data.dob).getTime() / 1000,
        gender: data.gender === "female" ? "0" : "1",
      })
    });
    if (res.ok) {
      alert.success({
        title: "Success",
        description: "Account created successfully. Redirecting...",
      });
      const resp = await res.json();
      auth.setUser({
        id: resp.id,
        token: resp.token,
        isAuthenticated: true,
        role: resp.role,
        data: {
          name: resp.name || "",
          email: resp.email || "",
          language: resp.language || "",
          profile_picture_url: resp.profile_picture_url || "",
        }
      });
      setTimeout(() => navigate("/"), 3000);
    } else {
      const errorData = await res.json();
      if (errorData.details && Array.isArray(errorData.details)) {
        errorData.details.forEach(detail => {
          alert.error({
            title: `Validation Error on ${detail.path[0]}`,
            description: detail.message,
            variant: "destructive"
          });
        });
      } else {
        alert.error({
          title: "Error",
          description: errorData.error || "An error occurred while creating the account.",
          variant: "destructive"
        });
      }
    }
  }

    return (
        <div className="flex flex-col flex-1 items-center justify-center">

          <Card className="w-full max-w-sm px-2">
            <CardHeader>
              <CardTitle>Sign up for Eldercare</CardTitle>
              <CardDescription>
                Quickly create an account to start using our services.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input type="text" placeholder="Enter Your Name" {...register("name", {required: true, min: 3, maxLength: 255})} />
                  {errors.name && <span className="text-destructive">{errors.name.message || "Please enter a valid name."}</span>}
                </div>
                <div>
                  <Label htmlFor="name">Email</Label>
                  <Input type="text" placeholder="Enter Your Email" {...register("email", {required: true, maxLength: 255})} />
                  {errors.email && <span className="text-destructive">{errors.email.message || "Please enter a valid email."}</span>}
                </div>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input type="password" placeholder="Enter Your Password" {...register("password", {
                      required: true,
                      minLength: 12,
                      maxLength: 255,
                      pattern: {
                        value: /^(?=.*[A-Z])(?=.*[!@#$%^&*()]).*$/,
                        message: "Password must be 12 letters, contain at least one uppercase letter and one special character."
                      }
                    })} />
                    {errors.password && <span className="text-destructive">{errors.password.message || "Password must be 12 letters, contain at least one uppercase letter and one special character."}</span>}
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input type="password" placeholder="Confirm Your Password" {...register("confirm-password", {required: true, minLength: 12, maxLength: 255})} />
                    {errors["confirm-password"] && <span className="text-destructive">{errors["confirm-password"].message || "Please confirm your password."}</span>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input type="date" placeholder="Enter Your Date of Birth" {...register("dob", {required: true})} />
                  {errors.dob && <span className="text-destructive">{errors.dob.message || "Please enter a valid date of birth."}</span>}
                </div>
                <div>
                  <Label htmlFor="gender" >Gender</Label>
                  <Controller
                    name="gender"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex items-center"
                        id="gender"
                      >
                        <RadioGroupItem value="female" id="gender-female"/>
                        <Label htmlFor="gender-female">Female</Label>
                        <RadioGroupItem value="male" id="gender-male" />
                        <Label htmlFor="gender-male">Male</Label>
                      </RadioGroup>
                    )}
                  />
                  {errors.gender && <span className="text-destructive">{errors.gender.message || "Please enter a valid gender."}</span>}
                </div>

                <Button type="submit" className="w-full cursor-pointer">Sign up</Button>

              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full cursor-pointer"
                onClick={() => {
                  window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`;
                }}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>

            </CardContent>

            <CardFooter>
              <Link className="text-sm hover:underline ease-in-out transition" to="/login">
                Already have an account? Sign in
              </Link>
            </CardFooter>
          </Card>
        </div>
    )
}
