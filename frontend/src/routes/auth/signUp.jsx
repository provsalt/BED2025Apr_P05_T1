import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card.jsx";
import {Link} from "react-router";
import {useForm} from "react-hook-form";
import {Input} from "@/components/ui/input.jsx";
import {Label} from "@radix-ui/react-label";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group.jsx";
import {Button} from "@/components/ui/button.jsx";


export const Signup = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  /**
   * onSubmit runs when the form is submitted
   * @param data
   */
  const onSubmit = data => {
    console.log(data)
    if (data["confirm-password"] !== data["password"]) {

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
                  <Label for="gender" >Gender</Label>
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
