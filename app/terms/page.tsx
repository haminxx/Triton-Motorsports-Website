"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BlurFade } from "@/components/ui/blur-fade";
import { PageEnter } from "@/components/page-motion";

const LAST_UPDATED = "July 10, 2026";

export default function TermsPage() {
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
              Terms and Conditions
            </h1>
            <p className="mt-4 text-sm text-black/50">
              Last updated: {LAST_UPDATED}
            </p>
          </BlurFade>

          <BlurFade delay={0.1} className="mt-12 space-y-10 text-base leading-relaxed text-black/70">
            <section>
              <h2 className="text-xl font-semibold tracking-tight text-[#0a1218]">
                1. Agreement to Terms
              </h2>
              <p className="mt-4">
                These Terms and Conditions (&quot;Terms&quot;) govern your access
                to and use of the website operated by Triton Motorsports (the
                &quot;Team,&quot; &quot;we,&quot; &quot;us,&quot; or
                &quot;our&quot;), a student-led organization that competes in
                the Collegiate Racing Series (&quot;CRS&quot;). By accessing or
                using our website and any related pages, tools, or services
                (collectively, the &quot;Site&quot;), you agree to be bound by
                these Terms. If you do not agree, you must not use the Site.
              </p>
              <p className="mt-4">
                These Terms apply to all visitors, prospective applicants,
                sponsors, partners, and registered staff users. Additional terms
                may apply to specific features, including the Staff Portal and
                recruitment application process, as described below.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-[#0a1218]">
                2. About Triton Motorsports
              </h2>
              <p className="mt-4">
                Triton Motorsports is a student organization focused on
                collegiate motorsport, engineering, operations, media, and
                competition within the Collegiate Racing Series. The Site
                provides information about our program, team, sponsors,
                recruitment, contact channels, and internal staff tools. The
                Site is maintained by the Team.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-[#0a1218]">
                3. Eligibility and Account Requirements
              </h2>
              <p className="mt-4">
                General use of the Site is open to the public. Access to the
                Staff Portal is restricted to current Team members and
                authorized personnel who meet the following requirements:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>
                  A valid email address
                </li>
                <li>
                  A valid invite code issued by Team leadership for account
                  creation or password recovery
                </li>
                <li>
                  Compliance with Team conduct standards
                </li>
              </ul>
              <p className="mt-4">
                You are responsible for maintaining the confidentiality of your
                Staff Portal credentials and for all activity that occurs under
                your account. You must notify Team leadership promptly if you
                suspect unauthorized access.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-[#0a1218]">
                4. Acceptable Use of the Website
              </h2>
              <p className="mt-4">When using the Site, you agree not to:</p>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>
                  Violate any applicable federal, state, or local law or
                  regulation
                </li>
                <li>
                  Attempt to gain unauthorized access to the Staff Portal,
                  servers, databases, or connected systems
                </li>
                <li>
                  Interfere with or disrupt the Site, including through
                  automated scraping, denial-of-service activity, or introduction
                  of malware
                </li>
                <li>
                  Misrepresent your affiliation with Triton Motorsports or the
                  Collegiate Racing Series
                </li>
                <li>
                  Upload, transmit, or distribute content that is unlawful,
                  harassing, defamatory, obscene, or infringing
                </li>
                <li>
                  Use contact forms, chat features, or recruitment tools to
                  send spam, solicitations unrelated to our mission, or abusive
                  messages
                </li>
                <li>
                  Reproduce, duplicate, copy, or resell any portion of the Site
                  for commercial purposes without prior written consent
                </li>
              </ul>
              <p className="mt-4">
                We reserve the right to restrict or terminate access for conduct
                that we reasonably believe violates these Terms or harms the
                Team, its members, or third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-[#0a1218]">
                5. Staff Portal Terms
              </h2>
              <p className="mt-4">
                The Staff Portal is an internal access point for authorized Team
                members. It is provided on an &quot;as available&quot; basis for
                coordination purposes.
              </p>
              <h3 className="mt-6 text-lg font-medium text-[#0a1218]">
                5.1 Account creation and recovery
              </h3>
              <p className="mt-3">
                Staff accounts require a valid email and a valid invite
                code distributed by Team leadership. Invite codes may be
                rotated, revoked, or limited in scope. Password recovery also
                requires a valid invite code. We may suspend or delete accounts
                when membership ends, credentials are compromised, or these
                Terms are violated.
              </p>
              <h3 className="mt-6 text-lg font-medium text-[#0a1218]">
                5.2 Local storage and session data
              </h3>
              <p className="mt-3">
                The Staff Portal may store authentication-related data locally
                in your browser (for example, via localStorage) to maintain
                session state. You should only use the Staff Portal on devices
                you control and should sign out or clear browser data on shared
                machines. See our{" "}
                <Link href="/privacy/" className="underline underline-offset-2 hover:text-[#0a1218]">
                  Privacy Policy
                </Link>{" "}
                for details on how we handle personal information.
              </p>
              <h3 className="mt-6 text-lg font-medium text-[#0a1218]">
                5.3 No guarantee of availability
              </h3>
              <p className="mt-3">
                The Staff Portal may be modified, limited, or discontinued at
                any time without notice. We do not guarantee uninterrupted
                access, permanent retention of account data, or compatibility
                with all browsers or devices.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-[#0a1218]">
                6. Recruitment and Applications
              </h2>
              <p className="mt-4">
                The Site describes Team roles—including Driver, Engineer, PIT
                Crew, Media Team, Content Creator, and Operations Team—and may
                link to external application forms for specific recruitment
                cycles (for example, Fall 2026). Role descriptions are provided
                for informational purposes and may change based on competition
                needs, CRS regulations, and Team capacity.
              </p>
              <p className="mt-4">
                Submitting an application does not guarantee selection,
                membership, driving time, travel assignment, or any specific role.
                Selection decisions are made by Team leadership based on skill,
                availability, conduct, safety requirements, and organizational
                needs. Additional eligibility, licensing, fitness, or safety
                requirements may apply to competition roles, particularly for
                drivers and pit crew, as mandated by CRS rules and event
                organizers.
              </p>
              <p className="mt-4">
                Recruitment chat and inquiry features on the Site are powered by
                automated or semi-automated tools intended to answer general
                questions. Responses may be incomplete or outdated and do not
                constitute a binding offer of membership or employment.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-[#0a1218]">
                7. Intellectual Property
              </h2>
              <p className="mt-4">
                Unless otherwise noted, the Site and its content—including text,
                graphics, logos, photographs, videos, page design, and software—are
                owned by Triton Motorsports or used with permission and are protected by
                copyright, trademark, and other intellectual property laws.
              </p>
              <p className="mt-4">
                You may view and share links to publicly available pages for
                personal, non-commercial purposes. You may not copy, modify,
                distribute, publicly display, create derivative works from, or
                exploit Site content without prior written permission from the
                Team, except where allowed by law (such as brief quotation for
                commentary or news reporting).
              </p>
              <p className="mt-4">
                &quot;Collegiate Racing Series&quot; and &quot;CRS&quot; are
                trademarks or service marks of their respective owners. Use of
                those marks on this Site does not imply endorsement beyond the
                Team&apos;s stated participation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-[#0a1218]">
                8. User Submissions and Communications
              </h2>
              <p className="mt-4">
                When you submit information through contact forms, sponsorship
                inquiries, recruitment chat, or other Site features, you
                represent that the information is accurate to the best of your
                knowledge and that you have the right to provide it. You grant
                us a non-exclusive license to use submissions for responding to
                your inquiry, evaluating recruitment interest, managing sponsor
                relationships, and operating the Site.
              </p>
              <p className="mt-4">
                Do not submit confidential trade secrets, sensitive personal data
                unrelated to your inquiry, or content you do not have permission
                to share. We may retain communications as described in our{" "}
                <Link href="/privacy/" className="underline underline-offset-2 hover:text-[#0a1218]">
                  Privacy Policy
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-[#0a1218]">
                9. Third-Party Links and Services
              </h2>
              <p className="mt-4">
                The Site may contain links to third-party websites or services,
                including social media platforms (such as Instagram and
                LinkedIn), external application forms, sponsor sites, CRS
                resources, and embedded media. We do not control and are not
                responsible for the content, privacy practices, or availability
                of third-party services. Your use of third-party sites is
                governed by their own terms and policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-[#0a1218]">
                10. Disclaimers
              </h2>
              <p className="mt-4">
                THE SITE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS
                AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER
                EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF
                MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND
                NON-INFRINGEMENT.
              </p>
              <p className="mt-4">
                Without limiting the foregoing, we do not warrant that the Site
                will be uninterrupted, error-free, secure, or free of harmful
                components; that information on the Site is complete, current,
                or accurate; or that Staff Portal authentication meets any
                particular security standard. Motorsport activities involve
                inherent risks. Information about driving, engineering, pit
                operations, or event participation is educational and does not
                replace formal training, supervision, or compliance with CRS and
                venue safety requirements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-[#0a1218]">
                11. Limitation of Liability
              </h2>
              <p className="mt-4">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, TRITON
                MOTORSPORTS, ITS MEMBERS, OFFICERS, VOLUNTEERS, AND AFFILIATES
                WILL NOT BE LIABLE FOR ANY INDIRECT,
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE
                DAMAGES, OR ANY LOSS OF PROFITS, DATA, GOODWILL, OR OTHER
                INTANGIBLE LOSSES, ARISING OUT OF OR RELATED TO YOUR USE OF OR
                INABILITY TO USE THE SITE, EVEN IF ADVISED OF THE POSSIBILITY OF
                SUCH DAMAGES.
              </p>
              <p className="mt-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL LIABILITY FOR
                ANY CLAIM ARISING OUT OF OR RELATING TO THESE TERMS OR THE SITE
                WILL NOT EXCEED ONE HUNDRED U.S. DOLLARS (US $100) OR THE
                MINIMUM AMOUNT REQUIRED TO BE PERMITTED UNDER APPLICABLE LAW,
                WHICHEVER IS GREATER.
              </p>
              <p className="mt-4">
                Some jurisdictions do not allow certain limitations of liability
                or disclaimers of implied warranties, so some of the above
                limitations may not apply to you.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-[#0a1218]">
                12. Indemnification
              </h2>
              <p className="mt-4">
                You agree to indemnify, defend, and hold harmless Triton
                Motorsports and
                its members, officers, and volunteers from and against any
                claims, liabilities, damages, losses, and expenses (including
                reasonable attorneys&apos; fees) arising out of or related to your
                use of the Site, your violation of these Terms, or your
                violation of any rights of another person or entity.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-[#0a1218]">
                13. Governing Law and Dispute Resolution
              </h2>
              <p className="mt-4">
                These Terms are governed by the laws of the State of California,
                without regard to conflict-of-law principles. You agree that any
                dispute arising out of or relating to these Terms or the Site
                will be brought exclusively in the state or federal courts
                located in San Diego County, California, and you consent to the
                personal jurisdiction of those courts.
              </p>
              <p className="mt-4">
                Before initiating formal proceedings, you agree to contact us at{" "}
                <a
                  href="mailto:ucsdxcrs@gmail.com"
                  className="underline underline-offset-2 hover:text-[#0a1218]"
                >
                  ucsdxcrs@gmail.com
                </a>{" "}
                and attempt to resolve the dispute informally within thirty (30)
                days.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-[#0a1218]">
                14. Modifications to These Terms
              </h2>
              <p className="mt-4">
                We may update these Terms from time to time to reflect changes
                in our practices, Site features, legal requirements, or Team
                operations. When we make material changes, we will update the
                &quot;Last updated&quot; date at the top of this page. Your
                continued use of the Site after changes become effective
                constitutes acceptance of the revised Terms. If you do not agree
                to the updated Terms, you must stop using the Site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-[#0a1218]">
                15. Termination
              </h2>
              <p className="mt-4">
                We may suspend or terminate your access to the Site or Staff
                Portal at any time, with or without notice, for conduct that we
                believe violates these Terms, poses a security risk, or is
                otherwise harmful to the Team. Provisions that by their nature
                should survive termination—including intellectual property,
                disclaimers, limitation of liability, indemnification, and
                governing law—will survive.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-[#0a1218]">
                16. Severability and Entire Agreement
              </h2>
              <p className="mt-4">
                If any provision of these Terms is held invalid or unenforceable,
                the remaining provisions will remain in full force and effect.
                These Terms, together with our Privacy Policy and any
                feature-specific notices, constitute the entire agreement
                between you and Triton Motorsports regarding use of the Site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-[#0a1218]">
                17. Contact Us
              </h2>
              <p className="mt-4">
                Questions about these Terms may be directed to:
              </p>
              <address className="mt-4 not-italic">
                <p className="font-medium text-[#0a1218]">Triton Motorsports</p>
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
                For privacy-related requests, please see our{" "}
                <Link href="/privacy/" className="underline underline-offset-2 hover:text-[#0a1218]">
                  Privacy Policy
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
