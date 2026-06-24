const imgHarvard = "/figma-assets/4d9f3b6d-90ff-4dc7-823a-d373883f1e97.png";
const imgStanford = "/figma-assets/c087525e-66b1-435a-b256-1589c54b0956.png";
const imgKellogg = "/figma-assets/fdd997b6-1f70-48b2-8d56-83b224a83554.png";
const imgBooth = "/figma-assets/a43a54c9-ba0a-4b88-83e0-e6a4446ef103.png";
const imgMIT = "/figma-assets/cbf7736c-bd51-47d7-8a6a-7cb4795155a5.png";
const imgWharton = "/figma-assets/f954d8af-6fc9-4e9a-a594-7fe6f8fbc743.png";
const imgColumbia = "/figma-assets/cbe9e50b-6186-4aa4-9269-3f6b658020fb.png";
const imgTuck = "/figma-assets/d5ec27f5-762c-42ec-875c-9b8e0b384315.png";
const imgNYU = "/figma-assets/c154182c-6454-4dca-a2ec-08e30780c243.png";
const imgJohnson = "/figma-assets/40c7dc10-c687-4767-83ee-455d1c1d9f93.png";
const imgFuqua = "/figma-assets/fce766bf-98fd-4e3e-aafa-47b4dadd40c2.png";
const imgDarden = "/figma-assets/8d9542cc-b8c9-44db-82c0-4e282ac03992.png";
const imgUCLA = "/figma-assets/88c5a933-b52f-4d5f-a534-99c90a3d3d05.png";
const imgHaas = "/figma-assets/e7e4f0b3-b413-4d61-8d3c-2097c96457a4.png";

const schools = [
  { name: "Harvard Business School", logo: imgHarvard },
  { name: "Stanford Graduate School of Business", logo: imgStanford },
  { name: "Kellogg School of Management", logo: imgKellogg },
  { name: "Chicago Booth School of Business", logo: imgBooth },
  { name: "MIT Sloan School of Management", logo: imgMIT },
  { name: "The Wharton School", logo: imgWharton },
  { name: "Columbia Business School", logo: imgColumbia },
  { name: "Tuck School of Business", logo: imgTuck },
  { name: "NYU Stern School of Business", logo: imgNYU },
  { name: "Johnson Graduate School of Management", logo: imgJohnson },
  { name: "Fuqua School of Business", logo: imgFuqua },
  { name: "Darden School of Business", logo: imgDarden },
  { name: "UCLA Anderson School of Management", logo: imgUCLA },
];

const schoolsRow2 = [...schools.slice(4), ...schools.slice(0, 4)];
const schoolsRow3 = [...schools.slice(0, 9), { name: "UC Berkeley Haas", logo: imgHaas }, ...schools.slice(10)];

function SchoolPill({ name, logo }: { name: string; logo: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-[60px] shrink-0 whitespace-nowrap px-5 h-15" style={{ background: "#f9f9f9" }}>
      <div className="shrink-0 w-6.25 h-6.25 flex items-center justify-center overflow-hidden">
        <img src={logo} alt="" className="w-full h-full object-contain" />
      </div>
      <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "16px", color: "#272727" }}>{name}</span>
    </div>
  );
}

function MarqueeRow({ items, duration, reverse = false }: { items: { name: string; logo: string }[]; duration: number; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className="group overflow-hidden">
      <div
        className="flex gap-3 group-hover:paused"
        style={{
          animation: `scroll-left ${duration}s linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
          width: "max-content",
        }}
      >
        {doubled.map((school, i) => <SchoolPill key={`${school.name}-${i}`} name={school.name} logo={school.logo} />)}
      </div>
    </div>
  );
}

export function TrustBar() {
  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="max-w-360 mx-auto px-15 mb-8">
        <h2 className="text-center font-bold" style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "40px", color: "#070707", lineHeight: "1.3" }}>
          Trusted by <span style={{ color: "#5450d8" }}>MBA</span> Applicants Worldwide
        </h2>
      </div>
      <div className="flex flex-col gap-3">
        <MarqueeRow items={schools} duration={65} />
        <MarqueeRow items={schoolsRow2} duration={75} reverse />
        <MarqueeRow items={schoolsRow3} duration={55} />
      </div>
    </section>
  );
}
