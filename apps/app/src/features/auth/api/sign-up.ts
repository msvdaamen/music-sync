import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth";

export type SignUpInput = {
  email: string;
  password: string;
  name: string;
};

export async function signUp(input: SignUpInput) {
  return authClient.signUp.email(input);
}

export const useSignUp = () =>
  useMutation({
    mutationFn: (payload: SignUpInput) => signUp(payload),
  });
