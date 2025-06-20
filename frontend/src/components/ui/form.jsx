import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState
} from "react-hook-form";

export const Form = FormProvider;

const FormFieldContext = React.createContext({});

export function FormField(props) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

const FormItemContext = React.createContext({});

export function FormItem({ className, ...props }) {
  const id = React.useId();
  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={`grid gap-2 ${className || ""}`} {...props} />
    </FormItemContext.Provider>
  );
}

export function FormLabel({ className, ...props }) {
  return <label className={`font-medium text-sm ${className || ""}`} {...props} />;
}

export function FormControl({ ...props }) {
  return <Slot {...props} />;
}

export function FormMessage({ className, ...props }) {
  return (
    <p className={`text-destructive text-sm ${className || ""}`} {...props}>
      {props.children}
    </p>
  );
}
