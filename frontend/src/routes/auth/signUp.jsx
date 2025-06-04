import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card.jsx";
import { zodResolver } from "@hookform/resolvers/zod"
import {Button} from "@/components/ui/button.jsx";
import {Link} from "react-router";
import {z} from "zod";
import {Form, useForm} from "react-hook-form";
import {FormField, FormItem} from "@/components/ui/form.jsx";

const signupForm = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email(),
  password: z.string().min(8).max(255),
  confirmPassword: z.string().min(8).max(255),
  dateOfBirth: z.string(),
  gender: z.number().min(0).max(1),
  terms: z.boolean().refine((val) => val, {
    message: "You must accept the terms and conditions",
  }),
})

export const Signup = () => {
  const form = useForm({
    resolver: zodResolver(signupForm),
    defaultValues: {
      name: "",
    },
  })

  const onSubmit = (data) => {
    console.log("Form submitted with data:", data);
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <label className="text-sm font-medium">Name</label>
                        <input
                          {...field}
                          className="w-full p-2 border rounded"
                          placeholder="Enter your name"
                        />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Sign up</Button>
                </form>
              </Form>
            <CardContent>

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
