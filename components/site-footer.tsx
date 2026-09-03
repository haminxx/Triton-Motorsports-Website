import Image from "next/image";
import Link from "next/link";

const exploreLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about-us/" },
  { name: "Program", href: "/program/" },
];

const connectLinks = [
  { name: "Sponsors", href: "/sponsors/" },
  { name: "Recruitment", href: "/recruitment/" },
  { name: "Contact", href: "/contact/" },
];

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const socialLinks = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/ucsd_crs/",
    icon: InstagramIcon,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/ucsd-crs",
    icon: LinkedInIcon,
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-black text-[#F2F0EF]">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-12 lg:py-24">
        <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <Link href="/" aria-label="Triton Motor Sports home" className="inline-block">
              <Image
                src="/images/triton-motor-sports-logo.png"
                alt="Triton Motor Sports"
                width={400}
                height={400}
                className="h-14 w-auto object-contain md:h-16"
                unoptimized
              />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#F2F0EF]/60">
              Student-led racing and engineering at UC San Diego, competing in
              the Collegiate Racing Series.
            </p>
            <div className="mt-7 flex items-center gap-5">
              {socialLinks.map(({ name, href, icon: Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="text-[#F2F0EF]/60 transition-colors duration-200 hover:text-[#F2F0EF]"
                >
                  <Icon className="size-5" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3 lg:justify-items-start lg:gap-12">
            <div>
              <p className="text-sm font-medium tracking-wide text-[#F2F0EF]">Explore</p>
              <ul className="mt-5 space-y-3.5">
                {exploreLinks.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-[#F2F0EF]/60 transition-colors duration-200 hover:text-[#F2F0EF]"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm font-medium tracking-wide text-[#F2F0EF]">Connect</p>
              <ul className="mt-5 space-y-3.5">
                {connectLinks.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-[#F2F0EF]/60 transition-colors duration-200 hover:text-[#F2F0EF]"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <p className="text-sm font-medium tracking-wide text-[#F2F0EF]">Follow</p>
              <ul className="mt-5 space-y-3.5">
                {socialLinks.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#F2F0EF]/60 transition-colors duration-200 hover:text-[#F2F0EF]"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-[#F2F0EF]/15 pt-8">
          <div className="flex flex-col gap-5 text-sm text-[#F2F0EF]/50 md:flex-row md:items-center md:justify-between">
            <p>
              © 2026 University of California, San Diego x Collegiate Racing
              Series. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-6">
              <Link
                href="/terms/"
                className="transition-colors duration-200 hover:text-[#F2F0EF]"
              >
                Terms and Conditions
              </Link>
              <Link
                href="/privacy/"
                className="transition-colors duration-200 hover:text-[#F2F0EF]"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
