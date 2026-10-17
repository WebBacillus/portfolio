"use client"

import { useRef } from "react"
import SkillTag from "./skill-tag"

interface Skill {
  name: string
  level?: "beginner" | "intermediate" | "advanced" | "expert"
}

interface SkillTagCloudProps {
  skills: Skill[]
  className?: string
}

export default function SkillTagCloud({ skills, className = "" }: SkillTagCloudProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef} className={`flex flex-wrap justify-center gap-2 md:gap-3 ${className}`}>
      {skills.map((skill, index) => (
        <SkillTag key={index} skill={skill.name} level={skill.level} delay={index * 0.05} />
      ))}
    </div>
  )
}
