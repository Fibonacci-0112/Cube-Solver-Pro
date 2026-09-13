/**
 * Writes the Partner Center appx identity to a config file that extends
 * electron-builder.yml, rather than passing it as `-c.appx.x=y` flags on the
 * command line: PowerShell's quoting when it invokes the npx.cmd shim mangles
 * a flag value containing a space, which PUBLISHER_DISPLAY_NAME normally has.
 */
import { writeFileSync } from 'node:fs';

const required = ['APPX_IDENTITY_NAME', 'APPX_PUBLISHER', 'APPX_PUBLISHER_DISPLAY_NAME'];
for (const name of required) {
  if (!process.env[name]) throw new Error(`Missing environment variable: ${name}`);
}

writeFileSync(
  'appx.config.json',
  JSON.stringify({
    extends: 'electron-builder.yml',
    appx: {
      identityName: process.env.APPX_IDENTITY_NAME,
      publisher: process.env.APPX_PUBLISHER,
      publisherDisplayName: process.env.APPX_PUBLISHER_DISPLAY_NAME,
    },
  }),
);
