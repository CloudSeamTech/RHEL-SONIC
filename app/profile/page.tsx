'use client';
import { useState } from 'react';
import { useAcademy } from '../academy-provider';
import { ConsoleReaderShell } from '../console-reader-shell';
export default function Profile() {
  const academy = useAcademy();
  const [name, setName] = useState(''),
    [notice, setNotice] = useState('');
  return (
    <ConsoleReaderShell>
      <main className="profile-page">
        <span className="eyebrow">YOUR LEARNING SPACE</span>
        <h1>My profile</h1>
        {!academy.ready ? (
          <p>Loading your profile…</p>
        ) : academy.user ? (
          <>
            <p>
              Signed in as <strong>{academy.user.name}</strong>. Your course
              progress and bookmarks are saved to your account.
            </p>
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                try {
                  await academy.saveProfile(name || academy.user!.name);
                  setNotice('Your display name is saved.');
                } catch (error) {
                  setNotice((error as Error).message);
                }
              }}
            >
              <label>
                Display name
                <input
                  value={name}
                  placeholder={academy.user.name}
                  maxLength={80}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
              <button className="primary-button">Save profile</button>
            </form>
            <aside className="teaching-callout">
              <h2>Already started as a guest?</h2>
              <p>
                Bring this browser’s earlier guest progress into your account.
                Only import it if it belongs to you.
              </p>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await academy.importGuest();
                    setNotice('Your guest progress has been imported.');
                  } catch (error) {
                    setNotice((error as Error).message);
                  }
                }}
              >
                Import my browser progress
              </button>
            </aside>
            <p>{academy.syncMessage}</p>
            <a href="/signout-with-chatgpt?return_to=%2F" target="_top">
              Sign out
            </a>
          </>
        ) : (
          <>
            <p>
              Create your learning space by signing in. Keep your labs,
              bookmarks, and course progress together across devices.
            </p>
            {academy.accountAvailable ? (
              <a
                className="primary-button"
                href="/signin-with-chatgpt?return_to=%2Fprofile"
                target="_top"
              >
                Sign in with ChatGPT →
              </a>
            ) : (
              <>
                <p>
                  Account sync is not connected on this public mirror. You can
                  keep learning here with browser progress, or open the
                  connected academy.
                </p>
                <a
                  className="primary-button"
                  href="https://rhel-sonic-console.keepthefame24.chatgpt.site/profile"
                >
                  Open connected academy →
                </a>
              </>
            )}
            <p>
              Guest progress stays on this browser until you choose to import it
              after signing in.
            </p>
          </>
        )}
        <p role="status">{notice}</p>
      </main>
    </ConsoleReaderShell>
  );
}
