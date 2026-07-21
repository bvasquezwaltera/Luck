const AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-700",
  "bg-rose-100 text-rose-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-sky-100 text-sky-700",
];

const SIZE_CLASSES = {
  md: "h-14 w-14 text-lg",
  lg: "h-20 w-20 text-2xl",
};

function colorFor(seed: string): string {
  const index = seed.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function Avatar({
  initials,
  name,
  size = "md",
  online,
}: {
  initials: string;
  name: string;
  size?: keyof typeof SIZE_CLASSES;
  online?: boolean;
}) {
  return (
    <div className="relative inline-flex">
      <div
        className={`flex items-center justify-center rounded-full font-semibold ${SIZE_CLASSES[size]} ${colorFor(name)}`}
      >
        {initials}
      </div>
      {online && (
        <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
      )}
    </div>
  );
}
