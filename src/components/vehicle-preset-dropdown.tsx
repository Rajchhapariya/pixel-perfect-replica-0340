import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Car, Truck, Sparkles } from "lucide-react";
import type { VehicleClass } from "@/lib/booking";

interface VehiclePreset {
  name: string;
  classId: VehicleClass;
  tag: string;
}

const AUSTIN_VEHICLE_PRESETS: VehiclePreset[] = [
  { name: "2024 Porsche 911 GT3 / Turbo", classId: "sedan", tag: "Coupe · Base Scale" },
  { name: "2024 Porsche Taycan 4S / Turbo", classId: "sedan", tag: "Sedan · Base Scale" },
  { name: "2024 Tesla Model Y Long Range", classId: "suv_mid", tag: "Crossover · 1.25x Scale" },
  { name: "2024 BMW X5 M / Competition", classId: "suv_mid", tag: "Mid-SUV · 1.25x Scale" },
  { name: "2024 Ford F-150 Raptor / Lightning", classId: "suv_full", tag: "Truck · 1.55x Scale" },
  { name: "2024 Rivian R1T / R1S Quad-Motor", classId: "suv_full", tag: "Truck · 1.55x Scale" },
  { name: "2024 Tesla Cybertruck Foundation", classId: "suv_full", tag: "Truck · 1.55x Scale" },
  { name: "2024 Mercedes-AMG G 63", classId: "suv_full", tag: "Full-SUV · 1.55x Scale" },
];

interface VehiclePresetDropdownProps {
  vehicleModel: string;
  onChangeModel: (model: string) => void;
  onSelectClass: (classId: VehicleClass) => void;
}

export function VehiclePresetDropdown({
  vehicleModel,
  onChangeModel,
  onSelectClass,
}: VehiclePresetDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function handleSelectPreset(preset: VehiclePreset) {
    onChangeModel(preset.name);
    onSelectClass(preset.classId);
    setIsOpen(false);
  }

  return (
    <div
      ref={containerRef}
      className="mt-8 rounded-xl border border-border bg-card/60 p-5 backdrop-blur-sm relative"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="block text-sm font-semibold text-foreground">
            Vehicle Year, Make &amp; Model
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            Quickly select an Austin specimen preset or type custom specifications.
          </span>
        </div>

        {/* Polished Obsidian Dropdown Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex items-center justify-between gap-2.5 rounded-lg border border-border-strong bg-secondary/80 px-3.5 py-2 font-mono text-xs text-foreground transition-all hover:border-cyan hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-cyan"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className="flex items-center gap-1.5 text-cyan">
            <Sparkles className="h-3.5 w-3.5 text-cyan" />
            <span>Preset Garage Menu</span>
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${
              isOpen ? "rotate-180 text-cyan" : ""
            }`}
          />
        </button>
      </div>

      {/* Dropdown Menu Modal */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute left-5 right-5 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-xl border border-border-strong bg-[#0c121e]/98 p-1.5 shadow-[0_20px_40px_rgba(0,0,0,0.85)] backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-150"
        >
          <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-dim border-b border-border/60">
            Austin Specimen Presets · Auto-Sets Vehicle Scale
          </div>
          <div className="py-1">
            {AUSTIN_VEHICLE_PRESETS.map((preset) => {
              const isSelected = vehicleModel === preset.name;
              return (
                <button
                  key={preset.name}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectPreset(preset)}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-xs transition-colors ${
                    isSelected
                      ? "bg-cyan-soft text-cyan font-semibold"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {preset.classId === "suv_full" ? (
                      <Truck className="h-4 w-4 shrink-0 text-dim" />
                    ) : (
                      <Car className="h-4 w-4 shrink-0 text-dim" />
                    )}
                    <span className="font-mono text-xs">{preset.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase text-dim">{preset.tag}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-cyan shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Direct Input */}
      <input
        value={vehicleModel}
        onChange={(e) => onChangeModel(e.target.value)}
        placeholder="e.g. 2024 Porsche 911 GT3 RS or 2024 Ford F-150 Raptor"
        className="mt-3 w-full rounded-lg border border-border bg-input px-4 py-3 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-dim focus:border-cyan"
      />
    </div>
  );
}
