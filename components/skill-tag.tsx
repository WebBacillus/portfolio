"use client"

interface SkillTagProps {
  skill: string
  level?: "beginner" | "intermediate" | "advanced" | "expert"
  delay?: number
}

export default function SkillTag({ skill, level = "advanced" }: SkillTagProps) {
  // Determine background color based on level
  const getBgColor = () => {
    switch (level) {
      case "beginner":
        return "bg-purple/10"
      case "intermediate":
        return "bg-purple/20"
      case "advanced":
        return "bg-purple/30"
      case "expert":
        return "bg-purple/40"
      default:
        return "bg-purple/30"
    }
  }

  return (
    <div
      className={`inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-full ${getBgColor()} text-purple font-medium text-xs md:text-sm transition-all duration-300 cursor-pointer`}
      style={{ boxShadow: "0 2px 6px rgba(107, 70, 193, 0.1)" }}
    >
      {skill}
    </div>
  )
}
