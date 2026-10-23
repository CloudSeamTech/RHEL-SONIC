'use client';
import { ConsoleReaderShell } from '../console-reader-shell';
import { learningPathways, pathwayLessons } from '../learning-pathways';
import { lessonTier } from '../../lib/plan-access';
const lessons = learningPathways.flatMap(pathwayLessons);
const free = lessons.filter(
  (lesson) => lessonTier(lesson.id) === 'free',
).length;
export default function PlansPage() {
  return (
    <ConsoleReaderShell activeView="plans">
      <main className="academy-information">
        <header>
          <span className="eyebrow">
            TWO PLANS. ONE CLEAR LEARNING JOURNEY.
          </span>
          <h1>Free Tier & Apex Tier</h1>
          <p>
            Start with a complete beginner project. Build on it with deeper
            enterprise training.
          </p>
        </header>
        <aside className="information-panel">
          <h2>Plan preview · payments are not live</h2>
          <p>
            This page describes the planned split. Current lessons remain
            accessible during preparation: protected content delivery and public
            customer accounts must be connected before Apex restrictions go
            live. No payment or recurring charge starts here.
          </p>
        </aside>
        <div className="plan-information-grid two-plans">
          <section className="information-panel">
            <span className="eyebrow">BEGINNER PROJECTS</span>
            <h2>Free Tier</h2>
            <p>
              <strong>{free} foundation labs in the planned catalog.</strong>
            </p>
            <ul>
              <li>
                Prepare VMware and build DC01 with Active Directory and DNS.
              </li>
              <li>
                Build and access a small RHEL practice environment, with
                rollback and cloud cleanup guidance.
              </li>
              <li>
                Set up an AlmaLinux desktop, learn everyday commands and install
                apps.
              </li>
              <li>
                Install Splunk, load practice data and learn basic searches.
              </li>
            </ul>
            <p>
              Each included lesson keeps its screenshots, prerequisites,
              expected results and fixes for that exercise.
            </p>
            <a href="/?view=courses&tier=free">Preview the Free labs →</a>
          </section>
          <section className="information-panel">
            <span className="eyebrow">FOUNDATIONS + ENTERPRISE OPERATIONS</span>
            <h2>Apex Tier</h2>
            <p>
              <strong>
                All {lessons.length} labs, including {lessons.length - free}{' '}
                additional labs in the planned catalog.
              </strong>
            </p>
            <ul>
              <li>DC02, replication, Group Policy, SQL, IIS, WSUS and MECM.</li>
              <li>
                Azure landing zones, migrations, Defender, maintenance and
                recovery.
              </li>
              <li>
                Advanced Linux operations, storage, transfers and security-agent
                training.
              </li>
              <li>Splunk investigations, dashboards, alerts and Nessus.</li>
              <li>The separate enterprise troubleshooting library.</li>
            </ul>
            <p>
              Includes everything in Free. Price, renewal and refund terms will
              be published before enrollment opens.
            </p>
            <a href="/?view=courses&tier=apex">Preview the Apex subjects →</a>
          </section>
        </div>
        <section>
          <h2>Help stays available</h2>
          <p>
            Account help, billing information, cancellation assistance and the
            fixes needed to complete a Free lesson remain available without
            Apex. The separate day-to-day troubleshooting library is classified
            as Apex.
          </p>
          <p>
            Cloud usage, software licenses and exams are separate unless
            explicitly included in an offering.{' '}
            <a href="/support#billing">Read billing information →</a>
          </p>
        </section>
      </main>
    </ConsoleReaderShell>
  );
}
