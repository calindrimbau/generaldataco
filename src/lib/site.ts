export const siteContent = {
  metadata: {
    title: "General Data Company",
    description: "We help companies license their data for AI training.",
  },
  header: {
    wordmark: "General Data Company",
  },
  hero: {
    kicker: "Data licensing",
    title: "Turn your data into training data.",
    description:
      "AI runs on licensed data. General Data Company finds what you have, clears the rights, and brings it to market.",
  },
  dataFlow: {
    accessibleLabel: "Data flowing from companies into AI training",
    destinationLabel: "AI",
  },
  process: {
    heading: "How it works",
    steps: [
      {
        number: "01",
        title: "Find",
        body: "We audit what you have. Logs, archives, text, images, transactions. Most companies hold more licensable data than they think.",
      },
      {
        number: "02",
        title: "Clear",
        body: "We sort out rights, privacy, and provenance, so your data can actually be sold.",
      },
      {
        number: "03",
        title: "License",
        body: "We package the data, price it, and run the deal.",
      },
    ],
  },
  about: {
    label: "Who we are",
    body: "General Data Company is a data licensing desk. We work for companies that hold data and take it to the AI training market.",
  },
  footer: {
    wordmark: "General Data Company",
    copyright: "© 2026 General Data Company",
  },
} as const;
