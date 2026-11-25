"use client";

import * as React from "react";
import Link from "next/link";
import { signInAction, signUpAction } from "@/app/actions/auth";
import { Field, fieldProps } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ActionState } from "@/lib/action-state";
import { authClient } from "@/lib/auth-client";

function FormMessage({ state }: { state: ActionState }) {
  if (!state || state.ok || !state.message) return null;
  return (
    <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {state.message}
    </p>
  );
}

export function LoginForm({ githubEnabled }: { githubEnabled: boolean }) {
  const [state, formAction, pending] = React.useActionState(signInAction, null);
  const errors = state?.errors;
  return (
    <div className="grid gap-4">
      <form action={formAction} className="grid gap-4" noValidate>
        <FormMessage state={state} />
        <Field name="email" label="Email" errors={errors?.email}>
          <Input
            {...fieldProps("email", errors?.email)}
            type="email"
            autoComplete="email"
            defaultValue={state?.values?.email ?? ""}
          />
        </Field>
        <Field name="password" label="Mật khẩu" errors={errors?.password}>
          <Input {...fieldProps("password", errors?.password)} type="password" autoComplete="current-password" />
        </Field>
        <Button type="submit" disabled={pending}>
          {pending ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </form>
      <GitHubButton enabled={githubEnabled} />
      <p className="text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
          Đăng ký
        </Link>
      </p>
    </div>
  );
}

export function RegisterForm({ githubEnabled }: { githubEnabled: boolean }) {
  const [state, formAction, pending] = React.useActionState(signUpAction, null);
  const errors = state?.errors;
  return (
    <div className="grid gap-4">
      <form action={formAction} className="grid gap-4" noValidate>
        <FormMessage state={state} />
        <Field name="name" label="Tên hiển thị" errors={errors?.name}>
          <Input
            {...fieldProps("name", errors?.name)}
            autoComplete="name"
            defaultValue={state?.values?.name ?? ""}
          />
        </Field>
        <Field name="email" label="Email" errors={errors?.email}>
          <Input
            {...fieldProps("email", errors?.email)}
            type="email"
            autoComplete="email"
            defaultValue={state?.values?.email ?? ""}
          />
        </Field>
        <Field name="password" label="Mật khẩu" errors={errors?.password} hint="Tối thiểu 8 ký tự">
          <Input {...fieldProps("password", errors?.password)} type="password" autoComplete="new-password" />
        </Field>
        <Button type="submit" disabled={pending}>
          {pending ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
        </Button>
      </form>
      <GitHubButton enabled={githubEnabled} />
      <p className="text-center text-sm text-muted-foreground">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}

function GitHubButton({ enabled }: { enabled: boolean }) {
  const [loading, setLoading] = React.useState(false);
  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        hoặc
        <span className="h-px flex-1 bg-border" />
      </div>
      <Button
        type="button"
        variant="outline"
        disabled={!enabled || loading}
        onClick={async () => {
          setLoading(true);
          await authClient.signIn.social({ provider: "github", callbackURL: "/dashboard" });
          setLoading(false);
        }}
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
          <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a10.9 10.9 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
        </svg>
        {loading ? "Đang chuyển hướng..." : "Tiếp tục với GitHub"}
      </Button>
      {!enabled ? (
        <p className="text-xs text-muted-foreground">
          Chưa bật: cần đặt GITHUB_CLIENT_ID và GITHUB_CLIENT_SECRET trong biến môi trường.
        </p>
      ) : null}
    </div>
  );
}
