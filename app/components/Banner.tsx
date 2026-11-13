export function Banner({ tone, title, items }: { tone: "error" | "warning"; title: string; items?: string[] }) {
  const toneClass = tone === "error" ? "border-reject bg-[rgba(184,86,75,.16)]" : "border-[#8a7a45] bg-[rgba(254,188,46,.08)]";
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-2xl border px-4 py-3 text-sm ${toneClass}`}>
      <p className="m-0 font-semibold">{title}</p>
      {items && items.length > 0 && (
        <ul className="m-0 mt-2 list-disc space-y-1 pl-5 font-mono text-[12.5px] text-dim">
          {items.map((it) => <li key={it} className="break-words">{it}</li>)}
        </ul>
      )}
    </div>
  );
}
