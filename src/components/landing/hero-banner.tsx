import type { ReactNode } from "react";
import Link from "next/link";

const sora = "var(--font-sora), sans-serif";

/**
 * Wave-ribbon decoration — pixel-faithful port of the Figma source (node
 * 688:9589). Renders the 43 hexagonal-ring SVG layers with the EXACT structure
 * the Figma code generator produces:
 *
 *   <div inset="<%>" containerType="size">     (negative-inset wrapper)
 *     <div h="100cqw" w="100cqh" rotate="90">  (rotated inner via container queries)
 *       <div maskImage maskPos maskSize>       (mask clips visible area)
 *         <img src=layer.svg />
 *       </div>
 *     </div>
 *   </div>
 *
 * The mask is the solid-black rectangle in mask.svg; with `mask-mode: alpha`
 * it acts as a clip — revealing only the 1320×880 region at the configured
 * mask-position within each rotated layer.
 */
type LayerSpec = {
  inset: [number, number, number, number]; // top, right, bottom, left (percent)
  maskPosition: string; // CSS mask-position string
};

const LAYER_SPECS: LayerSpec[] = [
  { inset: [-65.91, -11.5,  -151.47,  7.38],  maskPosition: "-97.405px 313.079px"  },
  { inset: [-65.77, -10.76, -151.55,  7.26],  maskPosition: "-95.821px 312.411px"  },
  { inset: [-65.63, -10.02, -151.63,  7.14],  maskPosition: "-94.243px 311.743px"  },
  { inset: [-65.49,  -9.28, -151.7,   7.02],  maskPosition: "-92.661px 311.074px"  },
  { inset: [-65.35,  -8.54, -151.78,  6.9],   maskPosition: "-91.078px 310.407px"  },
  { inset: [-65.21,  -7.8,  -151.86,  6.78],  maskPosition: "-89.497px 309.738px"  },
  { inset: [-65.07,  -7.06, -151.93,  6.66],  maskPosition: "-87.916px 309.071px"  },
  { inset: [-64.93,  -6.32, -152.01,  6.54],  maskPosition: "-86.335px 308.402px"  },
  { inset: [-64.79,  -5.58, -152.09,  6.42],  maskPosition: "-84.755px 307.734px"  },
  { inset: [-64.65,  -5.03, -152.17,  6.11],  maskPosition: "-80.69px 307.066px"   },
  { inset: [-64.5,   -4.89, -152.24,  5.39],  maskPosition: "-71.19px 306.398px"   },
  { inset: [-64.36,  -4.75, -152.32,  4.67],  maskPosition: "-61.692px 305.728px"  },
  { inset: [-64.22,  -4.61, -152.4,   3.95],  maskPosition: "-52.193px 305.06px"   },
  { inset: [-64.08,  -4.47, -152.47,  3.23],  maskPosition: "-42.695px 304.39px"   },
  { inset: [-63.94,  -4.33, -152.55,  2.51],  maskPosition: "-33.195px 303.722px"  },
  { inset: [-63.8,   -4.19, -152.63,  1.8],   maskPosition: "-23.697px 303.052px"  },
  { inset: [-63.66,  -4.05, -152.71,  1.08],  maskPosition: "-14.199px 302.384px"  },
  { inset: [-63.52,  -3.91, -152.78,  0.36],  maskPosition: "-4.7px 301.716px"     },
  { inset: [-63.38,  -3.77, -152.86, -0.36],  maskPosition: "4.799px 301.046px"    },
  { inset: [-63.24,  -3.64, -152.94, -1.08],  maskPosition: "14.299px 300.377px"   },
  { inset: [-63.1,   -3.5,  -153.01, -1.8],   maskPosition: "23.798px 299.707px"   },
  { inset: [-62.96,  -3.36, -153.09, -2.52],  maskPosition: "33.295px 299.037px"   },
  { inset: [-63.49,  -2.27, -152.08, -2.35],  maskPosition: "31.048px 301.57px"    },
  { inset: [-64.02,  -1.18, -151.08, -2.18],  maskPosition: "28.803px 304.104px"   },
  { inset: [-64.55,  -0.09, -150.07, -2.01],  maskPosition: "26.558px 306.636px"   },
  { inset: [-65.09,   1,    -149.07, -1.84],  maskPosition: "24.311px 309.169px"   },
  { inset: [-65.62,   2.09, -148.06, -1.67],  maskPosition: "22.062px 311.7px"     },
  { inset: [-66.15,   3.18, -147.05, -1.5],   maskPosition: "19.816px 314.232px"   },
  { inset: [-66.69,   3.87, -146.05, -1.73],  maskPosition: "22.804px 316.764px"   },
  { inset: [-67.22,   3.85, -145.04, -2.67],  maskPosition: "35.234px 319.296px"   },
  { inset: [-67.75,   3.82, -144.04, -3.61],  maskPosition: "47.663px 321.826px"   },
  { inset: [-68.29,   3.8,  -143.03, -4.55],  maskPosition: "60.094px 324.357px"   },
  { inset: [-68.82,   3.78, -142.02, -5.49],  maskPosition: "72.523px 326.888px"   },
  { inset: [-69.35,   3.76, -141.02, -6.44],  maskPosition: "84.95px 329.418px"    },
  { inset: [-69.88,   3.73, -140.01, -7.38],  maskPosition: "97.38px 331.948px"    },
  { inset: [-70.42,   3.71, -139.01, -8.32],  maskPosition: "109.807px 334.477px"  },
  { inset: [-70.95,   3.69, -138,    -9.26],  maskPosition: "122.236px 337.007px"  },
  { inset: [-71.48,   3.67, -136.99, -10.2],  maskPosition: "134.664px 339.536px"  },
  { inset: [-72.01,   3.64, -135.99, -11.14], maskPosition: "147.092px 342.065px"  },
  { inset: [-72.55,   3.62, -134.98, -12.08], maskPosition: "159.518px 344.595px"  },
  { inset: [-73.08,   3.6,  -133.97, -13.03], maskPosition: "171.946px 347.124px"  },
  { inset: [-73.61,   3.58, -132.97, -13.97], maskPosition: "184.372px 349.651px"  },
  { inset: [-74.14,   3.55, -131.96, -14.91], maskPosition: "196.799px 352.18px"   },
];

