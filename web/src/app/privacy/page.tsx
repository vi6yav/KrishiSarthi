const CONTACT_EMAIL = "vvermakol@gmail.com"; // TODO: put your real email here

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10 text-navy">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-sm">Last updated: 18 October 2026</p>

      <p className="mt-6">
        KrishiSarthi is a free student project that gives farmers AI-based help with pest
        detection, mandi prices, input planning and cold storage. This page explains what data we handle.
      </p>

      <h2 className="mt-8 text-xl font-semibold">What we collect</h2>
      <ul className="mt-2 list-disc space-y-1 pl-6">
        <li>Account details: your name, email and a hashed (scrambled) password. We never store your password in readable form.</li>
        <li>Your activity: a short history of the tools you used (your latest 100 entries), shown on your dashboard.</li>
        <li>Location: coordinates you share are used only to fetch weather for your advice.</li>
        <li>Leaf photos: analysed to give a result and not stored by us.</li>
        <li>Your login session is kept in your browser&apos;s local storage.</li>
      </ul>
      <p className="mt-2">We do not use advertising, analytics or tracking tools.</p>

      <h2 className="mt-8 text-xl font-semibold">Services we rely on</h2>
      <ul className="mt-2 list-disc space-y-1 pl-6">
        <li>Vercel (website hosting), Render (server) and Neon (database).</li>
        <li>Open-Meteo (weather) receives the coordinates you share.</li>
        <li>data.gov.in provides mandi prices. No personal data is sent to it.</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">Age</h2>
      <p className="mt-2">
        KrishiSarthi is for people aged 18 and over. We do not knowingly collect data from children.
        If you believe a child has an account, email us and we will delete it.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Your choices</h2>
      <p className="mt-2">
        You can ask to see, correct or delete your account and data at any time by emailing{" "}
        <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Changes</h2>
      <p className="mt-2">We may update this policy and will change the date above when we do.</p>
    </main>
  );
}