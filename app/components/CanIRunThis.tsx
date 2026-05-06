"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type Status = "good" | "caution" | "not_recommended";

type TrailDifficulty = "easy" | "moderate" | "difficult" | "advanced";
type RequirementLevel = "not_needed" | "recommended" | "required";
type WaterLevel = "none" | "light" | "moderate" | "deep";
type RiskLevel = "low" | "medium" | "high";
type TractionRequirement =
  | "not_needed"
  | "factory_ok"
  | "locker_recommended"
  | "locker_required";

type TractionAid =
  | "none"
  | "factory"
  | "rear_locker"
  | "front_locker"
  | "front_rear_lockers";

type Experience = "beginner" | "intermediate" | "advanced";

type TrailRequirements = {
  difficulty: TrailDifficulty;
  minTireDiameter: number;
  recommendedLiftLevel: number;
  stockFriendly: boolean;
  skidPlates: RequirementLevel;
  rockSliders: RequirementLevel;
  recoveryPointsRequired: boolean;
  recoveryGearRequired: boolean;
  winch: RequirementLevel;
  traction: TractionRequirement;
  waterCrossings: WaterLevel;
  pinstripingRisk: RiskLevel;
  terrain: string[];
};

type Props = {
  eventTitle: string;
  requirements?: TrailRequirements;
};

const defaultRequirements: TrailRequirements = {
  difficulty: "moderate",
  minTireDiameter: 31,
  recommendedLiftLevel: 1,
  stockFriendly: false,
  skidPlates: "recommended",
  rockSliders: "not_needed",
  recoveryPointsRequired: true,
  recoveryGearRequired: true,
  winch: "recommended",
  traction: "factory_ok",
  waterCrossings: "moderate",
  pinstripingRisk: "medium",
  terrain: ["Ruts", "Mud / Clay", "Water Crossings"],
};

const tireOptions = [29, 30, 31, 32, 33, 34, 35, 36, 37];

const liftOptions = [
  { label: "Stock", value: 0 },
  { label: "1-2 in", value: 1 },
  { label: "2-3 in", value: 2 },
  { label: "3 in+", value: 3 },
];

const experienceOptions: { label: string; value: Experience }[] = [
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
];

const tractionOptions: {
  label: string;
  value: TractionAid;
  description: string;
}[] = [
  {
    label: "None",
    value: "none",
    description: "Open differentials with no traction upgrade.",
  },
  {
    label: "Factory Traction System",
    value: "factory",
    description: "Electronic traction control, X-Mode, A-TRAC, etc.",
  },
  {
    label: "Rear Locker",
    value: "rear_locker",
    description: "Mechanical or electronic rear locker.",
  },
  {
    label: "Front Locker",
    value: "front_locker",
    description: "Mechanical or electronic front locker.",
  },
  {
    label: "Front + Rear Lockers",
    value: "front_rear_lockers",
    description: "Full locking capability.",
  },
];

function tractionLevel(value: TractionAid) {
  if (value === "none") return 0;
  if (value === "factory") return 1;
  if (value === "rear_locker" || value === "front_locker") return 2;
  return 3;
}

function requiredTractionLevel(value: TractionRequirement) {
  if (value === "not_needed") return 0;
  if (value === "factory_ok") return 1;
  if (value === "locker_recommended") return 2;
  return 3;
}

function experienceLevel(value: Experience) {
  if (value === "beginner") return 0;
  if (value === "intermediate") return 1;
  return 2;
}

function difficultyLevel(value: TrailDifficulty) {
  if (value === "easy") return 0;
  if (value === "moderate") return 1;
  if (value === "difficult") return 2;
  return 3;
}

function penaltyForRequirement(
  requirement: RequirementLevel,
  hasItem: boolean,
  recommendedPenalty: number,
  requiredPenalty: number
) {
  if (requirement === "not_needed") return 0;
  if (requirement === "recommended" && !hasItem) return recommendedPenalty;
  if (requirement === "required" && !hasItem) return requiredPenalty;
  return 0;
}

