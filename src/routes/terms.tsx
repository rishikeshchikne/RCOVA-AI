import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: seo("Terms of Service", "The terms that govern your use of the RCOVA AI platform."),
  }),
  component: () => (
    <LegalPage
      title="Terms of Service"
      sections={[
        {
          heading: "Using RCOVA AI",
          body: (
            <p>
              By creating an account you agree to use RCOVA AI lawfully and responsibly, and not to
              misuse the service or attempt to access it in unauthorized ways.
            </p>
          ),
        },
        {
          heading: "Accounts",
          body: (
            <p>
              You are responsible for keeping your login details secure and for activity under your
              account.
            </p>
          ),
        },
        {
          heading: "Credits and plans",
          body: (
            <p>
              AI actions consume credits. Welcome credits are one-time. Monthly plan credits refresh
              each billing cycle. Prices and allowances may change with notice.
            </p>
          ),
        },
        {
          heading: "AI-generated content",
          body: (
            <p>
              AI output can be inaccurate. Review results before relying on them, especially for
              important decisions.
            </p>
          ),
        },
        {
          heading: "Payments and cancellation",
          body: (
            <p>
              Paid plans are not available to purchase yet. When they launch, they will renew monthly
              until cancelled, and billing details will be shown clearly before any purchase.
            </p>
          ),
        },
        {
          heading: "Changes",
          body: (
            <p>
              We may update these terms as the service evolves. Continued use means you accept the
              updated terms.
            </p>
          ),
        },
      ]}
    />
  ),
});
