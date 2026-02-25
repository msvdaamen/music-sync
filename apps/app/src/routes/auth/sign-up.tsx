import { useState } from "react";
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { type } from "arktype";
import { Music2, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppForm } from "@/lib/form";
import { useSignUp } from "@/features/auth/api/sign-up";

export const Route = createFileRoute("/auth/sign-up")({
  beforeLoad: async () => {
    const { data } = await authClient.getSession();
    if (data?.session) {
      throw redirect({ to: "/" });
    }
  },
  component: SignUpPage,
});

const validator = type({
  name: "string>=2",
  email: "string.email",
  password: `string>=8`,
});

function SignUpPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const signUp = useSignUp();

  const form = useAppForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: validator,
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const { error } = await signUp.mutateAsync(value);
      if (error) {
        setServerError(
          error.message ?? "Failed to create account. Please try again.",
        );
        return;
      }
      navigate({ to: "/" });
    },
  });

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="bg-primary/10 flex size-12 items-center justify-center rounded-xl">
            <Music2 className="text-primary size-6" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            MusicSync
          </span>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Create an account</CardTitle>
            <CardDescription>
              Start syncing your music across devices
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              className="grid gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              {/*<FieldGroup>*/}
              {/* Name */}
              <form.AppField name="name">
                {(field) => (
                  <field.TextField
                    label="Name"
                    type="text"
                    placeholder="Jane Smith"
                    autoComplete="name"
                  />
                )}
              </form.AppField>

              {/* Email */}
              <form.AppField name="email">
                {(field) => (
                  <field.TextField
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                )}
              </form.AppField>

              {/* Password */}
              <form.AppField name="password">
                {(field) => (
                  <field.TextField
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                )}
              </form.AppField>

              {/* Confirm Password */}
              <form.AppField name="confirmPassword">
                {(field) => (
                  <field.TextField
                    label="Confirm password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                )}
              </form.AppField>

              {/* Server error */}
              {serverError && (
                <div className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
                  {serverError}
                </div>
              )}

              {/* Submit */}
              <form.Subscribe selector={(state) => state.isSubmitting}>
                {(isSubmitting) => (
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Creating account…
                      </>
                    ) : (
                      "Create account"
                    )}
                  </Button>
                )}
              </form.Subscribe>
              {/*</FieldGroup>*/}
            </form>
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-muted-foreground text-sm">
              Already have an account?{" "}
              <Link
                to="/auth/sign-in"
                className="text-primary font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>

        <p className="text-muted-foreground/70 mt-4 text-center text-xs">
          By creating an account you agree to our{" "}
          <span className="hover:text-muted-foreground cursor-pointer underline underline-offset-4">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="hover:text-muted-foreground cursor-pointer underline underline-offset-4">
            Privacy Policy
          </span>
          .
        </p>
      </div>
    </div>
  );
}
