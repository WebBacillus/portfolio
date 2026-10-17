interface TagListProps {
  tags: string[]
}

export default function TagList({ tags }: TagListProps) {
  return (
    <div className="flex space-x-4">
      {tags.map((tag, index) => (
        <span key={index} className="text-purple/80 text-sm">
          {tag}
        </span>
      ))}
    </div>
  )
}
