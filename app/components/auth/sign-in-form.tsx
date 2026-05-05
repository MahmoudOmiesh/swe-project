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
import { useNavigate } from "react-router";
import { Spinner } from "../ui/spinner";

const signInSchema = z.object({
  email: z.email({ message: "Please enter a valid email" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

type SignInData = z.infer<typeof signInSchema>;

export function SignInForm() {
  const navigate = useNavigate();
  const form = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signInMutation = useMutation({
    mutationFn: async (data: z.infer<typeof signInSchema>) => {
      await authClient.signIn.email({
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

  function onSubmit(data: SignInData) {
    signInMutation.mutate(data);
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
        <CardTitle style={{ color: colors.dark }}>Sign In</CardTitle>
        <CardDescription style={{ color: colors.textSub }}>
          Sign in to your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="sign-in-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
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
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="mt-3">
        <Button
          type="submit"
          form="sign-in-form"
          className="w-full"
          size="lg"
          style={{
            background: colors.gold,
            color: colors.cream,
          }}
        >
          Sign In
          {signInMutation.isPending ? (
            <Spinner />
          ) : (
            <ArrowRightIcon className="size-4" />
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
