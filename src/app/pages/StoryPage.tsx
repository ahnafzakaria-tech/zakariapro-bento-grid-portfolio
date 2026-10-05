import { Helmet } from "react-helmet-async";
import { myJourney } from "../ts/story";
import { canonical } from "../lib/slugs";
import { PageShell } from "./PageShell";

export function StoryPage() {
  const url = canonical("/story");
  const description =
    "How Md Zakaria Hossain grew from a foundation in law into a Project Document Controller managing large-scale EPC and renewable energy projects across Saudi Arabia and Bangladesh — a timeline of discipline, compliance, and craft.";

  return (
    <PageShell>
      <Helmet>
        <title>Career Timeline — Md Zakaria Hossain</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Career Timeline — Md Zakaria Hossain" />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
      </Helmet>

      <article>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-4">
          Career <span className="text-emerald-600 dark:text-accent">Timeline</span>
        </h1>
        <p className="text-lg text-muted-foreground font-medium mb-12 max-w-2xl">
          {description}
        </p>

        <div className="relative border-l-2 border-border/50 ml-2 md:ml-6 space-y-12 pb-12">
          {myJourney.map((m) => {
            const Icon = m.icon;
            return (
              <section
                key={m.id}
                id={`milestone-${m.id}`}
                className="relative pl-6 md:pl-12"
              >
                <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-emerald-500 dark:bg-accent ring-4 ring-background" />

                <div className="mb-4">
                  <span className="text-3xl md:text-4xl font-black text-emerald-600/90 dark:text-accent/90 tracking-tighter">
                    {m.year}
                  </span>
                </div>

                <div className="bg-secondary/30 border border-border rounded-3xl p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`p-2.5 rounded-xl ${m.bg} ${m.color}`}>
                      <Icon size={22} />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black uppercase leading-none tracking-tight">
                      {m.title}
                    </h2>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-1">
                      <p className="text-base md:text-lg text-muted-foreground leading-relaxed whitespace-pre-line font-medium">
                        {m.description}
                      </p>
                    </div>
                    {m.image && (
                      <div className="w-full md:w-1/3 aspect-video md:aspect-square shrink-0 rounded-2xl overflow-hidden border border-border">
                        <img
                          src={m.image}
                          alt={m.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </article>
    </PageShell>
  );
}
