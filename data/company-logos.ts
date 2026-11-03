export type CompanyLogo = {
  src: string
  alt: string
  width: number
  height: number
  /** Optical height used in the compact timeline logo plate. */
  displayHeight: number
}

/**
 * Logos used across the timeline and home page.
 * Every file is transparent PNG, trimmed to its visible bounds so the same
 * intrinsic dimensions prevent layout shift; displayHeight optically balances timeline marks.
 */
export const companyLogos = {
  true: {
    src: "/images/companies/true-corporation.png",
    alt: "True Corporation logo",
    width: 597,
    height: 217,
    displayHeight: 26,
  },
  nitmx: {
    src: "/images/companies/nitmx.png",
    alt: "National ITMX logo",
    width: 2642,
    height: 929,
    displayHeight: 26,
  },
  chulalongkorn: {
    src: "/images/companies/chulalongkorn.png",
    alt: "Chulalongkorn University logo",
    width: 960,
    height: 481,
    displayHeight: 28,
  },
  aiBuilders: {
    src: "/images/companies/ai-builders.png",
    alt: "AI Builders logo",
    width: 167,
    height: 179,
    displayHeight: 36,
  },
  cedtInnovationSummit: {
    src: "/images/companies/cedt-innovation-summit.png",
    alt: "CEDT Innovation Summit logo",
    width: 1437,
    height: 359,
    displayHeight: 24,
  },
} satisfies Record<string, CompanyLogo>

export type CompanyLogoKey = keyof typeof companyLogos
