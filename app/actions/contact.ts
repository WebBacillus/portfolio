"use server"

import { z } from "zod"
import { Resend } from "resend"
import { render } from "@react-email/render"
import * as React from "react"

// Bounds for incoming values. The schema enforces both sides so user-controlled
// data cannot grow unbounded and cannot include whitespace-only payloads.
const NAME_MAX = 120
const EMAIL_MAX = 254
const SUBJECT_MAX = 150
const MESSAGE_MIN = 10
const MESSAGE_MAX = 5000

const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(NAME_MAX, { message: `Name must be at most ${NAME_MAX} characters` }),
  email: z
    .string()
    .trim()
    .max(EMAIL_MAX, { message: "Please enter a valid email address" })
    .email({ message: "Please enter a valid email address" }),
  subject: z
    .string()
    .trim()
    .max(SUBJECT_MAX, { message: `Subject must be at most ${SUBJECT_MAX} characters` })
    .optional(),
  message: z
    .string()
    .trim()
    .min(MESSAGE_MIN, { message: `Message must be at least ${MESSAGE_MIN} characters` })
    .max(MESSAGE_MAX, { message: `Message must be at most ${MESSAGE_MAX} characters` }),
})

export type ContactFormData = z.infer<typeof contactFormSchema>

export type ContactFormResponse = {
  success: boolean
  message: string
}

const CONTACT_TO_EMAIL = "web.pasit.kh@gmail.com"
const CONTACT_FROM_EMAIL = "onboarding@resend.dev"
const GENERIC_DELIVERY_ERROR =
  "We couldn't deliver your message right now. Please try again later."

// RFC 5322 header folding is unsafe in many mail clients; collapse any control
// characters and embedded newlines so a crafted subject cannot break headers.
function sanitizeSubjectLine(value: string): string {
  return value
    .replace(/[\r\n\t]+/g, " ")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
}

export async function sendContactEmail(formData: FormData): Promise<ContactFormResponse> {
  try {
    const raw = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    }

    const result = contactFormSchema.safeParse(raw)
    if (!result.success) {
      const errorMessage = result.error.errors.map((err) => err.message).join(", ")
      return {
        success: false,
        message: errorMessage,
      }
    }

    const { name, email, subject, message } = result.data
    const safeSubject = subject && subject.length > 0
      ? sanitizeSubjectLine(subject)
      : "New contact form submission"
    const emailSubject = `Contact Form: ${safeSubject}`

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey || apiKey.trim() === "") {
      console.error("Contact form: RESEND_API_KEY is not configured")
      return { success: false, message: GENERIC_DELIVERY_ERROR }
    }

    // @react-email/render escapes every interpolated string before serialising
    // to HTML, so user-controlled fields are safe by construction.
    const html = await render(
      React.createElement(
        React.Fragment,
        null,
        React.createElement("p", null, `From: ${name} (${email})`),
        React.createElement("p", null, "Message:"),
        React.createElement("p", null, message),
      ),
    )
    const text = `From: ${name} (${email})\n\nMessage:\n${message}`

    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: CONTACT_FROM_EMAIL,
      to: CONTACT_TO_EMAIL,
      subject: emailSubject,
      html,
      text,
    })

    if (error) {
      console.error("Contact form: Resend delivery failed:", error)
      return { success: false, message: GENERIC_DELIVERY_ERROR }
    }

    return {
      success: true,
      message: "Your message has been received",
    }
  } catch (error) {
    console.error("Contact form: unexpected error:", error)
    return { success: false, message: GENERIC_DELIVERY_ERROR }
  }
}
