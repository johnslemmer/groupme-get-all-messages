// tslint:disable:no-console
import path from 'path';
import got from 'got';
import inquirer from 'inquirer';
import readPkgUp from 'read-pkg-up';

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
  printHelp();
  return true;
}

function printHelp() {
  console.log(
    `Usage: ${path.basename(
      process.argv[1],
    )} [-h|--help] [-v|--version] [<GroupMe Access Token> [<Group ID>]]`,
  );
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

async function getGroups(accessToken: string): Promise<ReadonlyArray<Group>> {
  const response = await got(
    `https://api.groupme.com/v3/groups?token=${accessToken}&omit=memberships&per_page=100`,
    { json: true },
  );
  return response.body.response.map(({ id, name }: Group) => ({
    id,
    name,
  }));
}

async function getAllMessages(
  groupId: string,
  accessToken: string,
): Promise<ReadonlyArray<Message>> {
  const { count, messages: latestMessages } = await getMessagesRaw(
    groupId,
    accessToken,
    100,
  );
  if (count <= 100) return filterValues(latestMessages);
  const pages = Math.ceil((count - 100) / 100);

  let allMessages = latestMessages;
  for (let i = 0; i < pages; i++) {
    const { messages } = await getMessagesRaw(
      groupId,
      accessToken,
      100,
      allMessages[allMessages.length - 1].id,
    );
    allMessages = allMessages.concat(messages);
  }
  return filterValues(allMessages).reverse();
}

function filterValues(messages: Message[]): Message[] {
  return messages.map(({ id, name, user_id, text, created_at }: Message) => ({
    id,
    created_at,
    user_id,
    name,
    text,
  }));
}

async function getMessagesRaw(
  groupId: string,
  accessToken: string,
  limit?: number,
  beforeId?: string,
): Promise<{ count: number; messages: Message[] }> {
  const response = await got(
    `https://api.groupme.com/v3/groups/${groupId}/messages?token=${accessToken}${
      limit ? `&limit=${limit}` : ''
    }${beforeId ? `&before_id=${beforeId}` : ''}`,
    { json: true },
  );
  return response.body.response;
}

interface Group {
  readonly id: string;
  readonly name: string;
}

interface Message {
  readonly id: string;
  readonly created_at: number;
  readonly user_id: string;
  readonly name: string;
  readonly text: string;
}
