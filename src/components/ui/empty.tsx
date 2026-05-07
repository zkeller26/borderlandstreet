import * as React from "react";

export function Empty({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border-strong bg-surface/50 px-6 py-10 text-center">
      <p className="text-base font-medium text-fg">{title}</p>
      {description && (
        <p className="mx-auto mt-1 max-w-sm text-sm text-fg-muted">{description}</p>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
