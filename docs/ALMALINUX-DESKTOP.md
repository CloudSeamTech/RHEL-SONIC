# Day-to-Day Operations with AlmaLinux Desktop Experience

Twelve standalone guided classes at `/alma`, using AlmaLinux 9 x86_64 with GNOME and VMware Workstation Pro for initial practice. The Anaconda DVD profile is **Server with GUI**; a new blank VM protects the current daily OS. Physical installation is a later, hardware-specific decision after backup and compatibility checks.

The route covers planning, installation, first-login settings, terminal/files/permissions, DNF and user Flatpak apps, Steam/Proton, network/printers/peripherals, Western Digital data drives, independent backups, troubleshooting, and real-terminal setup. Each class has one-sentence purpose, named execution context, ordered actions, expected observations, troubleshooting, evidence and rollback. Existing Windows/RHEL routes stay intact. Class verification uses the separate `sonic-alma-desktop-v1` store; it is self-reported, never infrastructure telemetry.

Four new illustrated screen sheets cover GNOME installation, apps/games, WD drive identification, and command skills. Planning uses the shared worksheet. All are labeled illustrations; written instructions are authoritative. Examples are not live captures or execution evidence.

Storage starts with identifying the model, serial, size, filesystem and mount point. Existing volumes use the non-format route. Formatting is GUI-only and restricted to a separately identified empty disposable practice disk; there are no generic copyable mkfs, wipefs, partition-deletion, root-resize or LVM-growth commands. Mounting a data disk does not expand `/`. NTFS/Fast Startup, removable-drive ejection, UUID mounts, optional `nofail`, and Flatpak Steam path permissions are explained.

The terminal setup section in Lab Terminal explains local SONIC + the existing token-authenticated Windows companion. Hosted mode remains copy/help. GNOME Terminal runs in AlmaLinux; WSL is not VMware. Verified OpenSSH connects from Windows to the guest. The SONIC output pane is a basic text panel, not a full terminal emulator. No remote shell or public tunnel is provisioned.

Package availability, GPU support and Steam/anti-cheat compatibility depend on actual releases and hardware. The authored workflows have not been run on the user's AlmaLinux installation or WD hardware. Sources are linked inside every class. Application tests and builds do not establish game/hardware success.
