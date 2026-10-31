type PageHeroProps = {
  tag: string;
  title: string;
  description: string;
  image: string;
};

export function PageHero({
  tag,
  title,
  description,
  image,
}: PageHeroProps) {
  return (
    <section
      className="page-hero"
      style={{
        backgroundImage: `linear-gradient(90deg,rgba(5,30,70,.95),rgba(5,30,70,.64),rgba(5,30,70,.24)),url('${image}')`,
      }}
    >
      <div className="container">
        <span className="hero-pill">
          <span className="status-dot" />
          {tag}
        </span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  );
}
