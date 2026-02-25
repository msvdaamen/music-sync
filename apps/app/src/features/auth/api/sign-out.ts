import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth";

export const signOut = () => {
  return authClient.signOut();
};

export const useSignOut = () =>
  useMutation({
    mutationFn: signOut,
    onSuccess: () => {},
  });
