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
import { useSignIn } from "@/features/auth/api/sign-in";

export const Route = createFileRoute("/auth/sign-in")({
  beforeLoad: async () => {
    const { data } = await authClient.getSession();
    if (data?.session) {
      throw redirect({ to: "/" });
    }
  },
  component: SignInPage,
});

const validator = type({
  email: "string.email",
  password: "string>=8",
});

function SignInPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const signIn = useSignIn();

  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: validator,
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const { error } = await signIn.mutateAsync(value);
      if (error) {
        setServerError(error.message ?? "Failed to sign in. Please try again.");
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
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
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

              <form.AppField name="password">
                {(field) => (
                  <field.TextField
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
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
                        Signing in…
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                )}
              </form.Subscribe>
              {/*</FieldGroup>*/}
            </form>
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-muted-foreground text-sm">
              Don't have an account?{" "}
              <Link
                to="/auth/sign-up"
                className="text-primary font-medium hover:underline"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