function HeroWaveRibbons() {
  // Render the 43 Figma SVG layers using the same nested container-query +
  // rotation structure Figma uses, but WITHOUT the CSS mask wrapper. The mask
  // step in Figma's source is what was hiding everything — its purpose is
  // purely cosmetic (clipping the layer to a smaller visible window inside the
  // rotated rect). The hero's own `overflow: hidden` already clips anything
  // outside the visible rectangle, so we don't strictly need the mask to get
  // the same visual.
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {LAYER_SPECS.map((spec, i) => {
        const [t, r, b, l] = spec.inset;
        const layerSrc = `/figma-assets/hero-arc/layer-${String(i + 1).padStart(2, "0")}.svg`;
        return (
          <div
            key={i}
            className="absolute flex items-center justify-center"
            style={{
              top: `${t}%`,
              right: `${r}%`,
              bottom: `${b}%`,
              left: `${l}%`,
              containerType: "size",
            }}
          >
            <div
              className="flex-none relative"
              style={{
                height: "100cqw",
                width: "100cqh",
                transform: "rotate(90deg)",
              }}
            >
              <img
                alt=""
                src={layerSrc}
                className="absolute inset-0 w-full h-full"
                style={{ display: "block", maxWidth: "none" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
const inter = "var(--font-inter), sans-serif";

export type HeroBannerBadge = {
  /** Image URL for the badge icon. Mutually exclusive with `iconNode`. */
  icon?: string;
  /** Custom React node (e.g. lucide icon) for the badge icon. Overrides `icon` if both are set. */
  iconNode?: ReactNode;
  iconAlt?: string;
  iconWidth?: number;
  iconHeight?: number;
  text: string;
};

export type HeroBannerCta = {
  label: string;
  href: string;
};

export type HeroBannerProps = {
  badge?: HeroBannerBadge;
  title: ReactNode;
  subtitle?: string;
  cta?: HeroBannerCta;
  /**
   * Background treatment:
   * - "solid" (default): flat #5450d8
   * - "gradient": symmetric lighter-edge gradient (matches /how-it-works)
   */
  variant?: "solid" | "gradient";
  /** Override subtitle max-width (defaults to ~570-600px per Figma). */
  subtitleMaxWidth?: string;
};

export function HeroBanner({
  badge,
  title,
  subtitle,
  cta,
  variant = "solid",
  subtitleMaxWidth = "597px",
}: HeroBannerProps) {
  const background =
    variant === "gradient"
      ? "linear-gradient(to left, #6b67f0 0%, #5450d8 50%, #6b67f0 100%)"
      : "#5450d8";

  return (
    <div className="max-w-360 mx-auto px-4 md:px-8 xl:px-15 pt-8 pb-0">
      <div
        className="relative rounded-[20px] overflow-hidden flex items-center justify-center"
        style={{ minHeight: "475px", background }}
      >
        {/* Wave-ribbon decorative pattern — symmetric fan emanating from the
            bottom-left and bottom-right corners up to the top edge. Matches
            the Figma design used across all purple hero banners. */}
        <HeroWaveRibbons />

        {/* Content */}
        <div className="relative flex flex-col items-center gap-5 px-6 py-16 text-center max-w-153">
          {badge && (
            <div
              className="inline-flex items-center gap-2.5 rounded-full px-4 py-2"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              {badge.iconNode
                ? badge.iconNode
                : badge.icon && (
                    <img
                      src={badge.icon}
                      alt={badge.iconAlt ?? ""}
                      className="object-contain"
                      style={{
                        width: `${badge.iconWidth ?? 29}px`,
                        height: `${badge.iconHeight ?? 22}px`,
                      }}
                    />
                  )}
              <span
                className="font-bold"
                style={{ fontFamily: inter, fontSize: "16px", color: "white" }}
              >
                {badge.text}
              </span>
            </div>
          )}

          <h1
            className="font-semibold leading-[1.3]"
            style={{ fontFamily: sora, fontSize: "clamp(32px, 4vw, 50px)", color: "white" }}
          >
            {title}
          </h1>

          {subtitle && (
            <p
              style={{
                fontFamily: inter,
                fontSize: "22px",
                color: "#c6c4f9",
                lineHeight: "1.2",
                maxWidth: subtitleMaxWidth,
              }}
            >
              {subtitle}
            </p>
          )}

          {cta && (
            <div className="mt-2">
              <Link
                href={cta.href}
                className="inline-flex items-center justify-center font-medium rounded-[16px] px-8 py-4 text-white text-lg transition-colors hover:opacity-90"
                style={{ background: "#6c67ff", fontFamily: inter, fontSize: "16px" }}
              >
                {cta.label}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
