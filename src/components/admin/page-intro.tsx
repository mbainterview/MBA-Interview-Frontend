interface PageIntroProps {
  title: string;
  description?: string;
}

/**
 * In-page heading row that sits above stat cards / content tables.
 * Distinct from the topbar title which uses larger 32px Sora.
 */
export function PageIntro({ title, description }: PageIntroProps) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-heading text-[24px] font-semibold leading-[1.3] text-[#222c44]">
        {title}
      </h2>
      {description && (
        <p className="font-body text-[16px] leading-[1.4] text-[#808080]">
          {description}
        </p>
      )}
    </div>
  );
}
