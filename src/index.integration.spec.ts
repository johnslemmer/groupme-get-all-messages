/**
 * Tests in this file actually run the CLI and attempt to validate its behavior.
 */

// tslint:disable:no-expression-statement
import test from 'ava';
import execa from 'execa';

test('returns help/usage', async t => {
  const { stdout } = await execa(`./bin/groupme-get-all-messages`, ['--help']);
  t.regex(stdout, /Usage/);
});

// TODO(JS) more tests
