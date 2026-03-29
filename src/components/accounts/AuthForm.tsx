import { useState } from "react";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signIn, signUp } from "@/lib/auth-client";
import { z } from "zod";

const authSchema = z
  .object({
    email: z.email("invalid email address"),
    password: z.string().min(8, "password must be at least 8 characters"),
    confirmPassword: z.string().optional(),
    name: z.string().min(2, "name must be at least 2 characters").optional(),
  })
  .refine(
    (data) => {
      if (data.confirmPassword !== undefined) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "passwords don't match",
      path: ["confirmPassword"],
    },
  );

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");

  const handleAuth = async () => {
    setLoading(true);
    setFieldErrors({});
    setGeneralError("");

    // Frontend validation
    const result = authSchema.safeParse({
      email,
      password,
      confirmPassword: isSignUp ? confirmPassword : undefined,
      name: isSignUp ? name : undefined,
    });

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0].toString()] = issue.message;
        }
      });
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        await signUp.email(
          {
            email,
            password,
            name,
            // worker and page hosted on same domain, so this is fine
            callbackURL: window.location.origin + "/account",
          },
          {
            onError: (ctx) => {
              setGeneralError(ctx.error.message || "sign up failed");
            },
          },
        );
      } else {
        await signIn.email(
          {
            email,
            password,
            // worker and page hosted on same domain, so this is fine
            callbackURL: window.location.origin + "/account",
          },
          {
            onError: (ctx) => {
              setGeneralError(ctx.error.message || "sign in failed");
            },
          },
        );
      }
    } catch (e: any) {
      setGeneralError("an unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 bg-zinc-900 rounded-xl border-2 border-zinc-800">
      <h2 className="text-2xl font-bold text-center mb-2">
        {isSignUp ? "create account" : "sign in"}
      </h2>

      {isSignUp && (
        <Field>
          <FieldLabel>name</FieldLabel>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className={fieldErrors.name ? "border-red-500" : ""}
          />
          {fieldErrors.name && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>
          )}
        </Field>
      )}

      <Field>
        <FieldLabel>email</FieldLabel>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john@example.com"
          className={fieldErrors.email ? "border-red-500" : ""}
        />
        {fieldErrors.email && (
          <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
        )}
      </Field>

      <Field>
        <FieldLabel>password</FieldLabel>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className={fieldErrors.password ? "border-red-500" : ""}
        />
        {fieldErrors.password && (
          <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
        )}
      </Field>

      {isSignUp && (
        <Field>
          <FieldLabel>confirm password</FieldLabel>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className={fieldErrors.confirmPassword ? "border-red-500" : ""}
          />
          {fieldErrors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </Field>
      )}

      {generalError && (
        <p className="text-red-500 text-sm text-center font-medium">
          {generalError}
        </p>
      )}

      <Button
        className="w-full bg-white text-black font-bold h-11"
        onClick={handleAuth}
        disabled={loading}
      >
        {loading ? "please wait..." : isSignUp ? "sign up" : "sign in"}
      </Button>

      <button
        onClick={() => {
          setFieldErrors({});
          setGeneralError("");
          setPassword("");
          setConfirmPassword("");
          setIsSignUp(!isSignUp);
        }}
        className="text-sm text-zinc-400 hover:text-white transition-colors"
      >
        {isSignUp
          ? "already have an account? sign in"
          : "need an account? sign up"}
      </button>
    </div>
  );
}
