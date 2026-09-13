"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BlurFade } from "@/components/ui/blur-fade";
import { PageEnter } from "@/components/page-motion";

const LAST_UPDATED = "July 10, 2026";

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#F2F0EF] text-[#0a1218]">
        <PageEnter className="mx-auto max-w-3xl px-6 pb-24 pt-28 md:px-10 md:pb-32 md:pt-32 lg:px-12">
          <BlurFade delay={0.05}>
            <p className="font-mono text-[11px] tracking-[0.2em] text-black/40 uppercase">
              Legal
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-4 text-sm text-black/50">
              Last updated: {LAST_UPDATED}
            </p>
          </BlurFade>

          <BlurFade delay={0.1} className="mt-12 space-y-10 text-base leading-relaxed text-black/70">
            <section>
              <h2 className="text-xl font-semibold tracking-tight text-[#0a1218]">
                1. Introduction
              </h2>
              <p className="mt-4">
                Triton Motorsports (&quot;we,&quot; &quot;us,&quot; or
                &quot;our&quot;) is a student-led racing and engineering
                organization competing in the Collegiate Racing Series. This
                Privacy Policy explains how we collect, use, disclose, and
                protect information when you visit our website, use our contact
                and recruitment features, or access the Staff Portal.
              </p>
              <p className="mt-4">
                We are committed to handling personal information responsibly
                and transparently. This policy is designed to meet the
                expectations of California residents, including rights provided
                under the California Consumer Privacy Act as amended by the
                California Privacy Rights Act (collectively, &quot;CCPA&quot;),
                where applicable to our operations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-[#0a1218]">
                2. Information We Collect
              </h2>
              <p className="mt-4">
                The information we collect depends on how you interact with the
                Site. We collect only what is reasonably necessary to operate
                our website, respond to inquiries, manage recruitment interest,
                and support authorized staff access.
              </p>

              <h3 className="mt-6 text-lg font-medium text-[#0a1218]">
                2.1 Information you provide directly
              </h3>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>
                  <strong className="text-[#0a1218]">Contact and sponsorship inquiries:</strong>{" "}
                  Name, email address, organization or affiliation, message
                  content, and any optional details you include in our contact
                  form (for example, sponsorship interest or project
                  descriptions).
                </li>
                <li>
                  <strong className="text-[#0a1218]">Recruitment chat and inquiries:</strong>{" "}
                  Messages you submit through recruitment chat or related
                  features, including questions about roles such as Driver,
                  Engineer, PIT Crew, Media Team, Content Creator, or
                  Operations Team.
                </li>
                <li>
                  <strong className="text-[#0a1218]">Staff Portal registration:</strong>{" "}
                  Email address, password (stored in hashed form where
                  applicable), and invite code used during account creation or
                  password recovery.
                </li>
                <li>
                  <strong className="text-[#0a1218]">External applications:</strong>{" "}
                  If you apply through a linked third-party form (for example, a
                  Fall 2026 application), that provider may collect additional
                  information under its own privacy policy. We receive only the
                  data made available to us through that process.
                </li>
              </ul>

              <h3 className="mt-6 text-lg font-medium text-[#0a1218]">
                2.2 Information collected automatically
              </h3>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>
                  <strong className="text-[#0a1218]">Device and usage data:</strong>{" "}
                  Browser type, device type, operating system, pages viewed,
                  referring URLs, general interaction patterns, and approximate
                  access times.
                </li>
                <li>
                  <strong className="text-[#0a1218]">Local storage:</strong>{" "}
                  The Staff Portal may store session-related data in your
                  browser&apos;s localStorage to keep you signed in or remember
                  portal state. This data remains on your device unless cleared.
                </li>
                <li>
                  <strong className="text-[#0a1218]">Cookies and similar technologies:</strong>{" "}
                  We may use essential cookies required for basic Site
                  functionality. If we enable analytics or performance
                  measurement tools, those services may use cookies or similar
                  identifiers to aggregate usage statistics. Where required, we
                  will provide notice and choices regarding non-essential
                  cookies.
                </li>
              </ul>

              <h3 className="mt-6 text-lg font-medium text-[#0a1218]">
                2.3 Information we do not intentionally collect
              </h3>
              <p className="mt-3">
                We do not knowingly collect Social Security numbers, financial
                account credentials, precise geolocation for tracking purposes,
                or sensitive health information through the Site. Please do not
                submit sensitive personal information through contact forms or
                chat unless we specifically request it for a defined purpose.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-[#0a1218]">
                3. How We Use Your Information
              </h2>
              <p className="mt-4">We use collected information to:</p>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>Operate, maintain, and improve the Site and its features</li>
                <li>
                  Respond to contact, sponsorship, and general inquiry messages
                </li>
                <li>
                  Answer recruitment questions and direct prospective members
                  to appropriate resources
                </li>
                <li>
                  Authenticate Staff Portal users and manage internal access
                </li>
                <li>
                  Communicate with Team members about operations, events, and
                  organizational updates
                </li>
                <li>
                  Monitor for abuse, spam, security incidents, and violations of
                  our{" "}
                  <Link href="/terms/" className="underline underline-offset-2 hover:text-[#0a1218]">
                    Terms and Conditions
                  </Link>
                </li>
                <li>
                  Comply with applicable law and legitimate organizational
                  record-keeping needs
                </li>
                <li>
                  Analyze aggregated or de-identified usage trends to improve
                  content and usability
                </li>
              </ul>
              <p className="mt-4">
                We do not sell your personal information. We do not use Staff
                Portal credentials or contact form data for unrelated commercial
                marketing.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-[#0a1218]">
                4. Staff Portal Access
              </h2>
              <p className="mt-4">
                Staff Portal accounts are limited to authorized Team members
                with a valid invite code. If you are no longer affiliated with
                the Team, your Staff Portal access may be revoked.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-[#0a1218]">
                5. How We Share Information
              </h2>
              <p className="mt-4">
                We share personal information only in the circumstances
                described below:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>
                  <strong className="text-[#0a1218]">Team leadership and authorized members:</strong>{" "}
                  Contact and recruitment messages may be reviewed by officers
                  or leads responsible for outreach, sponsorship, or recruitment.
                </li>
                <li>
                  <strong className="text-[#0a1218]">Service providers:</strong>{" "}
                  We may use hosting, form handling, email, analytics, or AI
                  chat infrastructure providers that process data on our behalf
                  under contractual obligations to protect it and use it only for
                  specified services.
                </li>
                <li>
                  <strong className="text-[#0a1218]">Legal and safety:</strong>{" "}
                  We may disclose information if required by law, court order,
                  or governmental request, or when we believe disclosure is
                  necessary to protect the rights, safety, or property of the
                  Team, our members, or others.
                </li>
                <li>
                  <strong className="text-[#0a1218]">With your direction:</strong>{" "}
                  When you ask us to share information or follow a link to a
                  third-party service, that service&apos;s policies apply.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-[#0a1218]">
                6. Data Retention
              </h2>
              <p className="mt-4">
                We retain personal information only for as long as reasonably
                necessary for the purposes described in this policy, unless a
                longer retention period is required or permitted by law.
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>
                  <strong className="text-[#0a1218]">Contact and sponsorship messages:</strong>{" "}
                  Typically retained for up to twenty-four (24) months after
                  resolution of the inquiry, unless a longer period is needed for
                  ongoing partnership discussions.
                </li>
                <li>
                  <strong className="text-[#0a1218]">Recruitment chat logs:</strong>{" "}
                  Retained for a limited period sufficient to improve responses
                  and follow up with prospective applicants, generally not longer
                  than eighteen (18) months.
                </li>
                <li>
                  <strong className="text-[#0a1218]">Staff Portal accounts:</strong>{" "}
                  Retained while membership is active and for a short period
                  thereafter, after which credentials and associated records
                  may be deleted or deactivated.
                </li>
                <li>
                  <strong className="text-[#0a1218]">Server and security logs:</strong>{" "}
                  May be retained for a shorter operational window for
                  troubleshooting and incident response.
                </li>
              </ul>
              <p className="mt-4">
                Retention practices may vary based on available tooling and Team
                capacity. We periodically review stored data and delete or
                de-identify information that is no longer needed.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-[#0a1218]">
                7. Security
              </h2>
              <p className="mt-4">
                We implement reasonable administrative, technical, and
                organizational measures designed to protect personal information
                against unauthorized access, alteration, disclosure, or
                destruction. These measures may include access controls,
                invite-code gating for Staff Portal actions, hashed password
                storage where supported, and use of reputable hosting providers.
              </p>
              <p className="mt-4">
                No method of transmission over the Internet or electronic storage
                is completely secure. We cannot guarantee absolute security. You
                are responsible for safeguarding your Staff Portal password and
                for using secure devices and networks when accessing the Site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-[#0a1218]">
                8. Children&apos;s Privacy
              </h2>
              <p className="mt-4">
                The Site is intended for a general audience and for prospective
                university-age applicants. We do not knowingly collect personal
                information from children under thirteen (13) years of age. If
                you believe we have collected information from a child under 13,
                please contact us and we will take steps to delete it promptly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-[#0a1218]">
                9. California Privacy Rights
              </h2>
              <p className="mt-4">
                If you are a California resident, you may have the following
                rights under the CCPA, subject to certain exceptions:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>
                  <strong className="text-[#0a1218]">Right to know:</strong>{" "}
                  Request disclosure of the categories and specific pieces of
                  personal information we have collected about you, the sources,
                  purposes, and categories of third parties with whom we share
                  it.
                </li>
                <li>
                  <strong className="text-[#0a1218]">Right to delete:</strong>{" "}
                  Request deletion of personal information we collected from
                  you, subject to legal or operational retention needs.
                </li>
                <li>
                  <strong className="text-[#0a1218]">Right to correct:</strong>{" "}
                  Request correction of inaccurate personal information we
                  maintain about you.
                </li>
                <li>
                  <strong className="text-[#0a1218]">Right to opt out of sale or sharing:</strong>{" "}
                  We do not sell personal information and do not share it for
                  cross-context behavioral advertising as defined under
                  California law.
                </li>
                <li>
                  <strong className="text-[#0a1218]">Right to limit use of sensitive personal information:</strong>{" "}
                  We do not use sensitive personal information for purposes
                  requiring a &quot;limit&quot; right under California law.
                </li>
                <li>
                  <strong className="text-[#0a1218]">Right to non-discrimination:</strong>{" "}
                  We will not discriminate against you for exercising your
                  privacy rights.
                </li>
              </ul>
              <p className="mt-4">
                To submit a privacy request, email{" "}
                <a
                  href="mailto:ucsdxcrs@gmail.com"
                  className="underline underline-offset-2 hover:text-[#0a1218]"
                >
                  ucsdxcrs@gmail.com
                </a>{" "}
                with the subject line &quot;California Privacy Request.&quot; We
                will verify your request using reasonable methods, which may
                include confirming control of the email address associated with
                your inquiry or account. Authorized agents may submit requests on
                your behalf where permitted by law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-[#0a1218]">
                10. International Users
              </h2>
              <p className="mt-4">
                The Site is operated from the United States. If you access the
                Site from outside the United States, you understand that your
                information may be processed and stored in the U.S. and other
                jurisdictions where our service providers operate. Those
                jurisdictions may have data protection laws that differ from
                those in your country.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-[#0a1218]">
                11. Third-Party Links and Embedded Services
              </h2>
              <p className="mt-4">
                Our Site may link to Instagram, LinkedIn, external application
                platforms, sponsor websites, CRS resources, and other third-party
                services. We are not responsible for the privacy practices of
                those services. We encourage you to review the privacy policies
                of any third-party site you visit.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-[#0a1218]">
                12. Changes to This Policy
              </h2>
              <p className="mt-4">
                We may update this Privacy Policy from time to time to reflect
                changes in our practices, technology, legal requirements, or Site
                features. When we make material changes, we will update the
                &quot;Last updated&quot; date at the top of this page. We
                encourage you to review this policy periodically. Continued use
                of the Site after changes take effect constitutes acceptance of
                the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-[#0a1218]">
                13. Contact Us
              </h2>
              <p className="mt-4">
                For privacy questions, requests, or concerns, contact:
              </p>
              <address className="mt-4 not-italic">
                <p className="font-medium text-[#0a1218]">
                  Triton Motorsports — Privacy
                </p>
                <p className="mt-2">
                  Email:{" "}
                  <a
                    href="mailto:ucsdxcrs@gmail.com"
                    className="underline underline-offset-2 hover:text-[#0a1218]"
                  >
                    ucsdxcrs@gmail.com
                  </a>
                </p>
              </address>
              <p className="mt-4">
                For general terms governing use of the Site, see our{" "}
                <Link href="/terms/" className="underline underline-offset-2 hover:text-[#0a1218]">
                  Terms and Conditions
                </Link>
                .
              </p>
            </section>
          </BlurFade>
        </PageEnter>
      </main>
      <SiteFooter />
    </>
  );
}
