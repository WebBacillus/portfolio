"use client"

import Image from "next/image"
import { FileText } from "lucide-react"
import type { CompanyLogo } from "@/data/company-logos"
import MagneticLink from "@/components/magnetic-link"

export interface TimelineRole {
  year: string
  title: string
  description: string
}

export interface TimelineEvidence {
  href: string
  label: string
}

interface TimelineItemProps {
  year: string
  title: string
  description?: string
  index: number
  organization?: string
  roles?: TimelineRole[]
  logo?: CompanyLogo
  evidence?: TimelineEvidence
}

export default function TimelineItem({ year, title, description, index, organization, roles, logo, evidence }: TimelineItemProps) {
  return (
    <div className={`flex ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} flex-col mb-12 relative`}>
      <div className="md:w-1/2 flex justify-center items-center">
        <article data-cursor-target className="bg-purple/10 p-4 rounded-lg w-full md:max-w-md">
          <header className="mb-4 flex flex-col items-start gap-3 md:flex-row md:justify-between">
            <div className="min-w-0">
              <p className="mb-1 text-sm font-semibold text-purple md:text-base">{year}</p>
              <h3 className="text-xl font-bold md:text-2xl">{title}</h3>
            </div>
            {logo && (
              <div className={`timeline-logo flex h-10 w-28 shrink-0 items-center justify-center self-start rounded-md px-2 md:self-auto ${logo.background === "dark" ? "bg-[#000000]" : "bg-white"}`}>
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.width}
                  height={logo.height}
                  style={{ height: logo.displayHeight, width: "auto", maxWidth: "100%" }}
                  className="object-contain"
                />
              </div>
            )}
          </header>

          {organization && <p className="-mt-2 mb-3 text-sm font-medium text-black/70">{organization}</p>}

          {description && <p className="mb-3 text-sm text-black/70 md:text-base">{description}</p>}

          {roles && roles.length > 0 && (
            <div className="mb-3 space-y-3 border-t border-purple/15 pt-3">
              {roles.map((role) => (
                <section key={`${role.year}-${role.title}`}>
                  <p className="mb-1 text-xs font-semibold text-purple">{role.year}</p>
                  <h4 className="mb-1 text-base font-semibold">{role.title}</h4>
                  <p className="text-sm text-black/70">{role.description}</p>
                </section>
              ))}
            </div>
          )}

          {evidence && (
            <MagneticLink
              href={evidence.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-purple/20 bg-white px-3 py-2 text-sm font-medium text-purple transition-colors duration-300 hover:bg-purple/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple"
            >
                <FileText aria-hidden="true" />
                {evidence.label}
            </MagneticLink>
          )}

        </article>
      </div>

      <div className="md:w-1/2 relative flex justify-center">
        {/* For mobile, show a horizontal line */}
        <div className="md:hidden absolute w-px h-full bg-purple/30 left-4 top-0"></div>
        <div className="md:hidden timeline-dot absolute left-4 top-0 w-4 h-4 rounded-full bg-purple -translate-x-1/2"></div>

        {/* For desktop, show a vertical line */}
        <div className="hidden md:block absolute h-full w-px bg-purple/30 top-0"></div>
        <div className="hidden md:block timeline-dot absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-purple"></div>
      </div>
    </div>
  )
}
