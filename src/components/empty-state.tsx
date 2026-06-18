import { ButtonLink } from "./button";

export function EmptyState({ title, actionHref, actionLabel }: { title: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div className="border border-dashed border-black bg-white p-10 text-center">
      <p className="text-2xl font-black">{title}</p>
      {actionHref && actionLabel ? (
        <ButtonLink href={actionHref} className="mt-6" variant="secondary">
          {actionLabel}
        </ButtonLink>
      ) : null}
    </div>
  );
}
