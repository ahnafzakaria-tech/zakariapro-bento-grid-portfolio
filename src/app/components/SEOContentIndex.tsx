import { Helmet } from "react-helmet-async";
import { myProjects } from "../ts/projects";
import { resumeData } from "../ts/resume-data";
import { myJourney } from "../ts/story";

const SITE_URL = "https://zakariapro.vercel.app";

/**
 * SEOContentIndex renders every piece of portfolio data as
 * visually-hidden semantic HTML, so search engines, screen readers,
 * and AI agents can index everything on the first HTML paint —
 * without waiting for tile modals to be opened.
 *
 * Also emits per-project and per-experience JSON-LD via Helmet.
 */
export function SEOContentIndex() {
  const projectsLd = {
    "@context": "https://schema.org",
    "@graph": myProjects.map((p) => ({
      "@type": "CreativeWork",
      "@id": `${SITE_URL}/#projects/${p.id}`,
      name: p.title,
      genre: p.category,
      description: p.description.replace(/\s+/g, " ").trim(),
      keywords: (p.tech || []).join(", "),
      url: `${SITE_URL}/#projects/${p.id}`,
      image: p.image ? `${SITE_URL}${p.image.replace(/^\.\//, "/")}` : undefined,
      author: { "@id": `${SITE_URL}/#person` },
      creator: { "@id": `${SITE_URL}/#person` },
      isPartOf: { "@id": `${SITE_URL}/#projects` },
    })),
  };

  const experienceLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/#person-experience`,
    name: "Md Zakaria Hossain",
    hasOccupation: resumeData.experience.map((job) => ({
      "@type": "Occupation",
      name: job.role,
      occupationLocation: { "@type": "Organization", name: job.company },
      description: job.description,
      skills: job.tags.join(", "),
      estimatedSalary: undefined,
    })),
    alumniOf: resumeData.education.map((edu) => ({
      "@type": "EducationalOrganization",
      name: edu.institution,
      description: `${edu.degree} — ${edu.year} — ${edu.score}`,
    })),
    hasCredential: [
      ...resumeData.certifications.professional,
      ...resumeData.certifications.extracurricular,
    ].map((c) => ({
      "@type": "EducationalOccupationalCredential",
      name: c.name,
      recognizedBy: { "@type": "Organization", name: c.issuer },
      dateCreated: c.year,
    })),
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(projectsLd)}</script>
        <script type="application/ld+json">
          {JSON.stringify(experienceLd)}
        </script>
      </Helmet>

      <div className="sr-only" aria-hidden="false">
        <section aria-labelledby="seo-about-heading">
          <h2 id="seo-about-heading">About Md Zakaria Hossain</h2>
          <p>
            Md Zakaria Hossain is a Project Document Controller with almost 4
            years of experience managing engineering and construction
            documentation on large-scale power generation and renewable energy
            EPC projects across Saudi Arabia and Bangladesh. A background in
            Law (LL.B, LL.M) brings a disciplined, compliance-focused approach
            to contractual documentation and regulatory record-keeping.
            Currently based in Riyadh, Saudi Arabia. Reach him at
            ahnafzakariaaz@gmail.com.
          </p>
        </section>

        <section aria-labelledby="seo-stack-heading">
          <h2 id="seo-stack-heading">Tools and Skills</h2>
          <p>
            Thinkproject, Samsung Knox Portal (S-PMIS), Aconex. Document
            coding & numbering, drawing & revision control, transmittal
            preparation & tracking, document registration & classification,
            MOM preparation & circulation, Method Statement (MOS) review, Risk
            Assessment (RA) coordination, MAR tracking, Field Change Request
            (FCR) control, contract & regulatory compliance, approval routing,
            project close-out & handover packages.
          </p>
        </section>

        <section aria-labelledby="seo-education-heading">
          <h2 id="seo-education-heading">Education</h2>
          <ul>
            {resumeData.education.map((e, i) => (
              <li key={i}>
                <strong>{e.degree}</strong> — {e.institution} — {e.year} —{" "}
                {e.score}
                {e.isCurrent ? " (currently enrolled)" : ""}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="seo-experience-heading">
          <h2 id="seo-experience-heading">Work Experience</h2>
          {resumeData.experience.map((job, i) => (
            <article key={i}>
              <h3>
                {job.role} — {job.company}
              </h3>
              <p>
                <em>{job.year}</em>
              </p>
              <p>{job.description}</p>
              <p>Tools: {job.tags.join(", ")}.</p>
            </article>
          ))}
        </section>

        <section aria-labelledby="seo-certs-heading">
          <h2 id="seo-certs-heading">Certifications</h2>
          <h3>Professional</h3>
          <ul>
            {resumeData.certifications.professional.map((c, i) => (
              <li key={i}>
                {c.name} — {c.issuer} — {c.year}
              </li>
            ))}
          </ul>
          <h3>Training</h3>
          <ul>
            {resumeData.certifications.extracurricular.map((c, i) => (
              <li key={i}>
                {c.name} — {c.issuer}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="seo-projects-heading">
          <h2 id="seo-projects-heading">Selected Projects</h2>
          <p>
            Full case-study index. Each project has a deep-linkable URL of the
            form <code>{SITE_URL}/#projects/&lt;id&gt;</code>.
          </p>
          {myProjects.map((p) => (
            <article
              key={p.id}
              id={`project-${p.id}`}
              itemScope
              itemType="https://schema.org/CreativeWork"
            >
              <h3 itemProp="name">{p.title}</h3>
              <p>
                <strong>Category:</strong>{" "}
                <span itemProp="genre">{p.category}</span>
              </p>
              <p itemProp="description">
                {p.description.replace(/\s+/g, " ").trim()}
              </p>
              {p.tech && p.tech.length > 0 && (
                <p>
                  <strong>Tech:</strong>{" "}
                  <span itemProp="keywords">{p.tech.join(", ")}</span>.
                </p>
              )}
              <p>
                <a
                  href={`${SITE_URL}/#projects/${p.id}`}
                  itemProp="url"
                >
                  Open project details
                </a>
              </p>
            </article>
          ))}
        </section>

        <section aria-labelledby="seo-evolution-heading">
          <h2 id="seo-evolution-heading">Career Timeline</h2>
          {myJourney.map((m) => (
            <article key={m.id}>
              <h3>
                {m.year} — {m.title}
              </h3>
              <p>{m.description.replace(/\s+/g, " ").trim()}</p>
            </article>
          ))}
        </section>

        <section aria-labelledby="seo-contact-heading">
          <h2 id="seo-contact-heading">Contact</h2>
          <ul>
            <li>
              Email:{" "}
              <a href="mailto:ahnafzakariaaz@gmail.com">
                ahnafzakariaaz@gmail.com
              </a>
            </li>
            <li>
              LinkedIn:{" "}
              <a href="https://www.linkedin.com/in/workwithzakariapro">
                linkedin.com/in/workwithzakariapro
              </a>
            </li>
            <li>
              WhatsApp:{" "}
              <a href="https://wa.me/8801517813524">+880 1517 813524</a>
            </li>
            <li>
              Phone (KSA):{" "}
              <a href="tel:+966530026787">+966 5300 26787</a>
            </li>
          </ul>
          <p>Location: Riyadh, Saudi Arabia. Availability: open to EPC project opportunities.</p>
        </section>
      </div>
    </>
  );
}