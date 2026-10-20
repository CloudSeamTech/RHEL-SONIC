# Pictures at every instructional step

All 803 audited instructions across 97 classes now have individual illustrated step maps; all 72 AlmaLinux instructions are included. Existing illustrated class screen references also appear directly at each step, rather than only in a class-level accordion. Related steps explicitly reuse their class screen reference. Existing vendor reference screenshots remain separately labeled.

Maps are generated from the actual instructions and show context, a numbered action route, command examples where present, and the expected observation. They do not depict exact product UI, prove execution, or count as authentic target-lab screenshots. There are no invented successful outputs. Complete, selectable instructions and command blocks remain below the pictures.

The shared guided reader adds smaller numbered actions, a simple glossary, a mobile step picker, clearer copy labels, expected-result checks, and expandable evidence notes. Selecting a step moves focus to its panel. The picture dialog supports panning at readable resolution on a phone. Existing lesson IDs, commands and saved verification semantics are preserved.

Validation: all app and companion tests, TypeScript, focused lint on new/shared picture components, and production build pass. The asset test checks all 803 instruction hashes, unique assets, file hashes and illustration labeling. All SVGs were parsed as XML. Browser checks loaded each of the 72 AlmaLinux picture contexts, tested dialog/panning and navigation at 390px, and verified Windows and RHEL step rendering. Actual browser screenshots and the JSON report are adjacent.

These checks validate website behavior and visual availability. They do not establish successful execution on Windows, VMware, AlmaLinux, Azure or the user's drives.
