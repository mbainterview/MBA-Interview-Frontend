"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Compass, Video } from "lucide-react";
import { toast } from "sonner";
import { OnboardingShell } from "@/components/shared/onboarding-shell";
import { WizardStepCard } from "@/components/shared/wizard-step-card";
import { useOnboardingDraft } from "@/hooks/use-onboarding-draft";
import { useSchools } from "@/services/schools.service";
import { useUpdateProfile } from "@/services/profile.service";
import { CANONICAL_SCHOOLS, resolveSchoolLogo } from "@/data/schools";
import type { School } from "@/types/domain";

const sora  = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";
const KIRA_ABBR = "KIRA";

/** A row in the rendered grid — either a real backend school (selectable) or
 *  a canonical Figma school whose backend record hasn't been seeded yet
 *  (rendered for visual completeness but not selectable). */
type SchoolRow =
  | { kind: "api"; id: string; name: string; logo?: string }
  | { kind: "placeholder"; name: string; logo: string };

export default function TargetSchoolsPage() {
  const router = useRouter();
  const { draft, update } = useOnboardingDraft();
  const updateProfile = useUpdateProfile();
  const [selected, setSelected] = useState<string[]>(draft.schools ?? []);
  const [kira, setKira] = useState<boolean>(draft.kiraSelected ?? false);

  const { data: schoolsData, isLoading } = useSchools({ limit: 100 });
  const allSchools = schoolsData?.data ?? [];
  // Kira is seeded as a real school with abbreviation KIRA, but the Figma
  // surfaces it as a featured tile separate from the academic-school grid.
  const kiraSchool = useMemo(
    () => allSchools.find((s) => s.abbreviation === KIRA_ABBR),
    [allSchools],
  );
  const academicSchools = useMemo(
    () => allSchools.filter((s) => s.abbreviation !== KIRA_ABBR),
    [allSchools],
  );

  // Merge API schools with the canonical Figma list so famous programs are
  // always present, even if the backend hasn't been seeded with them.
  const rows = useMemo<SchoolRow[]>(
    () => buildSchoolRows(academicSchools),
    [academicSchools],
  );

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleContinue = async () => {
    const targetSchoolIds = [
      ...selected,
      ...(kira && kiraSchool ? [kiraSchool.id] : []),
    ];

    try {
      await updateProfile.mutateAsync({ targetSchoolIds });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save your school selection",
      );
      return;
    }
    update({ schools: selected, kiraSelected: kira });
    router.push("/onboarding/goals");
  };

  return (
    <OnboardingShell>
      <WizardStepCard
        icon={<Compass size={20} />}
        iconColor="orange"
        title="Target Schools"
        onBack={() => router.push("/onboarding/resume")}
        onContinue={handleContinue}
        continueDisabled={
          (selected.length === 0 && !kira) || updateProfile.isPending
        }
        width={680}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <span
              style={{
                fontFamily: inter,
                fontSize: "14px",
                color: "#9999a5",
              }}
            >
              Loading schools...
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {rows.map((row) => {
              const isApi = row.kind === "api";
              const isSelected = isApi && selected.includes(row.id);
              const initial = row.name[0]?.toUpperCase() ?? "?";
              return (
                <button
                  key={isApi ? row.id : `placeholder:${row.name}`}
                  type="button"
                  disabled={!isApi}
                  onClick={() => isApi && toggle(row.id)}
                  title={
                    isApi
                      ? undefined
                      : "Coming soon — this school isn't available yet."
                  }
                  className="flex items-center gap-4 rounded-[20px] border px-5 py-5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    borderColor: isSelected ? "#5450d8" : "#e6e6e6",
                    background: isSelected ? "rgba(84,79,245,0.1)" : "white",
                  }}
                >
                  <div
                    className="flex h-15.5 w-15.5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white"
                    style={{ border: "0.86px solid #e6e6e6", padding: "4px" }}
                  >
                    {row.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={row.logo}
                        alt=""
                        className="h-full w-full rounded-full object-contain"
                      />
                    ) : (
                      <span
                        style={{
                          fontFamily: sora,
                          fontSize: "20px",
                          fontWeight: 700,
                          color: "#5450d8",
                        }}
                      >
                        {initial}
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontFamily: sora,
                      fontSize: "16px",
                      fontWeight: 600,
                      color: isSelected ? "#5450d8" : "#222c44",
                      lineHeight: 1.3,
                    }}
                  >
                    {row.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={() => setKira((v) => !v)}
          className="flex items-center gap-3 rounded-[20px] border px-6 py-6 text-left transition-colors"
          style={{
            borderColor: kira ? "#5450d8" : "#e6e6e6",
            background: kira ? "#eeeefe" : "white",
          }}
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px]"
            style={{ background: "white", border: "1px solid #e6e6e6", color: "#5450d8" }}
          >
            <Video size={20} />
          </div>
          <div className="flex flex-col gap-1.5">
            <span
              style={{
                fontFamily: sora,
                fontSize: "16px",
                fontWeight: 600,
                color: kira ? "#5450d8" : "#222c44",
              }}
            >
              Kira Video Essay Prep
            </span>
            <span
              style={{
                fontFamily: inter,
                fontSize: "14px",
                color: "#808080",
              }}
            >
              Practice timed video essay responses
            </span>
          </div>
        </button>
      </WizardStepCard>
    </OnboardingShell>
  );
}

function buildSchoolRows(apiSchools: School[]): SchoolRow[] {
  const apiByCanonicalName = new Map<string, School>();
  const matched = new Set<string>();

  for (const canon of CANONICAL_SCHOOLS) {
    const hit = apiSchools.find((s) => {
      const logo = resolveSchoolLogo(s);
      return logo === canon.logo;
    });
    if (hit) {
      apiByCanonicalName.set(canon.name, hit);
      matched.add(hit.id);
    }
  }

  const rows: SchoolRow[] = CANONICAL_SCHOOLS.map<SchoolRow>((canon) => {
    const hit = apiByCanonicalName.get(canon.name);
    return hit
      ? { kind: "api", id: hit.id, name: hit.name, logo: canon.logo }
      : { kind: "placeholder", name: canon.name, logo: canon.logo };
  });

  // Append any backend schools that aren't in the canonical list (e.g. niche
  // programs the user seeded themselves) — keep them selectable.
  for (const s of apiSchools) {
    if (matched.has(s.id)) continue;
    rows.push({ kind: "api", id: s.id, name: s.name, logo: resolveSchoolLogo(s) });
  }

  return rows;
}
