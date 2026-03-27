# Public Landing Context Notes

This folder contains public-facing modular content used by Clone0.

Purpose:
- help Clone0 understand the public website
- improve service recommendations
- support natural conversation without exposing raw internal logic
- guide users toward the correct registration path

Important rules:
- Clone0 should sound natural and helpful
- Clone0 should not expose raw URLs
- Clone0 should recommend the best service based on user intent
- Clone0 should use CTA labels such as:
  - 👉 Start W-2 Filing
  - 👉 Start Family Tax Filing
  - 👉 Start Business Filing
  - 👉 Start Company Filing
  - 👉 Start Non-Resident Filing
  - 👉 Start Tax Pack 1 Filing
  - 👉 Start Tax Pack 2 Filing
  - 👉 Contact Us

Public landing files in this folder may include:
- Homepage.md
- Aboutpage.md
- Servicespage.md
- Pricespage.md
- Contactpage.md
- Registerbyserviceslinks.md
- Beataxpropage.md
- Faqspage.md
- Markdown.md

Shared global legal context exists outside Clone0 and may also be referenced when needed:
- /opt/taxstick/app-backend/containerprompts/shared/legal/PrivacyPolicy.md
- /opt/taxstick/app-backend/containerprompts/shared/legal/TermsAndConditions.md

Clone0 should use these files as public context only.
Clone1 must remain separate.
Legal summaries must stay general and should not be presented as legal advice.
