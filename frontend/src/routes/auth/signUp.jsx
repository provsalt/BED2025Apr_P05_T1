import {Link, useNavigate} from "react-router";
import {Controller, useForm} from "react-hook-form";
import {Input} from "@/components/ui/input.jsx";
import {Label} from "@radix-ui/react-label";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group.jsx";
import {Button} from "@/components/ui/button.jsx";
import {useAlert} from "@/provider/AlertProvider.jsx";
import {useContext, useState} from "react";
import {UserContext} from "@/provider/UserContext.js";
import {UserPlus, X} from "lucide-react";


export const Signup = () => {
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      gender: "female"
    }
  });
  const alert = useAlert();
  const navigate = useNavigate();
  const auth = useContext(UserContext);
  const [showBanner, setShowBanner] = useState(true);

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
      <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-b from-slate-50 to-slate-100">
        {/* Mobile notification banner */}
        {showBanner && (
          <div className="lg:hidden bg-gradient-to-r from-teal-50 to-teal-100/50 border-b border-teal-200/50 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-base font-semibold text-slate-800">Join Eldercare</h2>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="p-1 hover:bg-teal-200/50 rounded-full transition-colors"
              aria-label="Close banner"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        )}

        {/* Image section - Right on desktop */}
        <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-teal-50 via-teal-100/50 to-teal-50 p-12">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-32 h-32 mx-auto bg-teal-500 rounded-full flex items-center justify-center shadow-lg">
              <UserPlus className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800">Join Eldercare</h2>
            <p className="text-slate-600 text-lg">Start your personalized health and wellness journey today</p>
          </div>
        </div>

        {/* Form section - Bottom on mobile, Left on desktop */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-2 text-center lg:text-left">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Create your Eldercare account
              </h1>
              <p className="text-sm text-slate-600">
                It only takes a minute to get started. We'll personalize your experience based on your details.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                  Full name
                </Label>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  className="h-11 text-base"
                  {...register("name", { required: true, minLength: 3, maxLength: 255 })}
                />
                {errors.name && (
                  <span className="text-destructive text-xs">
                    {errors.name.message || "Please enter a valid name (at least 3 characters)."}
                  </span>
                )}
              </div>

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
                    {errors.email.message || "Please enter a valid email address."}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    className="h-11 text-base"
                    {...register("password", {
                      required: true,
                      minLength: 12,
                      maxLength: 255,
                      pattern: {
                        value: /^(?=.*[A-Z])(?=.*[!@#$%^&*()]).*$/,
                        message:
                          "Password must be at least 12 characters and include at least one uppercase letter and one special character.",
                      },
                    })}
                  />
                  {errors.password && (
                    <span className="text-destructive text-xs">
                      {errors.password.message ||
                        "Password must be at least 12 characters and include at least one uppercase letter and one special character."}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm font-medium text-slate-700">
                    Confirm password
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    className="h-11 text-base"
                    {...register("confirm-password", { required: true, minLength: 12, maxLength: 255 })}
                  />
                  {errors["confirm-password"] && (
                    <span className="text-destructive text-xs">
                      {errors["confirm-password"].message || "Please confirm your password."}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob" className="text-sm font-medium text-slate-700">
                  Date of birth
                </Label>
                <Input
                  id="dob"
                  type="date"
                  className="h-11 text-base"
                  autoComplete="bday"
                  {...register("dob", { required: true })}
                />
                {errors.dob && (
                  <span className="text-destructive text-xs">
                    {errors.dob.message || "Please enter a valid date of birth."}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-medium text-slate-700">
                  Gender
                </Label>
                <Controller
                  name="gender"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex items-center gap-4"
                      id="gender"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="female" id="gender-female" />
                        <Label htmlFor="gender-female" className="text-sm">
                          Female
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="male" id="gender-male" />
                        <Label htmlFor="gender-male" className="text-sm">
                          Male
                        </Label>
                      </div>
                    </RadioGroup>
                  )}
                />
                {errors.gender && (
                  <span className="text-destructive text-xs">
                    {errors.gender.message || "Please select a gender option."}
                  </span>
                )}
              </div>

              <Button type="submit" className="w-full h-11">
                Create account
              </Button>
            </form>

            <div className="flex flex-col gap-3 items-center justify-center pt-4">
              <p className="text-xs text-slate-500 text-center">
                By creating an account, you agree to our terms and privacy policy.
              </p>
              <p className="text-sm text-slate-700">
                Already have an account?{" "}
                <Link className="font-medium text-primary hover:underline" to="/login">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
}
