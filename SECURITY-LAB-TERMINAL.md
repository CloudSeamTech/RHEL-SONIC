# LAB TERMINAL security boundary

## Trust model

The local companion is not a remote administration server. It is an opt-in
bridge between a locally served SONIC UI and shell processes running as the
same signed-in Windows user.

Controls implemented:

- hard-coded loopback binding (`127.0.0.1`), with startup rejection for a
  non-loopback bind;
- network peer must be loopback;
- browser `Origin` must be `http(s)://localhost`, `127.0.0.1`, or IPv6
  loopback;
- 256-bit random token by default and constant-time comparison;
- authentication must finish within five seconds;
- token remains in component memory and is not put in localStorage, a URL,
  command history, or server logs;
- only three named shell providers can be requested;
- WSL distro must be present in current `wsl.exe --list --quiet` output;
- no `cmd /c`, arbitrary executable path, service account, impersonation, or
  privilege-elevation provider;
- three-session process-wide limit, 20-minute idle timeout, 16 KiB message
  limit, bounded terminal dimensions and a bounded browser output buffer;
- socket disconnect, Close, process SIGINT, and process SIGTERM kill the child
  PTY;
- terminal input and output are streamed but not logged by the companion.

The browser performs a second safety gate before sending locally or
cloud-state-changing command lines. This is a teaching and mistake-reduction
control, not an OS sandbox. Once the learner approves a command, the shell has
the same permissions as that Windows user. Do not run the companion while
viewing untrusted local web content.

## Explicit non-goals

- no public listener or public remote shell;
- no Cloudflare tunnel, port forwarding, reverse proxy to the internet, or
  remote shared session;
- no storage of Azure credentials, shell secrets, private keys, passwords, or
  terminal transcripts;
- no silent Azure login, subscription selection, create/update/delete action,
  or privilege elevation;
- no claim that a hosted Worker can access local PowerShell or WSL;
- no general-purpose Worker terminal backend;
- no fake output when the companion or a required shell is unavailable.

## Incident response / recovery

If an unexpected origin, process, or command is observed: close the browser
tab, press `Ctrl+C` in the companion window, verify no companion process remains,
rotate any credential that was typed into an untrusted context, and review the
real shell/provider audit sources. Restarting the companion creates a new token.

## Future hardening before broad distribution

- signed Windows packaging and publisher verification;
- automatic certificate-backed local HTTPS/WSS setup;
- optional enterprise policy allowlists per lesson;
- Windows Job Object containment and stronger resource accounting;
- independent security review and threat-model exercise.
