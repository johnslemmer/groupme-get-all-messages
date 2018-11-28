// tslint:disable:no-console
import inquirer from 'inquirer';
import path from 'path';
import readPkgUp from 'read-pkg-up';
import { getAllMessages, getGroups, Group } from '../';

const HELP = `Usage: ${path.basename(
  process.argv[1],
)} [-h|--help] [-v|--version] [<GroupMe Access Token> [<Group ID>]]`;

// tslint:disable-next-line:no-expression-statement typedef
(async function main() {
  if (handleHelp()) return;
  if (handleVersion()) return;
  const accessToken = await getAccessToken();
  const groupId = await getGroupId(accessToken);
  console.log(JSON.stringify(await getAllMessages(groupId, accessToken)));
})().catch(error => {
  console.error(error);
  process.exit(1);
});

/**
 * Handles if help was asked for in CLI arguments
 *
 * @returns if help was handled, useful if you want to exit the process.
 */
function handleHelp(): boolean {
  if (!['-h', '--help'].includes(process.argv[2])) {
    return false;
  }
  // tslint:disable-next-line:no-expression-statement
  console.log(HELP);
  return true;
}

/**
 * Handles if version was asked for in CLI arguments
 *
 * @returns if version was handled, useful if you want to exit the process.
 */
function handleVersion(): boolean {
  if (!['-v', '--version'].includes(process.argv[2])) {
    return false;
  }
  console.log(readPkgUp.sync().pkg.version);
  return true;
}

async function getAccessToken(): Promise<string> {
  return (
    process.argv[2] || process.env.GROUPME_ACCESS_TOKEN || inquireAccessToken()
  );
}

async function inquireAccessToken(): Promise<string> {
  const { accessToken } = await inquirer.prompt<{
    readonly accessToken: string;
  }>([
    {
      message: 'Enter your access token for GroupMe:',
      name: 'accessToken',
      type: 'input',
      validate: (answer: string) =>
        answer.length === 40 || 'Should be 40 characters long',
    },
  ]);
  return accessToken;
}

async function getGroupId(accessToken: string): Promise<string> {
  return (
    process.argv[3] || process.env.GROUPME_GROUP_ID || inquireGroup(accessToken)
  );
}

async function inquireGroup(accessToken: string): Promise<string> {
  const groups = await getGroups(accessToken);
  const { group } = await inquirer.prompt<{
    readonly group: Group;
  }>([
    {
      choices: groups.map(({ name, id }) => ({ name, value: { name, id } })),
      message: 'Which group do you want to get all the messages from:',
      name: 'group',
      type: 'list',
    },
  ]);
  console.log(`Selected group '${group.name}' with ID ${group.id}`);
  return group.id;
}
