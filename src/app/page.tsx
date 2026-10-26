import { DataFlow } from "@/components/DataFlow";
import { siteContent } from "@/lib/site";

import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.wordmark}>{siteContent.header.wordmark}</div>
      </header>

      <main>
        <section className={styles.hero} aria-labelledby="hero-heading">
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>{siteContent.hero.kicker}</p>
            <h1 id="hero-heading">{siteContent.hero.title}</h1>
            <p className={styles.heroDescription}>
              {siteContent.hero.description}
            </p>
          </div>

          <div className={styles.flow}>
            <DataFlow />
          </div>
        </section>

        <section className={styles.process} aria-labelledby="process-heading">
          <h2 id="process-heading">{siteContent.process.heading}</h2>
          <ol className={styles.steps}>
            {siteContent.process.steps.map((step) => (
              <li className={styles.step} key={step.number}>
                <span className={styles.stepNumber}>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.about} aria-labelledby="about-heading">
          <h2 className={styles.sectionLabel} id="about-heading">
            {siteContent.about.label}
          </h2>
          <p>{siteContent.about.body}</p>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerMain}>
          <span>{siteContent.footer.wordmark}</span>
        </div>
        <p>{siteContent.footer.copyright}</p>
      </footer>
    </div>
  );
}
