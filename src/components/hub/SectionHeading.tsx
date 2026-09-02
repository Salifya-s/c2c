import {getTranslations} from 'next-intl/server';

type SectionHeadingProps = {
  descriptionKey?: string;
  labelKey: string;
  namespace: string;
  titleKey: string;
};

export const SectionHeading = async ({
  descriptionKey,
  labelKey,
  namespace,
  titleKey
}: SectionHeadingProps) => {
  const t = await getTranslations(namespace);

  return (
    <div className="grid gap-3">
      <div className="font-display text-xs font-bold uppercase tracking-[0.12em] text-zam-green-600">
        {t(labelKey)}
      </div>
      <h2 className="font-display text-[clamp(1.6rem,3.5vw,2.25rem)] font-bold leading-[1.18] tracking-tight text-ink">
        {t(titleKey)}
      </h2>
      {descriptionKey ? (
        <p className="max-w-[52ch] text-base leading-relaxed text-ink-3">
          {t(descriptionKey)}
        </p>
      ) : null}
    </div>
  );
};
