const CONTACT_EMAIL = "vvermakol@gmail.com"; // TODO: put your real email here

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10 text-navy">
      <h1 className="text-3xl font-bold">Terms of Use</h1>
      <p className="mt-2 text-sm">Last updated: 18 October 2026</p>

      <h2 className="mt-8 text-xl font-semibold">Using KrishiSarthi</h2>
      <p className="mt-2">
        KrishiSarthi is a free student project. You must be 18 or older to create an account.
        Please keep your login details private.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Guidance only, not professional advice</h2>
      <p className="mt-2">
        Pest and disease results, input recommendations, storage risk and price information are
        automatically generated guidance. They can be wrong or out of date. Please confirm with your
        local agriculture officer or a qualified expert before spraying, treating, buying, selling or
        storing crops. Mandi prices come from data.gov.in and MSP values are reference figures only.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Fair use</h2>
      <p className="mt-2">
        Do not misuse the service: no automated scraping, no attempts to break or overload it, and no
        attempts to access other people&apos;s accounts. We may limit or remove access to protect the service.
      </p>

      <h2 className="mt-8 text-xl font-semibold">No guarantees</h2>
      <p className="mt-2">
        The service is provided as it is, without any promise that it will always be available or
        error-free. To the extent allowed by law, we are not responsible for losses that result from
        using it.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Contact</h2>
      <p className="mt-2">
        Questions? Email <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        See also our <a className="underline" href="/privacy">Privacy Policy</a>.
      </p>
    </main>
  );
}