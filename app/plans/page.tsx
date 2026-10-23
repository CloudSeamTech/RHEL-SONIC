'use client';
import { ConsoleReaderShell } from '../console-reader-shell';
export default function PlansPage() {
  return (
    <ConsoleReaderShell activeView="plans">
      <main className="academy-information">
        <header>
          <span className="eyebrow">LEARN AT YOUR PACE</span>
          <h1>Plan information</h1>
          <p>Clear names. Clear expectations. No surprise charges.</p>
        </header>
        <aside className="information-panel">
          <h2>Payments are not live</h2>
          <p>
            You cannot purchase a paid plan here yet. No recurring charge starts
            when you browse a class or create a profile. Enhanced Tier and Apex
            Tier are planned options; prices and paid features have not been
            announced.
          </p>
        </aside>
        <div className="plan-information-grid">
          {[
            {
              name: 'Free Tier',
              status: 'Available learning',
              text: 'Browse the currently available lessons and practice with your own lab environment. Guest progress is saved in this browser; account availability depends on the site you are using.',
            },
            {
              name: 'Enhanced Tier',
              status: 'Planned · not for sale',
              text: 'Pricing and included features will be published before enrollment opens. No payment or upgrade is available yet.',
            },
            {
              name: 'Apex Tier',
              status: 'Planned · not for sale',
              text: 'Pricing and included features will be published before enrollment opens. No payment or upgrade is available yet.',
            },
          ].map((plan) => (
            <section className="information-panel" key={plan.name}>
              <span className="eyebrow">{plan.status}</span>
              <h2>{plan.name}</h2>
              <p>{plan.text}</p>
            </section>
          ))}
        </div>
        <section>
          <h2>Questions before you choose?</h2>
          <p>
            Review our <a href="/support#billing">billing information</a> and{' '}
            <a href="/support#faq">FAQ</a>. Our support address,
            support@cloudseam.tech, is being set up; see{' '}
            <a href="/support#contact">Contact us</a> for availability. Cloud
            usage, software licenses and exams are separate unless explicitly
            included in an offering.
          </p>
          <a href="/?view=paths" className="primary-button">
            Explore the learning paths →
          </a>
        </section>
      </main>
    </ConsoleReaderShell>
  );
}
