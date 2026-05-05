import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { colors } from "@/components/dashboard/theme";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ArrowRightIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "../ui/spinner";
import { useNavigate } from "react-router";

const signUpSchema = z
  .object({
    name: z.string().min(4, { message: "Name must be at least 4 characters" }),
    email: z.email({ message: "Please enter a valid email" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignUpData = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const navigate = useNavigate();
  const form = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const signUpMutation = useMutation({
    mutationFn: async (data: z.infer<typeof signUpSchema>) => {
      await authClient.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
      });
    },
    onSuccess() {
      navigate("/");
    },
    onError(error) {
      toast.error(error.message);
    },
  });

  function onSubmit(data: SignUpData) {
    signUpMutation.mutate(data);
  }

  return (
    <Card
      className="w-full sm:max-w-md"
      style={{
        background: colors.cream,
        border: `1px solid ${colors.border}`,
        borderRadius: "8px",
      }}
    >
      <CardHeader>
        <CardTitle style={{ color: colors.dark }}>Sign Up</CardTitle>
        <CardDescription style={{ color: colors.textSub }}>
          Create an account to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="sign-up-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    style={{ color: colors.dark }}
                  >
                    Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="John Doe"
                    autoComplete="off"
                    style={{
                      borderColor: colors.border2,
                      color: colors.dark,
                    }}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    style={{ color: colors.dark }}
                  >
                    Email
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="john.doe@example.com"
                    autoComplete="email"
                    type="email"
                    style={{
                      borderColor: colors.border2,
                      color: colors.dark,
                    }}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    style={{ color: colors.dark }}
                  >
                    Password
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="********"
                    autoComplete="new-password"
                    type="password"
                    style={{
                      borderColor: colors.border2,
                      color: colors.dark,
                    }}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    style={{ color: colors.dark }}
                  >
                    Confirm Password
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="********"
                    autoComplete="new-password"
                    type="password"
                    style={{
                      borderColor: colors.border2,
                      color: colors.dark,
                    }}
                  />
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="mt-3">
        <Button
          type="submit"
          form="sign-up-form"
          className="w-full"
          size="lg"
          style={{
            background: colors.gold,
            color: colors.cream,
          }}
        >
          Sign Up
          {signUpMutation.isPending ? (
            <Spinner />
          ) : (
            <ArrowRightIcon className="size-4" />
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
