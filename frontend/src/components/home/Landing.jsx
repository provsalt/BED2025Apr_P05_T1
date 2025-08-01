import { Button } from "@/components/ui/button";
import {Card, CardHeader, CardTitle, CardContent, CardDescription} from "@/components/ui/card";
import { Link } from "react-router";
import {
  Shield,
  Users,
  Clock,
  Smartphone
} from "lucide-react";
import nutritionImage from "/nutrition.png"
import transportImage from "/transport.png"

export const Landing = () => {
  const features = [
    {
      title: "Nutrition Tracking",
      description: "Meal logging and nutritional insights to maintain a healthy, balanced diet.",
      size: "large",
      img: nutritionImage,
    },
    {
      title: "Medical Management",
      description: "Medication reminders, health tracking, and easy access to medical information.",
      size: "small",
    },
    {
      title: "Transport Planning",
      description: "Easy route planning and accessible transportation options for your daily needs.",
      size: "small",
      img: transportImage
    },
    {
      title: "Community Events",
      description: "Discover local activities and social engagement opportunities in your area.",
      size: "horizontal-2",
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Your privacy and data security are our top priorities with enterprise-grade protection."
    },
    {
      icon: Users,
      title: "Stay Connected",
      description: "Maintain meaningful relationships with family, friends, and your local community."
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock assistance and emergency support when you need it most."
    },
    {
      icon: Smartphone,
      title: "Easy to Use",
      description: "Intuitive design made specifically for seniors with large text and simple navigation."
    }
  ];

  return (
    <div className="min-h-screen">
      <section className="flex flex-col items-center justify-center text-center space-y-8 py-20 px-6">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Comprehensive Care for
            <span className="text-primary block">Independent Living</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl text-lg md:text-xl mx-auto mb-8 leading-relaxed">
            ElderCare provides seniors with the tools, support, and community connections needed to live independently with confidence and peace of mind.
          </p>
          <div className="space-x-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/signup">Get Started Today</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our comprehensive suite of tools supports every aspect of senior living, from health management to social connections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-2">
            {features.map((feature, index) => {
              const isLarge = feature.size === "large";
              return (
                <Card 
                  key={index}
                  className={`overflow-hidden group hover:scale-[1.02] transition-transform ${
                    isLarge ? "md:row-span-2 md:col-span-1" 
                      : feature.size === "horizontal-2" ? "md:row-span-1 md:col-span-2" : "md:row-span-1 md:col-span-1"
                  }`}
                >
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col h-full">
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="overflow-hidden rounded-md flex-1">
                      <img 
                        src={feature.img} 
                        alt={feature.title}
                        className={`w-full object-cover group-hover:scale-105 transition-transform ${
                          isLarge ? "h-full min-h-48" : "h-32"
                        }`}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose ElderCare?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We're committed to empowering seniors to maintain their independence while providing the support and security they deserve.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                    <Icon className="size-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of seniors who have already discovered how ElderCare helps them live independently with confidence. Get started today with our easy setup process.
          </p>
          <div className="space-x-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/signup">Create Your Account</Link>
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link to="/login">Already have an account? Sign in</Link>
            </Button>
          </div>
          <p className="text-muted-foreground text-sm mt-6">
            Free to get started • No credit card required • 24/7 support available
          </p>
        </div>
      </section>
    </div>
  );
};
