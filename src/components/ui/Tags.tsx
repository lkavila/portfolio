export function Tags({ items }: { items: string[] }) {
  if (items.length === 0) return null
  return (
    <ul className="mt-3 flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li key={item} className="rounded-md bg-chip px-2 py-1 text-xs text-strong">
          {item}
        </li>
      ))}
    </ul>
  )
}

export function Lesson({ label, text }: { label: string; text?: string }) {
  if (!text) return null
  return (
    <p className="mt-3 border-l-2 border-accent-2 bg-card px-3.5 py-3 text-[15px] text-strong">
      <span className="sr-only">{label}: </span>
      {text}
    </p>
  )
}
