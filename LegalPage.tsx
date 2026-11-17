import type { ReactNode } from "react";
import { DemoNotice } from "./DemoNotice";
import { PageHeader } from "./Section";

export function LegalPage({
  title,
  sections,
}: {
  title: string;
  sections: { heading: string; body: ReactNode }[];
}) {
  return (
    <>
      <PageHeader eyebrow="Legal" title={title} />
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <DemoNotice title="Draft document">
          This is a draft outline and must be reviewed by qualified legal counsel before RCOVA AI
          launches.
        </DemoNotice>
        <div className="mt-10 space-y-10">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-xl font-semibold">{s.heading}</h2>
              <div className="mt-3 space-y-3 leading-relaxed text-muted-foreground">{s.body}</div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
