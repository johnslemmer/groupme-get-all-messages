/**
 * Tests in this file actually run the CLI and attempt to validate its behavior.
 */

// tslint:disable:no-expression-statement
import test from 'ava';
import execa from 'execa';
import readPkgUp from 'read-pkg-up';

test('returns help/usage', async t => {
  const { stdout } = await execa(`./bin/groupme-get-all-messages`, ['--help']);
  t.regex(stdout, /Usage/);
});

test('returns version', async t => {
  const { stdout } = await execa(`./bin/groupme-get-all-messages`, [
    '--version',
  ]);
  t.truthy(stdout.trim() === readPkgUp.sync().pkg.version);
});

test('errors appropriately', async t => {
  await t.throwsAsync(
    execa(`./bin/groupme-get-all-messages`, ['badAccessToken']),
  );
});

// TODO(JS) more tests
