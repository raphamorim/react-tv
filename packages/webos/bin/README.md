# webOS SDK Command-Lines

This folder contains the executable wrappers for every webOS SDK command-lines:

* `ares-generate`
* `ares-package`
* `ares-install`
* `ares-launch`

These wrappers are **not** intended to be used as-is from the development source tree:  they are
expected to be incorporated into a platform-specific package & installed on a target machine first.

Each command-line `ares-DO` exists in 4 flavors:

* `ares-DO.js` is the Node.js script implementing the command (used on every targets)
* `ares-DO.cmd` is the Windows NT command-script (not a Windows 9x BAT script) wrapper (used on Windows)
* `ares-DO` is the Cygwin wrapper shell script wrapper (used on Windows using Cygwin)
* `ares-DO.sh` is the UNIX Bash shell script wrapper (used on OSX & Linux)

The right set of commands is automatically selected by the Jenkins packaging script.  When installing from
source using NPM, no wrapper is necessary in addition to the Node.js script:  NPM automaticallt generates
the proper wrapper scripts using the `package.json` content.
