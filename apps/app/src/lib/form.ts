import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { lazy } from "react";

// export useFieldContext for use in your custom components
export const { fieldContext, formContext, useFieldContext } =
  createFormHookContexts();

const TextField = lazy(() => import("../components/form/text-field"));

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  // We'll learn more about these options later
  fieldComponents: {
    TextField,
  },
  formComponents: {},
});
