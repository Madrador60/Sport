type SectionIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
  badge: string;
  meta?: string;
};

export const SectionIntro = ({
  eyebrow,
  title,
  description,
  badge,
  meta,
}: SectionIntroProps) => (
  <section className="section-intro">
    <div className="section-copy">
      <p className="section-eyebrow">{eyebrow}</p>
      <div className="section-title-row">
        <h2 className="section-title">{title}</h2>
        <span className="section-badge">{badge}</span>
      </div>
      <p className="section-description">{description}</p>
    </div>
    {meta ? <p className="section-meta">{meta}</p> : null}
  </section>
);