export default function CanIRunThis({
  eventTitle,
  requirements = defaultRequirements,
}: Props) {
  const [open, setOpen] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [setupLoaded, setSetupLoaded] = useState(false);
  const [savingSetup, setSavingSetup] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [tireDiameter, setTireDiameter] = useState<number | null>(null);
  const [liftLevel, setLiftLevel] = useState<number | null>(null);
  const [hasSkidPlates, setHasSkidPlates] = useState<boolean | null>(null);
  const [hasRockSliders, setHasRockSliders] = useState<boolean | null>(null);
  const [frontRecovery, setFrontRecovery] = useState<boolean | null>(null);
  const [rearRecovery, setRearRecovery] = useState<boolean | null>(null);
  const [hasRecoveryGear, setHasRecoveryGear] = useState<boolean | null>(null);
  const [hasWinch, setHasWinch] = useState<boolean | null>(null);
  const [tractionAid, setTractionAid] = useState<TractionAid | null>(null);
  const [waterComfort, setWaterComfort] = useState<boolean | null>(null);
  const [pinstripingOk, setPinstripingOk] = useState<boolean | null>(null);
  const [experience, setExperience] = useState<Experience | null>(null);

  useEffect(() => {
    async function loadSavedSetup() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSetupLoaded(true);
        return;
      }

      setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "tire_size,lift_height,has_skids,has_rock_sliders,front_recovery,rear_recovery,has_recovery,has_winch,traction_aid,water_comfort,pinstriping_ok,offroad_experience"
        )
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        if (data.tire_size) {
          const parsedTire = parseInt(String(data.tire_size), 10);
          if (!Number.isNaN(parsedTire)) setTireDiameter(parsedTire);
        }

        if (data.lift_height !== null && data.lift_height !== undefined) {
          const parsedLift = parseInt(String(data.lift_height), 10);
          if (!Number.isNaN(parsedLift)) setLiftLevel(parsedLift);
        }

        if (typeof data.has_skids === "boolean") {
          setHasSkidPlates(data.has_skids);
        }

        if (typeof data.has_rock_sliders === "boolean") {
          setHasRockSliders(data.has_rock_sliders);
        }

        if (typeof data.front_recovery === "boolean") {
          setFrontRecovery(data.front_recovery);
        }

        if (typeof data.rear_recovery === "boolean") {
          setRearRecovery(data.rear_recovery);
        }

        if (typeof data.has_recovery === "boolean") {
          setHasRecoveryGear(data.has_recovery);
        }

        if (typeof data.has_winch === "boolean") {
          setHasWinch(data.has_winch);
        }

        if (
          data.traction_aid === "none" ||
          data.traction_aid === "factory" ||
          data.traction_aid === "rear_locker" ||
          data.traction_aid === "front_locker" ||
          data.traction_aid === "front_rear_lockers"
        ) {
          setTractionAid(data.traction_aid);
        }

        if (typeof data.water_comfort === "boolean") {
          setWaterComfort(data.water_comfort);
        }

        if (typeof data.pinstriping_ok === "boolean") {
          setPinstripingOk(data.pinstriping_ok);
        }

        if (
          data.offroad_experience === "beginner" ||
          data.offroad_experience === "intermediate" ||
          data.offroad_experience === "advanced"
        ) {
          setExperience(data.offroad_experience);
        }
      }

      setSetupLoaded(true);
    }

    loadSavedSetup();
  }, []);

  const isComplete =
    tireDiameter !== null &&
    liftLevel !== null &&
    hasSkidPlates !== null &&
    hasRockSliders !== null &&
    frontRecovery !== null &&
    rearRecovery !== null &&
    hasRecoveryGear !== null &&
    hasWinch !== null &&
    tractionAid !== null &&
    waterComfort !== null &&
    pinstripingOk !== null &&
    experience !== null;

  const result = useMemo(() => {
    let score = 100;

    const strengths: string[] = [];
    const warnings: string[] = [];
    const critical: string[] = [];

    if (
      tireDiameter === null ||
      liftLevel === null ||
      hasSkidPlates === null ||
      hasRockSliders === null ||
      frontRecovery === null ||
      rearRecovery === null ||
      hasRecoveryGear === null ||
      hasWinch === null ||
      tractionAid === null ||
      waterComfort === null ||
      pinstripingOk === null ||
      experience === null
    ) {
      return null;
    }

    const tireDifference = requirements.minTireDiameter - tireDiameter;

    if (tireDifference <= 0) {
      strengths.push("Tire size meets the trail recommendation.");
    } else if (tireDifference === 1) {
      score -= 10;
      warnings.push("Tire size is slightly below the trail recommendation.");
    } else if (tireDifference === 2) {
      score -= 20;
      warnings.push("Tire size is below the trail recommendation.");
    } else {
      score -= 30;
      critical.push("Tire size is significantly below the trail recommendation.");
    }

    if (!requirements.stockFriendly) {
      const liftDifference = requirements.recommendedLiftLevel - liftLevel;

      if (liftDifference <= 0) {
        strengths.push("Lift and clearance are a good match.");
      } else if (liftDifference === 1) {
        score -= 10;
        warnings.push("Additional clearance may be helpful on this trail.");
      } else {
        score -= 20;
        warnings.push("Limited clearance may create issues on this trail.");
      }
    } else {
      strengths.push("This trail is marked stock friendly.");
    }

    const skidPenalty = penaltyForRequirement(
      requirements.skidPlates,
      hasSkidPlates,
      10,
      25
    );

    if (skidPenalty > 0) {
      score -= skidPenalty;
      if (requirements.skidPlates === "required") {
        critical.push("Skid plates are required for this trail.");
      } else {
        warnings.push("Skid plates are recommended for this trail.");
      }
    } else if (hasSkidPlates) {
      strengths.push("Skid plates improve underbody protection.");
    }

    if (
      !hasSkidPlates &&
      (requirements.terrain.includes("Rocks") ||
        requirements.terrain.includes("Technical"))
    ) {
      score -= 5;
      warnings.push("Rocky or technical terrain increases underbody risk.");
    }

    const sliderPenalty = penaltyForRequirement(
      requirements.rockSliders,
      hasRockSliders,
      8,
      20
    );

    if (sliderPenalty > 0) {
      score -= sliderPenalty;
      if (requirements.rockSliders === "required") {
        critical.push("Rock sliders are required for this trail.");
      } else {
        warnings.push("Rock sliders are recommended for this trail.");
      }
    } else if (hasRockSliders) {
      strengths.push("Rock sliders add body protection.");
    }

    if (!hasRockSliders && requirements.pinstripingRisk === "high") {
      score -= 5;
      warnings.push("Body contact or trail rash risk is higher on this route.");
    }

    if (requirements.recoveryPointsRequired) {
      if (frontRecovery && rearRecovery) {
        strengths.push("Front and rear recovery points are ready.");
      } else if (frontRecovery || rearRecovery) {
        score -= 15;
        warnings.push("Only one recovery point is listed.");
      } else {
        score -= 30;
        critical.push("Recovery points are required for this trail.");
      }
    }

    if (requirements.recoveryGearRequired) {
      if (hasRecoveryGear) {
        strengths.push("Recovery gear is ready.");
      } else {
        score -= 20;
        critical.push("Recovery gear is required for this trail.");
      }
    }

    if (
      !hasRecoveryGear &&
      (requirements.terrain.includes("Mud / Clay") ||
        requirements.terrain.includes("Sand"))
    ) {
      score -= 5;
      warnings.push("Mud, clay, or sand can increase recovery risk.");
    }

    const winchPenalty = penaltyForRequirement(
      requirements.winch,
      hasWinch,
      8,
      25
    );

    if (winchPenalty > 0) {
      score -= winchPenalty;
      if (requirements.winch === "required") {
        critical.push("A winch is required for this trail.");
      } else {
        warnings.push("A winch is recommended for this trail.");
      }
    } else if (hasWinch) {
      strengths.push("Winch availability improves recovery options.");
    }

    const userTraction = tractionLevel(tractionAid);
    const requiredTraction = requiredTractionLevel(requirements.traction);
    const tractionDifference = requiredTraction - userTraction;

    if (tractionDifference <= 0) {
      strengths.push("Traction setup is suitable for this trail.");
    } else {
      let tractionPenalty = tractionDifference * 10;

      if (requirements.terrain.includes("Sand")) {
        tractionPenalty = Math.round(tractionPenalty / 2);
      }

      if (
        requirements.terrain.includes("Gravel") &&
        requirements.traction !== "locker_required"
      ) {
        tractionPenalty = 0;
      }

      score -= tractionPenalty;

      if (requirements.traction === "locker_required") {
        critical.push("Lockers are required for this trail.");
      } else {
        warnings.push("More traction capability may be helpful.");
      }
    }

    if (!waterComfort) {
      if (requirements.waterCrossings === "light") {
        score -= 5;
        warnings.push("Light water crossings are expected.");
      }

      if (requirements.waterCrossings === "moderate") {
        score -= 15;
        warnings.push("Moderate water crossings are expected.");
      }

      if (requirements.waterCrossings === "deep") {
        score -= 30;
        critical.push("Deep water crossings are expected.");
      }
    } else if (requirements.waterCrossings !== "none") {
      strengths.push("You indicated you are comfortable with water crossings.");
    }

    if (!pinstripingOk) {
      if (requirements.pinstripingRisk === "medium") {
        score -= 10;
        warnings.push("Pinstriping or trail scratches are possible.");
      }

      if (requirements.pinstripingRisk === "high") {
        score -= 20;
        warnings.push("Pinstriping risk is high on this trail.");
      }
    }

    const expDifference =
      difficultyLevel(requirements.difficulty) - experienceLevel(experience);

    if (expDifference <= 1) {
      strengths.push("Experience level is reasonably matched to the trail.");
    } else if (expDifference === 2) {
      score -= 25;
      warnings.push("This trail may be above your current experience level.");
    } else {
      score -= 40;
      critical.push("This trail is well above your current experience level.");
    }

    let status: Status =
      score >= 80 ? "good" : score >= 55 ? "caution" : "not_recommended";

    if (
      requirements.recoveryPointsRequired &&
      !frontRecovery &&
      !rearRecovery
    ) {
      status = "not_recommended";
    }

    if (requirements.winch === "required" && !hasWinch) {
      status = "not_recommended";
    }

    if (requirements.traction === "locker_required" && tractionAid === "none") {
      status = "not_recommended";
    }

    if (requirements.difficulty === "advanced" && experience === "beginner") {
      status = "not_recommended";
    }

    if (requirements.waterCrossings === "deep" && !waterComfort) {
      status = "not_recommended";
    }

    if (status === "good" && (warnings.length > 0 || critical.length > 0)) {
      status = "caution";
    }

    return {
      status,
      strengths: strengths.slice(0, 4),
      warnings: warnings.slice(0, 4),
      critical: critical.slice(0, 4),
    };
  }, [
    tireDiameter,
    liftLevel,
    hasSkidPlates,
    hasRockSliders,
    frontRecovery,
    rearRecovery,
    hasRecoveryGear,
    hasWinch,
    tractionAid,
    waterComfort,
    pinstripingOk,
    experience,
    requirements,
  ]);

  async function saveSetup() {
    if (!currentUserId) {
      setSaveMessage("Please log in to save your setup.");
      return;
    }

    if (!isComplete) {
      setSaveMessage("Finish the setup form before saving.");
      return;
    }

    setSavingSetup(true);
    setSaveMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({
        tire_size: String(tireDiameter),
        lift_height: String(liftLevel),
        has_skids: hasSkidPlates,
        has_rock_sliders: hasRockSliders,
        front_recovery: frontRecovery,
        rear_recovery: rearRecovery,
        has_recovery: hasRecoveryGear,
        has_winch: hasWinch,
        traction_aid: tractionAid,
        water_comfort: waterComfort,
        pinstriping_ok: pinstripingOk,
        offroad_experience: experience,
      })
      .eq("user_id", currentUserId);

    if (error) {
      setSaveMessage("Setup could not be saved. Check profile table policies.");
    } else {
      setSaveMessage("Setup saved.");
    }

    setSavingSetup(false);
  }

  function resetForm() {
    setShowResult(false);
    setTireDiameter(null);
    setLiftLevel(null);
    setHasSkidPlates(null);
    setHasRockSliders(null);
    setFrontRecovery(null);
    setRearRecovery(null);
    setHasRecoveryGear(null);
    setHasWinch(null);
    setTractionAid(null);
    setWaterComfort(null);
    setPinstripingOk(null);
    setExperience(null);
    setSaveMessage("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl border border-[#F28C52]/50 bg-[#F28C52]/10 px-4 py-2 text-sm font-semibold text-[#F28C52] transition hover:bg-[#F28C52]/20"
      >
        Can I Run This?
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-3 sm:items-center">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl border border-[#F28C52]/30 bg-[#100B08] p-5 shadow-2xl sm:rounded-3xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white">
                  Can I Run This Trail?
                </h2>
                <p className="mt-1 text-sm text-white/70">
                  Quick compatibility check for {eventTitle}
                </p>

                {setupLoaded && (
                  <p className="mt-2 text-xs text-[#F28C52]">
                    Saved setup loaded when available.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-white/20 px-3 py-1 text-sm text-white/70 hover:bg-white/10"
              >
                Close
              </button>
            </div>

            {!showResult && (
              <div className="space-y-6">
                <Section title="Tire Diameter">
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {tireOptions.map((size) => (
                      <ChoiceButton
                        key={size}
                        selected={tireDiameter === size}
                        onClick={() => setTireDiameter(size)}
                      >
                        {size === 37 ? '37"+' : `${size}"`}
                      </ChoiceButton>
                    ))}
                  </div>
                </Section>

                <Section title="Lift / Clearance">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {liftOptions.map((option) => (
                      <ChoiceButton
                        key={option.value}
                        selected={liftLevel === option.value}
                        onClick={() => setLiftLevel(option.value)}
                      >
                        {option.label}
                      </ChoiceButton>
                    ))}
                  </div>
                </Section>

                <Section title="Protection">
                  <YesNoRow
                    label="Skid Plates"
                    value={hasSkidPlates}
                    setValue={setHasSkidPlates}
                  />
                  <YesNoRow
                    label="Rock Sliders"
                    value={hasRockSliders}
                    setValue={setHasRockSliders}
                  />
                </Section>

                <Section title="Recovery Readiness">
                  <YesNoRow
                    label="Front Recovery Point"
                    value={frontRecovery}
                    setValue={setFrontRecovery}
                  />
                  <YesNoRow
                    label="Rear Recovery Point"
                    value={rearRecovery}
                    setValue={setRearRecovery}
                  />
                  <YesNoRow
                    label="Recovery Gear"
                    value={hasRecoveryGear}
                    setValue={setHasRecoveryGear}
                  />
                  <YesNoRow
                    label="Winch"
                    value={hasWinch}
                    setValue={setHasWinch}
                  />
                </Section>

                <Section
                  title="Traction / Lockers"
                  subtitle="Helps judge capability on technical terrain, mud, clay, and uneven obstacles."
                >
                  <div className="grid gap-2">
                    {tractionOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setTractionAid(option.value)}
                        className={`rounded-xl border p-3 text-left transition ${
                          tractionAid === option.value
                            ? "border-[#F28C52] bg-[#F28C52]/15"
                            : "border-white/15 bg-black/20 hover:bg-white/5"
                        }`}
                      >
                        <p className="font-semibold text-white">
                          {option.label}
                        </p>
                        <p className="mt-1 text-xs text-white/60">
                          {option.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </Section>

                <Section title="Trail Risk Comfort">
                  <YesNoRow
                    label="Comfortable with water crossings?"
                    value={waterComfort}
                    setValue={setWaterComfort}
                  />
                  <YesNoRow
                    label="Okay with pinstriping?"
                    value={pinstripingOk}
                    setValue={setPinstripingOk}
                  />
                </Section>

                <Section title="Experience Level">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {experienceOptions.map((option) => (
                      <ChoiceButton
                        key={option.value}
                        selected={experience === option.value}
                        onClick={() => setExperience(option.value)}
                      >
                        {option.label}
                      </ChoiceButton>
                    ))}
                  </div>
                </Section>

                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={!isComplete || savingSetup}
                    onClick={saveSetup}
                    className="rounded-xl border border-[#F28C52]/50 bg-[#F28C52]/10 px-5 py-3 text-sm font-bold text-[#F28C52] transition hover:bg-[#F28C52]/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {savingSetup ? "Saving..." : "Save / Update My Setup"}
                  </button>

                  <button
                    type="button"
                    disabled={!isComplete}
                    onClick={() => setShowResult(true)}
                    className="rounded-xl bg-[#F28C52] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#e57c3f] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Check Trail Compatibility
                  </button>
                </div>

                {saveMessage && (
                  <p className="rounded-xl border border-white/10 bg-black/25 p-3 text-sm text-white/75">
                    {saveMessage}
                  </p>
                )}
              </div>
            )}

            {showResult && result && (
              <div className="space-y-5">
                <ResultHeader status={result.status} />

                <p className="rounded-xl border border-white/10 bg-black/25 p-4 text-sm text-white/80">
                  {result.status === "good" &&
                    "Your setup is a strong match for this trail."}

                  {result.status === "caution" &&
                    "Your setup can likely handle this trail, but there are a few risks to consider."}

                  {result.status === "not_recommended" &&
                    "This trail may not be a good fit for your current setup. Reach out to me before RSVP’ing and we can talk through it."}
                </p>

                {result.status === "not_recommended" && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                    <p className="text-sm font-semibold text-white">
                      Have questions or want a second opinion?
                    </p>
                    <p className="mt-1 text-sm text-white/75">
                      Email:{" "}
                      <span className="text-[#F28C52]">
                        dariussaunders24@gmail.com
                      </span>
                    </p>

                    <a
                      href={`mailto:dariussaunders24@gmail.com?subject=Trail Question - ${encodeURIComponent(
                        eventTitle
                      )}`}
                      className="mt-3 inline-block rounded-lg bg-[#F28C52] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#e57c3f]"
                    >
                      Contact Ride Leader
                    </a>
                  </div>
                )}

                <ResultList title="Strengths" items={result.strengths} />
                <ResultList title="Watch Outs" items={result.warnings} />
                <ResultList title="Missing / Required" items={result.critical} />

                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
                  >
                    Check Another Setup
                  </button>

                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-xl bg-[#F28C52] px-4 py-3 text-sm font-bold text-black hover:bg-[#e57c3f]"
                  >
                    Back to Event
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <h3 className="font-semibold text-white">{title}</h3>
      {subtitle && <p className="mt-1 text-xs text-white/60">{subtitle}</p>}
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

function ChoiceButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
        selected
          ? "border-[#F28C52] bg-[#F28C52]/15 text-[#F28C52]"
          : "border-white/15 bg-black/20 text-white/75 hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );
}

function YesNoRow({
  label,
  value,
  setValue,
}: {
  label: string;
  value: boolean | null;
  setValue: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-sm font-medium text-white/85">{label}</p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setValue(true)}
          className={`rounded-lg px-3 py-1 text-sm font-semibold ${
            value === true
              ? "bg-[#F28C52] text-black"
              : "bg-white/10 text-white/70"
          }`}
        >
          Yes
        </button>

        <button
          type="button"
          onClick={() => setValue(false)}
          className={`rounded-lg px-3 py-1 text-sm font-semibold ${
            value === false
              ? "bg-[#F28C52] text-black"
              : "bg-white/10 text-white/70"
          }`}
        >
          No
        </button>
      </div>
    </div>
  );
}

function ResultHeader({ status }: { status: Status }) {
  const content = {
    good: {
      label: "Good to Go",
      className: "border-green-500/30 bg-green-500/10 text-green-300",
    },
    caution: {
      label: "Go With Caution",
      className: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
    },
    not_recommended: {
      label: "Not Recommended",
      className: "border-red-500/30 bg-red-500/10 text-red-300",
    },
  }[status];

  return (
    <div className={`rounded-2xl border p-5 text-center ${content.className}`}>
      <p className="text-2xl font-bold">{content.label}</p>
    </div>
  );
}

function ResultList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <h3 className="font-semibold text-white">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="text-sm text-white/75">
            • {item}
          </li>
        ))}
      </ul>
    </div>
  );
}