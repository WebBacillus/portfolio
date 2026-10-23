"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import AnimatedTitle from "@/components/animated-title"
import AnimatedSection from "@/components/animated-section"
import { Mail, Phone, MapPin, Send, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import gsap from "gsap"
import { addHoverAnimation } from "@/lib/gsap-utils"
import { sendContactEmail } from "@/app/actions/contact"
import type { ContactFormResponse } from "@/app/actions/contact"

export default function ContactPage() {
  const formRef = useRef<HTMLFormElement>(null)
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formResponse, setFormResponse] = useState<ContactFormResponse | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const form = formRef.current
    if (!form) return
    const cleanupFunctions: (() => void)[] = []

    // Add focus and blur animations to form inputs
    const inputs = Array.from(form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea"))

    inputs.forEach((input) => {
      // Focus animation
      const handleFocus = () => {
        gsap.to(input, {
          borderColor: "rgba(107, 70, 193, 0.8)",
          boxShadow: "0 0 0 2px rgba(107, 70, 193, 0.2)",
          duration: 0.3,
        })
      }

      // Blur animation
      const handleBlur = () => {
        gsap.to(input, {
          borderColor: "rgba(107, 70, 193, 0.2)",
          boxShadow: "none",
          duration: 0.3,
        })
      }

      input.addEventListener("focus", handleFocus)
      input.addEventListener("blur", handleBlur)
      cleanupFunctions.push(() => {
        input.removeEventListener("focus", handleFocus)
        input.removeEventListener("blur", handleBlur)
      })
    })

    // Button hover animation
    const button = form.querySelector("button")
    if (button) {
      const cleanup = addHoverAnimation(button as HTMLElement, { scale: 1.05 }, { scale: 1 })
      if (cleanup) cleanupFunctions.push(cleanup)
    }

    return () => {
      // Clean up all animations
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current)
      inputs.forEach((input) => gsap.killTweensOf(input))
      gsap.killTweensOf(form.querySelector(".success-message"))
      cleanupFunctions.forEach((cleanup) => cleanup())
    }
  }, [])

  // Basic client-side validation
  const validateForm = () => {
    const errors: Record<string, string> = {}
    const form = formRef.current
    const name = (form?.elements.namedItem("name") as HTMLInputElement | null)?.value
    const email = (form?.elements.namedItem("email") as HTMLInputElement | null)?.value
    const message = (form?.elements.namedItem("message") as HTMLTextAreaElement | null)?.value

    if (!name || name.length < 2) {
      errors.name = "Name must be at least 2 characters"
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = "Please enter a valid email address"
    }

    if (!message || message.length < 10) {
      errors.message = "Message must be at least 10 characters"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setFormResponse(null)

    try {
      // Get form data
      const formData = new FormData(formRef.current!)

      // Send email using server action
      const response = await sendContactEmail(formData)

      // Update state with response
      setFormResponse(response)

      // Reset form if successful
      if (response.success && formRef.current) {
        formRef.current.reset()
      }

      // Show success message with animation
      if (response.success) {
        const successMessage = document.querySelector(".success-message")
        if (successMessage) {
          gsap.fromTo(successMessage, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 })

          // Hide success message after 5 seconds
          successTimeoutRef.current = setTimeout(() => {
            gsap.to(successMessage, {
              opacity: 0,
              y: -20,
              duration: 0.5,
              onComplete: () => setFormResponse(null),
            })
          }, 5000)
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setFormResponse({
        success: false,
        message: "An unexpected error occurred. Please try again later.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 pt-16 pb-20">
        <AnimatedTitle className="text-purple text-center leading-none tracking-normal mb-8">
          CONTACT
        </AnimatedTitle>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Form */}
          <AnimatedSection
            animation="slideInLeft"
            delay={1.75}
            className="bg-white/80 p-6 md:p-8 rounded-lg shadow-sm backdrop-blur-sm"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Get in Touch</h2>

            {formResponse && (
              <div
                className={`success-message ${formResponse.success ? "bg-green-100 border-green-300 text-green-800" : "bg-red-100 border-red-300 text-red-800"} px-4 py-3 rounded mb-6 flex items-start`}
              >
                {formResponse.success ? (
                  <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <p className="font-medium">
                    {formResponse.success ? "Message sent successfully!" : "Error sending message"}
                  </p>
                  <p className="text-sm">{formResponse.message}</p>
                </div>
              </div>
            )}

            <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-black mb-2 font-medium">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className={`w-full p-3 border ${formErrors.name ? "border-red-500" : "border-purple/20"} bg-white rounded-md transition-all duration-300`}
                  />
                  {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-black mb-2 font-medium">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className={`w-full p-3 border ${formErrors.email ? "border-red-500" : "border-purple/20"} bg-white rounded-md transition-all duration-300`}
                  />
                  {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-black mb-2 font-medium">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="w-full p-3 border border-purple/20 bg-white rounded-md transition-all duration-300"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-black mb-2 font-medium">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  className={`w-full p-3 border ${formErrors.message ? "border-red-500" : "border-purple/20"} bg-white rounded-md transition-all duration-300`}
                ></textarea>
                {formErrors.message && <p className="text-red-500 text-sm mt-1">{formErrors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center w-full md:w-auto px-8 py-3 bg-purple text-white rounded-md hover:bg-dark-purple transition-all duration-300 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </AnimatedSection>

          {/* Contact Info & Map */}
          <AnimatedSection animation="slideInRight" delay={1.75} className="space-y-6 md:space-y-8">
            <div className="bg-white/80 p-6 md:p-8 rounded-lg shadow-sm backdrop-blur-sm">
              <h2 className="text-xl md:text-2xl font-bold mb-6">Contact Information</h2>

              <div className="space-y-4">
                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-purple mr-3 mt-1" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a href="mailto:web.pasit.kh@gmail.com" className="text-purple hover:text-dark-purple break-all">
                      web.pasit.kh@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-purple mr-3 mt-1" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <a href="tel:+66918683540" className="text-purple hover:text-dark-purple">
                      091-868-3540
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-purple mr-3 mt-1" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p>Pathum Wan, Bangkok 10330 Thailand</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg md:text-xl font-medium mb-4">Connect with me</h3>
                <div className="flex space-x-4">
                  {[
                    {
                      href: "https://github.com/WebBacillus",
                      icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            fillRule="evenodd"
                            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ),
                    },
                    {
                      href: "https://www.linkedin.com/in/pasit-khumsena-918616352/",
                      icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      ),
                    },
                  ].map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-purple/10 flex items-center justify-center hover:bg-purple hover:text-white transition-colors"
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </main>
  )
}
