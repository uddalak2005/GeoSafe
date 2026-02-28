import { Radio, Zap } from "lucide-react";
import lora from "@/assets/lora.png";
const LoraGPS = () => {
  return (
    <section className="py-16 bg-gradient-depth geological-layer relative overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-pattern-rock opacity-20" />

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mining-panel depth-layer-1 rounded-xl border-l-4 border-primary shadow-excavation overflow-hidden">
          <div className="flex flex-col md:flex-row items-stretch">
            {/* ── Left: Image placeholder ── */}
            <div
              className="md:w-2/5 flex-shrink-0 
            bg-gradient-to-br from-primary/10 to-accent/10 
            border-b md:border-b-0 md:border-r border-border 
            flex items-center justify-center min-h-64 
            md:min-h-80 relative overflow-hidden"
            >
              <img src={lora} alt="" className="object-cover" />
              {/* <div className="flex flex-col items-center gap-3 text-muted-foreground select-none pointer-events-none">
                <Radio className="w-12 h-12 text-primary/30" />
                <span className="text-xs font-semibold uppercase tracking-widest text-primary/30">
                  Image
                </span>
              </div> */}
            </div>

            {/* ── Right: Writeup ── */}
            <div className="md:w-3/5 p-8 sm:p-10 flex flex-col justify-center gap-5">
              {/* Tag */}
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-secondary">
                <Zap className="w-3.5 h-3.5" />
                <span>LoRa GPS Technology</span>
              </div>

              {/* Heading */}
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-snug">
                Long-Range GPS Tracking{" "}
                <span className="text-primary">for Underground Mines</span>
              </h2>

              {/* Body */}
              <p className="text-base text-muted-foreground leading-relaxed">
                Every miner's helmet is embedded with an RFID-enabled LoRa GPS
                module carrying a unique worker ID. Operating on low-power,
                long-range LoRa radio frequencies, the module transmits precise
                positional data even from the deepest excavation shafts — where
                conventional wireless signals fail.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                The data feeds directly into the{" "}
                <span className="text-foreground font-semibold">
                  GeoGuardian geo-fencing engine
                </span>
                , triggering automated SMS and in-app alerts the moment a miner
                crosses into a displacement-flagged hazard zone, ensuring
                zero-latency emergency response at the surface control room.
              </p>

              {/* Divider */}
              <div className="h-px bg-border" />

              {/* Spec pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  "LoRa 915 MHz",
                  "Sub-km range",
                  "RFID worker ID",
                  "Low power",
                  "Real-time alerts",
                ].map((spec) => (
                  <span
                    key={spec}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoraGPS;
