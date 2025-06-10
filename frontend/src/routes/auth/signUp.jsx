import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card.jsx";
import {Link, useNavigate} from "react-router";
import {useForm} from "react-hook-form";
import {Input} from "@/components/ui/input.jsx";
import {Label} from "@radix-ui/react-label";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group.jsx";
import {Button} from "@/components/ui/button.jsx";
import {useAlert} from "@/provider/AlertProvider.jsx";
import {useContext} from "react";
import {UserContext} from "@/provider/UserContext.js";


export const Signup = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
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

    const res = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
        dob: new Date(data.dob).getTime() / 1000,
        gender: data.gender === "female" ? 0 : 1,
      })
    });
    if (res.ok) {
      alert.success({
        title: "Success",
        description: "Account created successfully. Redirecting...",
      });
      const resp = await res.json();
      localStorage.setItem("token", resp.token);
      localStorage.setItem("id", resp.id);
      auth.id = resp.id;
      auth.token = resp.token;
      auth.isAuthenticated = true;
      setTimeout(() => navigate("/medicine"), 3000);
    } else {
      const errorData = await res.json();
      alert.error({
        title: "Error",
        description: errorData.error || "An error occurred while creating the account.",
        variant: "destructive"
      });
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
                  {errors.name && <span className="text-red-500">Please enter a valid name.</span>}
                </div>
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
                  <div>
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input type="password" placeholder="Confirm Your Password" {...register("confirm-password", {required: true, min: 8, maxLength: 255})} />
                    {errors["confirm-password"] && <span className="text-red-500">Please confirm your password.</span>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input type="date" placeholder="Enter Your Date of Birth" {...register("dob", {required: true})} />
                  {errors.dob && <span className="text-red-500">Please enter a valid date of birth.</span>}
                </div>
                <div>
                  <Label htmlFor="gender" >Gender</Label>
                  <RadioGroup name="gender" id="gender" defaultValue="female" className="flex items-center">
                    <RadioGroupItem {...register("gender", {required: true})} value="female" id="gender-female"/>
                    <Label htmlFor="gender-female">Female</Label>
                    <RadioGroupItem {...register("gender", {required: true})} value="male" id="gender-male" />
                    <Label htmlFor="gender-male">Male</Label>
                  </RadioGroup>
                  {errors.gender && <span className="text-red-500">Please enter a valid gender.</span>}
                </div>

                <Button type="submit" className="w-full cursor-pointer">Sign up</Button>

              </form>

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
