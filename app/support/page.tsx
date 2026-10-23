'use client';
import { ConsoleReaderShell } from '../console-reader-shell';
const email = 'support@cloudseam.tech';
export default function SupportPage() {
  return (
    <ConsoleReaderShell activeView="support">
      <main className="academy-information">
        <header>
          <span className="eyebrow">WE’RE HERE TO HELP</span>
          <h1>Help & information</h1>
          <p>
            Find an answer, get help with a lab, or ask us about your account.
          </p>
        </header>
        <nav className="information-tabs" aria-label="Support topics">
          <a href="#contact">Contact us</a>
          <a href="#faq">FAQ</a>
          <a href="#billing">Billing</a>
          <a href="#privacy">Privacy</a>
          <a href="#about">About us</a>
        </nav>
        <section id="contact" className="information-panel">
          <h2>Contact us</h2>
          <p>
            Stuck on a step? Start with the troubleshooting library below. When
            email support opens, include your lab link, step number and exact
            error message so we can help you find the next step.
          </p>
          <div className="support-availability">
            <strong>Support email · coming soon</strong>
            <p>{email}</p>
            <p>
              This mailbox is being set up and is not receiving messages yet.
              Please use the troubleshooting library and FAQ while we prepare
              email support. We’ll enable the email link after delivery has been
              tested.
            </p>
          </div>
          <p>
            Need a quick check first?{' '}
            <a href="/migration#lesson=lab-19">
              Browse common troubleshooting tips →
            </a>
          </p>
        </section>
        <section id="faq">
          <h2>Frequently asked questions</h2>
          <details>
            <summary>Where do I find my class?</summary>
            <p>
              Open Learning Paths, choose your career pathway, then select a
              subject. Each subject lists its labs in order. All Courses lets
              you browse subjects directly, and Search finds a particular topic.
            </p>
          </details>
          <details>
            <summary>Will my progress follow me to another computer?</summary>
            <p>
              Guest progress stays in the browser you used. Account progress on
              the connected academy is saved after you sign in. The public site
              currently supports guest learning; public account sign-in is not
              connected yet. Visit <a href="/profile">My profile</a> to see the
              options available on this site.
            </p>
          </details>
          <details>
            <summary>Does clicking Run control my computer?</summary>
            <p>
              The hosted website cannot run commands on your computer by itself.
              Real terminal output requires the authenticated local companion.
              Otherwise, copy the command into the application named in your
              lesson.{' '}
              <a href="/migration#view=terminal&setup=1">
                Open the terminal setup guide →
              </a>
            </p>
          </details>
          <details>
            <summary>Are the pictures recordings of my own lab?</summary>
            <p>
              No. Pictures are interface references or labeled training
              illustrations. Names and controls can vary by software version.
              Your lesson explains the values to enter and what to check on your
              own machine.
            </p>
          </details>
          <details>
            <summary>Are cloud usage and software licenses included?</summary>
            <p>
              Azure usage, virtual machines, vendor licenses and exams are
              separate unless an offering explicitly includes them. A lesson
              does not create a cloud account or grant a software license.
              Follow the budget and cleanup steps in each cloud lab.
            </p>
          </details>
          <details>
            <summary>
              What should I do if a screenshot or step looks wrong?
            </summary>
            <p>
              Keep a note of the lab link, step number, software version and
              what your screen shows. Email support is coming soon; its
              availability is shown at the top of this page. Keep your saved
              progress rather than starting the whole course again.
            </p>
          </details>
        </section>
        <section id="billing" className="information-panel">
          <h2>Payments & subscriptions</h2>
          <p>
            <strong>
              Paid subscriptions are not available yet. This website does not
              currently collect payments or start recurring charges.
            </strong>
          </p>
          <p>
            Our plan names are Free Tier, Enhanced Tier and Apex Tier. Prices,
            paid benefits, renewal terms and refund rules have not been
            announced. See <a href="/plans">Plan information →</a>
          </p>
          <h3>Before you pay</h3>
          <p>
            Any future checkout must show the plan’s included features, total
            price, currency, billing interval, applicable taxes, renewal terms,
            cancellation process and refund policy before you confirm. Those
            terms will be available here before paid enrollment opens.
          </p>
          <h3>Cancellations, refunds or an unexpected charge</h3>
          <p>
            There is no active subscription checkout to cancel here today. Email
            support is being set up before paid enrollment opens. Once
            available, a billing request should include the account email,
            charge date and receipt reference, never a full card number. Closing
            a browser tab does not cancel a subscription with an external
            service.
          </p>
        </section>
        <section id="privacy">
          <h2>Your account & privacy</h2>
          <p>
            On the connected academy, we store your profile name, optional
            contact email and phone, learning progress and recent lesson
            activity in Cloudflare D1. Sign-in is managed by the hosting
            platform. Our application does not store your sign-in password.
          </p>
          <p>
            Guest progress and bookmarks are stored in your browser. Clearing
            site data can remove them. The public Vercel site currently uses
            this guest mode rather than a connected customer-account database.
          </p>
          <p>
            Your profile lets you edit your name and optional contact details.
            Email support for further account-data requests is being set up;
            check the Contact us section for availability. Ownership
            verification will be needed for account-data requests. If account or
            payment providers change, this information will be updated before
            the new services go live.
          </p>
        </section>
        <section id="about" className="information-panel">
          <span className="eyebrow">CLOUDSEAMTECH</span>
          <h2>About SONIC-Academy</h2>
          <p>
            We build practical, self-paced IT training. Start with the basics,
            try each task in your practice environment, and learn to explain
            what you checked and why it matters.
          </p>
          <p>
            Our pathways cover Windows System Administration, Azure Cloud
            Engineering, Cyber Analyst skills and Linux System Administration.
          </p>
          <p>
            Business name: <strong>Cloud Seam Technologies</strong>.<br />
            Location: Delaware, United States.
            <br />
            Support email: {email} · coming soon.
          </p>
          <p>
            Training is independent. Vendor names identify the tools being
            taught; course completion does not grant a vendor certification. The
            full purchase terms and required seller details will be supplied
            before paid enrollment opens.
          </p>
          <a
            href="/academy-hero.png"
            download="CloudSeamTech-transparent-cloud.png"
          >
            Download the transparent cloud artwork (PNG) ↓
          </a>
        </section>
      </main>
    </ConsoleReaderShell>
  );
}
