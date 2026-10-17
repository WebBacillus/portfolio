"use server"

import { z } from "zod"
import { Resend } from 'resend';

// Define validation schema
const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  subject: z.string().optional(),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
})

// Type for form data
export type ContactFormData = z.infer<typeof contactFormSchema>

// Type for form response
export type ContactFormResponse = {
  success: boolean
  message: string
}

export async function sendContactEmail(formData: FormData): Promise<ContactFormResponse> {
  try {
    // Extract form data
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const subject = (formData.get("subject") as string) || "New contact form submission"
    const message = formData.get("message") as string

    // Validate form data
    const result = contactFormSchema.safeParse({
      name,
      email,
      subject,
      message,
    })

    if (!result.success) {
      // Return validation errors
      const errorMessage = result.error.errors.map((err) => err.message).join(", ")
      return {
        success: false,
        message: errorMessage,
      }
    }

    // In a real production environment, you would use a service like SendGrid, Mailgun, or Resend
    // For the preview environment, we'll simulate sending an email

    // Log the email data (for demonstration purposes)
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: 'webbalaka@gmail.com',
      subject: `Contact Form: ${subject}`,
      html: `<p>From: ${name} (${email})</p><p>Message: ${message}</p>`,
    });

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Return success response
    return {
      success: true,
      message: "Your message has been received",
    }
  } catch (error) {
    console.error("Error processing form:", error)
    return {
      success: false,
      message: "Failed to process your message. Please try again later.",
    }
  }
}
