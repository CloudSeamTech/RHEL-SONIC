'use client';
import { useState } from 'react';
import {
  newMaintenancePractice,
  practiseMaintenance,
  canPractiseUpdate,
  type PracticeAction,
} from '@/lib/maintenance-rehearsal';
import './maintenance-rehearsal.css';
export function MaintenanceRehearsal() {
  const [state, setState] = useState(newMaintenancePractice);
  const [selected, setSelected] = useState('win-pilot');
  const server = state.servers.find((s) => s.id === selected)!;
  const move = (action: PracticeAction) =>
    setState((current) => practiseMaintenance(current, selected, action));
  const blocked = state.servers.some((s) => s.status === 'failed');
  return (
    <section
      className="maintenance-practice"
      aria-label="Practice a rolling maintenance window"
    >
      <header>
        <span className="eyebrow">TRY THE PROCESS / SIMULATION ONLY</span>
        <h2>Let’s practise a maintenance night</h2>
        <p>
          These four servers are pretend. Nothing connects to Azure or changes a
          VM. Try a good pilot, then make a health check fail and practise
          stopping the rollout.
        </p>
      </header>
      <div className="practice-table-wrap">
        <table>
          <caption>Your practice server list</caption>
          <thead>
            <tr>
              <th>Server</th>
              <th>Role</th>
              <th>Recovery ready?</th>
              <th>Practice status</th>
            </tr>
          </thead>
          <tbody>
            {state.servers.map((item) => (
              <tr key={item.id}>
                <th scope="row">
                  <button
                    onClick={() => setSelected(item.id)}
                    aria-pressed={selected === item.id}
                  >
                    {item.name}
                  </button>
                </th>
                <td>
                  {item.os} · {item.pilot ? 'pilot' : 'next wave'}
                </td>
                <td>
                  {item.backup && item.snapshot
                    ? 'Backup + snapshot checked'
                    : 'Not ready yet'}
                </td>
                <td>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <label className="practice-select">
        Choose the server you’re working on
        <select
          value={selected}
          onChange={(event) => setSelected(event.target.value)}
        >
          {state.servers.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <p>
        {blocked
          ? 'A health check failed. The rollout is paused until you recover and retest.'
          : state.servers
                .filter((s) => s.pilot)
                .every((s) => s.status === 'passed')
            ? 'Both pilots passed. You can prepare the remaining servers, one at a time.'
            : 'Start with the Windows and RHEL pilots. The next wave stays locked until both pass.'}
      </p>
      <div className="practice-controls">
        <button
          disabled={
            !['waiting', 'restored'].includes(server.status) || server.baseline
          }
          onClick={() => move('baseline')}
        >
          1. Check the healthy baseline
        </button>
        <button
          disabled={!server.baseline || server.backup}
          onClick={() => move('backup')}
        >
          2. Record backup and restore test
        </button>
        <button
          disabled={!server.backup || server.snapshot}
          onClick={() => move('snapshot')}
        >
          3. Record the pre-change snapshot
        </button>
        <button
          disabled={!canPractiseUpdate(state, selected)}
          onClick={() => move('update')}
        >
          {server.status === 'restored'
            ? '4. Try the revised update'
            : '4. Start this server’s update'}
        </button>
        <button
          disabled={server.status !== 'updating'}
          onClick={() => move('reboot')}
        >
          5. Finish the practice reboot
        </button>
        <button
          disabled={server.status !== 'checking'}
          onClick={() => move('pass')}
        >
          6. Health checks passed
        </button>
        <button
          disabled={server.status !== 'checking'}
          onClick={() => move('fail')}
        >
          6. Simulate a failed health check
        </button>
        <button
          disabled={server.status !== 'failed'}
          onClick={() => move('restore')}
        >
          Practise restoring this server
        </button>
      </div>
      <details>
        <summary>What should I check after each reboot?</summary>
        <p>
          Check the machine name and running OS/kernel, sign in again, inspect
          failed services and update results, open the application, and try a
          small test transaction. Compare the data with your baseline. Give the
          pilot the agreed observation period before going further.
        </p>
        <p>
          In real work, recovery can take time and may lose changes after the
          recovery point. This short simulation does not prove that a real
          restore, reboot or application test succeeded.
        </p>
      </details>
      <div
        className="practice-log"
        role="log"
        aria-label="Simulation activity log"
      >
        {state.log.map((line, i) => (
          <p key={i}>
            <span>[PRACTICE {i + 1}]</span> {line}
          </p>
        ))}
      </div>
      <button
        className="practice-reset"
        onClick={() => {
          setState(newMaintenancePractice());
          setSelected('win-pilot');
        }}
      >
        Start the practice again
      </button>
    </section>
  );
}
