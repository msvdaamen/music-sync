import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth";

export type SignInInput = {
  email: string;
  password: string;
};

export const signIn = (payload: SignInInput) => {
  return authClient.signIn.email(payload);
};

export const useSignIn = () =>
  useMutation({
    mutationFn: signIn,
    onSuccess: () => {},
  });
