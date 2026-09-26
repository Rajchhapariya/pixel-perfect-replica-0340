export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -right-40 -top-40 h-[700px] w-[700px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(6,182,212,0.08), transparent 70%)" }}
      />
      <div
        className="absolute -bottom-52 -left-40 h-[700px] w-[700px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.07), transparent 70%)" }}
      />
    </div>
  );
}
