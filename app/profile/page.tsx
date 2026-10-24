'use client';
import { useEffect, useState } from 'react';
import { useAcademy } from '../academy-provider';
import { planLabel } from '../../lib/plan-access';
import { ConsoleReaderShell } from '../console-reader-shell';
export default function Profile() {
  const academy = useAcademy();
  const [email, setEmail] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    setName(null); setEmail(null); setPhone(null); setNotice('');
  }, [academy.user?.id]);
  return (
    <ConsoleReaderShell>
      <main className="profile-page">
        <header className="profile-header">
          <span className="eyebrow">YOUR LEARNING SPACE</span>
          <h1>My account</h1>
          <p>Your details, saved learning, and membership in one place.</p>
        </header>
        <nav className="account-tabs" aria-label="Profile sections">
          <a href="/profile" aria-current="page">Account</a>
          <a href="/?view=bookmarks">My saved labs</a>
        </nav>
        {!academy.ready ? <p role="status">Loading your profile…</p> : academy.user ? (
          <div className="profile-sections">
            <section className="profile-section" aria-labelledby="profile-details-title">
              <h2 id="profile-details-title">Your details</h2>
              <p>Signed in as <strong>{academy.user.name}</strong>. Changes here update your contact details, not your sign-in account.</p>
              <form onSubmit={async (event) => {
                event.preventDefault();
                if (saving) return;
                setSaving(true);
                setNotice('');
                try {
                  await academy.saveProfile(name ?? academy.user!.name, {
                    email: email ?? academy.user!.email ?? '',
                    phone: phone ?? academy.user!.phone ?? '',
                  });
                  setNotice('Your account details are saved.');
                } catch (error) { setNotice((error as Error).message); }
                finally { setSaving(false); }
              }}>
                <label>Display name<input value={name ?? academy.user.name} required maxLength={80} autoComplete="name" onChange={(event) => setName(event.target.value)} /></label>
                <label>Contact email<input type="email" value={email ?? academy.user.email ?? ''} maxLength={254} autoComplete="email" onChange={(event) => setEmail(event.target.value)} /></label>
                <label>Phone (optional)<input type="tel" value={phone ?? academy.user.phone ?? ''} maxLength={32} autoComplete="tel" onChange={(event) => setPhone(event.target.value)} /></label>
                <button className="primary-button" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</button>
              </form>
            </section>
            <div className="profile-secondary">
              <section className="profile-section account-subscription" aria-labelledby="profile-plan-title">
                <h2 id="profile-plan-title">Your membership</h2>
                <p>Current plan: <strong>{planLabel(academy.user.subscriptionTier)}</strong></p>
                <p>Free Tier · Apex Tier</p>
                <p>Paid subscriptions are not connected yet. No payment is taken here.</p>
                <a href="/plans">View plan information →</a>
              </section>
              <section className="profile-section" aria-labelledby="profile-import-title">
                <h2 id="profile-import-title">Bring your guest progress</h2>
                <p>Started learning before signing in? Import this browser’s saved progress only if it belongs to you.</p>
                <button type="button" disabled={saving} onClick={async () => {
                  setSaving(true);
                  try { await academy.importGuest(); setNotice('Your guest progress has been imported.'); }
                  catch (error) { setNotice((error as Error).message); }
                  finally { setSaving(false); }
                }}>Import my browser progress</button>
              </section>
              <section className="profile-section">
                <h2>Need help?</h2>
                <a href="/support#faq">Account help & FAQ →</a>
                <p><a href="/signout-with-chatgpt?return_to=%2F" target="_top">Sign out</a></p>
              </section>
            </div>
          </div>
        ) : (
          <div className="profile-sections">
            <section className="profile-section" aria-labelledby="profile-signin-title">
              <h2 id="profile-signin-title">{academy.accountAvailable ? 'Save your learning across devices' : 'You’re learning as a guest'}</h2>
              {academy.accountAvailable ? <>
                <p>Sign in to keep your labs, bookmarks, and progress together across devices.</p>
                <a className="primary-button" href="/signin-with-chatgpt?return_to=%2Fprofile" target="_top">Sign in with ChatGPT →</a>
                <p>You can choose to import this browser’s guest progress after signing in.</p>
              </> : <>
                <p>Your progress and bookmarks are saved in this browser. Public account sign-in and cross-device saving are not connected yet.</p>
                <p>Google and GitHub sign-in are planned. You don’t need an account to keep learning here.</p>
                <a className="primary-button" href="/?view=courses">Find your next lab →</a>
              </>}
            </section>
            <section className="profile-section" aria-labelledby="profile-learning-title">
              <h2 id="profile-learning-title">Your saved learning</h2>
              <dl className="profile-learning-stats">
                <div><dt>Completed labs</dt><dd>{academy.completed.length}</dd></div>
                <div><dt>Bookmarked labs</dt><dd>{academy.bookmarks.length}</dd></div>
              </dl>
              <a href="/?view=bookmarks">Open my bookmarks →</a>
              <p>Use the same browser to return to your saved learning. Clearing browser data can remove guest progress.</p>
            </section>
          </div>
        )}
        {notice && <p role="status" aria-live="polite">{notice}</p>}
        {academy.user && academy.syncMessage && <p role="status">{academy.syncMessage}</p>}
      </main>
    </ConsoleReaderShell>
  );
}
