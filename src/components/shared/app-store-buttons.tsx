const imgAppleLogo = "/figma-assets/f45d7334-2a3b-4cd0-93d3-ef42af288ef8.svg";
const imgGooglePlayLogo = "/figma-assets/a33e8f4c-c1bd-4e2e-8121-e2ba440dc40a.svg";

const sora = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

interface AppStoreButtonsProps {
  /** Width of each button. Defaults to 210px. */
  buttonWidth?: number;
  /** Label on the primary (App Store) button. Defaults to "Start Practice". */
  appStoreLabel?: string;
}

export function AppStoreButtons({
  buttonWidth = 210,
  appStoreLabel = "Start Practice",
}: AppStoreButtonsProps) {
  return (
    <div className="flex items-center gap-3">
      {/* App Store */}
      <div
        className="inline-flex items-center justify-center gap-[16.281px] overflow-clip rounded-[13.025px] px-6 shrink-0"
        style={{
          background: "#5450d8",
          width: buttonWidth,
          paddingTop: "14.653px",
          paddingBottom: "14.653px",
        }}
      >
        <div className="capitalize flex flex-col items-start justify-center text-white whitespace-nowrap" style={{ gap: "3.256px" }}>
          <span style={{ fontFamily: inter, fontSize: "13.025px", lineHeight: "22.793px" }}>
            Download on the
          </span>
          <span className="font-semibold" style={{ fontFamily: sora, fontSize: "16.281px", lineHeight: "22.793px" }}>
            {appStoreLabel}
          </span>
        </div>
        <img
          src={imgAppleLogo}
          alt="App Store"
          className="shrink-0 object-contain"
          style={{ width: "32.561px", height: "40.022px" }}
        />
      </div>

      {/* Google Play */}
      <div
        className="inline-flex items-center justify-center gap-[16.281px] overflow-clip rounded-[13.025px] px-6 shrink-0"
        style={{
          background: "#edecfd",
          width: buttonWidth,
          paddingTop: "14.653px",
          paddingBottom: "14.653px",
        }}
      >
        <div className="capitalize flex flex-col items-start justify-center whitespace-nowrap" style={{ gap: "3.256px", color: "#272727" }}>
          <span style={{ fontFamily: inter, fontSize: "13.025px", lineHeight: "22.793px" }}>
            GET IT ON
          </span>
          <span className="font-semibold" style={{ fontFamily: sora, fontSize: "16.281px", lineHeight: "22.793px" }}>
            Google Play
          </span>
        </div>
        <img
          src={imgGooglePlayLogo}
          alt="Google Play"
          className="shrink-0"
          style={{ width: "40.013px", height: "40.013px" }}
        />
      </div>
    </div>
  );
}
