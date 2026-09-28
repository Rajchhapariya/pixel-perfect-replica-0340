export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#07090e]">
      <div
        className="absolute -top-10 inset-x-0 h-96 opacity-20 origin-top pointer-events-none"
        style={{
          perspective: "1000px",
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 85%)",
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 85%)",
        }}
      >
        <div
          className="w-full h-full"
          style={{
            transform: "rotateX(-55deg)",
            backgroundImage: `radial-gradient(circle at center, rgba(239,68,68,0.10) 0%, transparent 70%),
              linear-gradient(30deg, rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(150deg, rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: "80px 80px, 60px 104px, 60px 104px, 60px 104px",
          }}
        />
      </div>

      <div className="absolute top-0 inset-x-0 h-40 flex justify-center opacity-40">
        <div className="w-4/5 max-w-6xl h-px bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_50px_rgba(239,68,68,0.7),0_0_100px_rgba(239,68,68,0.3)]" />
        <div className="absolute top-1 w-2/3 max-w-4xl h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-60 shadow-[0_0_20px_#fff]" />
      </div>

      <div
        className="absolute -top-32 right-1/4 h-[650px] w-[650px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(239,68,68,0.22) 0%, rgba(180,30,30,0.08) 50%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/3 -left-36 h-[750px] w-[750px] rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(80,10,10,0.30) 0%, rgba(239,68,68,0.06) 50%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-1/4 right-10 h-[550px] w-[550px] rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)",
        }}
      />

      <div
        className="absolute -bottom-24 inset-x-0 h-[600px] opacity-25 origin-bottom pointer-events-none"
        style={{
          perspective: "900px",
          maskImage: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)",
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)",
        }}
      >
        <div
          className="w-full h-full"
          style={{
            transform: "rotateX(62deg)",
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-[#07090e]/70 pointer-events-none" />
    </div>
  );
}
