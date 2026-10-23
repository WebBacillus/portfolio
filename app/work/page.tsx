"use client"

import { useState, useEffect, useRef } from "react"
import ProjectCard from "@/components/project-card"
import FilterButton from "@/components/filter-button"
import AnimatedTitle from "@/components/animated-title"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { categories, projects } from "@/data/projects"

export default function WorkPage() {
  const [activeFilter, setActiveFilter] = useState("all")
  const [filteredProjects, setFilteredProjects] = useState(projects)
  const projectsContainerRef = useRef<HTMLDivElement>(null)
  const introTextRef = useRef<HTMLParagraphElement>(null)
  const filtersRef = useRef<HTMLDivElement>(null)
  const emptyStateRef = useRef<HTMLDivElement>(null)

  // Register GSAP plugins
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
  }, [])

  // Initial page load animations
  useEffect(() => {
    const timeline = gsap.timeline()
  
    const introText = introTextRef.current
    const filters = filtersRef.current
    const container = projectsContainerRef.current

    if (introText) {
      // Animate intro text
      timeline.fromTo(introText, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 1.5, ease: "power3.out" })
    }

    if (filters) {
      // Animate filter buttons with stagger
      timeline.fromTo(
        filters.children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          delay: 1.5,
          ease: "power2.out",
        },
      )
    }
      if (container) {
        timeline.fromTo(container, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0, ease: "power3.out" })
      }

    return () => {
      // Clean up animations
      timeline.kill()
      if (introText) gsap.killTweensOf(introText)
      if (filters) gsap.killTweensOf(filters.children)
      if (container) gsap.killTweensOf(container.children)
    }
  }, [])

  // Filter projects when activeFilter changes
  useEffect(() => {
    const container = projectsContainerRef.current

    if (container) {
      // First, animate out the current projects
      const timeline = gsap.timeline()
      let entranceAnimation: gsap.core.Tween | undefined

      timeline.to(container.children, {
        opacity: 0,
        y: 20,
        stagger: 0.05,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          // Update filtered projects after fade out
          if (activeFilter === "all") {
            setFilteredProjects(projects)
          } else {
            setFilteredProjects(projects.filter((project) => project.category === activeFilter))
          }
        },
      })

      // Then animate in the new projects after state update
      timeline.add(() => {
        if (container.children.length > 0) {
          entranceAnimation = gsap.fromTo(
            container.children,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              stagger: 0.1,
              duration: 0.5,
              ease: "power2.out",
              clearProps: "all", // Clear properties after animation to prevent conflicts
            },
          )
        }
      })

      return () => {
        timeline.kill()
        entranceAnimation?.kill()
        gsap.killTweensOf(container.children)
      }
    }

    return
  }, [activeFilter])

  // Handle empty state animation
  useEffect(() => {
    const emptyState = emptyStateRef.current

    if (emptyState) {
      if (filteredProjects.length === 0) {
        gsap.fromTo(emptyState, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" })
      } else {
        gsap.to(emptyState, { opacity: 0, duration: 0.3, ease: "power2.out" })
      }
    }

    return () => {
      if (emptyState) gsap.killTweensOf(emptyState)
    }
  }, [filteredProjects.length])

  // Handle filter change
  const handleFilterChange = (categoryId: string) => {
    if (categoryId !== activeFilter) {
      // Animate the filter button click
      const buttons = filtersRef.current?.querySelectorAll("button")
      if (buttons) {
        buttons.forEach((button) => {
          if (button.textContent === categories.find((c) => c.id === categoryId)?.label) {
            gsap.fromTo(button, { scale: 0.9 }, { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.5)" })
          }
        })
      }

      setActiveFilter(categoryId)
    }
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 pt-16">
        <AnimatedTitle className="text-purple text-center leading-none tracking-normal mb-8">
          WORK
        </AnimatedTitle>


        {/* Filter buttons */}
        <div className="mb-12 overflow-x-auto pb-2">
          <div ref={filtersRef} className="flex flex-nowrap md:flex-wrap gap-3 min-w-max md:min-w-0">
            {categories.map((category) => (
              <FilterButton
                key={category.id}
                label={category.label}
                active={activeFilter === category.id}
                onClick={() => handleFilterChange(category.id)}
              />
            ))}
          </div>
        </div>

        {/* Projects grid */}
        <div ref={projectsContainerRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {filteredProjects.map((project) => (
            <div key={project.id} className={`${project.featured ? "md:col-span-2" : ""}`}>
              <ProjectCard
                title={project.title}
                description={project.description}
                image={project.image}
                tags={project.tags}
                liveUrl={project.liveUrl}
                repoUrl={project.repoUrl}
                featured={project.featured}
              />
            </div>
          ))}
        </div>

        {/* Empty state */}
        <div
          ref={emptyStateRef}
          className={`flex flex-col items-center justify-center py-16 ${filteredProjects.length > 0 ? "hidden" : ""}`}
        >
          <p className="text-xl text-black/70 mb-4">No projects found in this category.</p>
          <button
            onClick={() => handleFilterChange("all")}
            className="px-6 py-2 bg-purple text-white rounded-full hover:bg-dark-purple transition-colors"
          >
            View All Projects
          </button>
        </div>
      </div>
    </main>
  )
}
