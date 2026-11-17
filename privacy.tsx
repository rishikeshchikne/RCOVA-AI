import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: seo("Privacy Policy", "How RCOVA AI collects, uses and protects your information."),
  }),
  component: () => (
    <LegalPage
      title="Privacy Policy"
      sections={[
        {
          heading: "Information we collect",
          body: (
            <p>
              Account details you provide (such as your name and email), the content you submit to
              AI tools, your saved AI Chat conversations, messages you send through our Contact
              page, and a record of credit usage needed to run the service.
            </p>
          ),
        },
        {
          heading: "How we use information",
          body: (
            <p>
              To provide and improve RCOVA AI, process your requests, maintain your credit balance
              and subscription, and keep the platform secure.
            </p>
          ),
        },
        {
          heading: "AI processing",
          body: (
            <p>
              Requests to AI tools are processed on our servers and may be sent to trusted AI
              providers solely to generate your response. API keys are never exposed in your
              browser.
            </p>
          ),
        },
        {
          heading: "Storage of your content",
          body: (
            <p>
              AI Chat conversations are saved to your account so you can return to them, and you can
              delete any conversation at any time. AI Writer and AI Study results are not saved after
              you leave the page.
            </p>
          ),
        },
        {
          heading: "Payments",
          body: (
            <p>
              Paid plans are not available to purchase yet. When they launch, payments will be
              handled by a verified payment provider and RCOVA AI will not store full card details.
            </p>
          ),
        },
        {
          heading: "Your choices",
          body: (
            <p>
              You can update your profile, request a copy of your data, or ask us to delete your
              account.
            </p>
          ),
        },
        {
          heading: "Contact",
          body: <p>Questions about privacy can be sent through our Contact page.</p>,
        },
      ]}
    />
  ),
});
