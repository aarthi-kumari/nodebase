import Link from "next/link";
import { PlusIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export const EntityContainer = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("mx-auto w-full max-w-screen-xl p-4 md:p-6", className)}>
      {children}
    </div>
  );
};

type EntityHeaderProps = {
  title: string;
  description?: string;
  newButtonLabel?: string;
  disabled?: boolean;
  isCreating?: boolean;
} & (
  | { onNew: () => void; newButtonHref?: never }
  | { newButtonHref: string; onNew?: never }
  | { onNew?: never; newButtonHref?: never }
);

export const EntityHeader = ({
  title,
  description,
  newButtonLabel = "New",
  disabled,
  isCreating,
  onNew,
  newButtonHref,
}: EntityHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          {title}
        </h1>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {onNew ? (
        <Button
          onClick={onNew}
          disabled={disabled || isCreating}
          className="shrink-0"
        >
          {isCreating ? <Spinner /> : <PlusIcon />}
          {newButtonLabel}
        </Button>
      ) : null}
      {newButtonHref ? (
        <Button asChild disabled={disabled} className="shrink-0">
          <Link href={newButtonHref}>
            <PlusIcon />
            {newButtonLabel}
          </Link>
        </Button>
      ) : null}
    </div>
  );
};

export const EntityGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const EntityCard = ({
  href,
  title,
  subtitle,
  media,
  actions,
  className,
}: {
  href: string;
  title: string;
  subtitle?: string;
  media?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border bg-card shadow-sm transition-colors hover:bg-accent/30",
        className,
      )}
    >
      <Link href={href} className="flex flex-1 flex-col gap-4 p-5">
        {media ? (
          <div className="flex size-10 items-center justify-center rounded-lg border bg-muted">
            {media}
          </div>
        ) : null}
        <div className="flex min-w-0 flex-col gap-1 pr-8">
          <h3 className="truncate font-medium">{title}</h3>
          {subtitle ? (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </Link>
      {actions ? (
        <div className="absolute top-3 right-3">{actions}</div>
      ) : null}
    </div>
  );
};

export const EntityEmpty = ({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) => {
  return (
    <Empty className="border">
      <EmptyHeader>
        {icon ? <EmptyMedia variant="icon">{icon}</EmptyMedia> : null}
        <EmptyTitle>{title}</EmptyTitle>
        {description ? (
          <EmptyDescription>{description}</EmptyDescription>
        ) : null}
      </EmptyHeader>
      {action ? <EmptyContent>{action}</EmptyContent> : null}
    </Empty>
  );
};

export const EntityLoading = ({ count = 8 }: { count?: number }) => {
  return (
    <EntityGrid>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-[140px] w-full rounded-xl" />
      ))}
    </EntityGrid>
  );
};

export const EntityError = ({
  message = "Something went wrong. Please try again.",
}: {
  message?: string;
}) => {
  return (
    <Empty className="border border-destructive/30">
      <EmptyHeader>
        <EmptyTitle>Unable to load</EmptyTitle>
        <EmptyDescription>{message}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};
