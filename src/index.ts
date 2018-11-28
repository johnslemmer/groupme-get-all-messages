import got from 'got';

export interface Group {
  readonly id: string;
  readonly name: string;
}

export interface Message {
  readonly id: string;
  readonly created_at: number;
  readonly user_id: string;
  readonly name: string;
  readonly text: string;
}

export async function getGroups(
  accessToken: string,
): Promise<ReadonlyArray<Group>> {
  const response = await got(
    `https://api.groupme.com/v3/groups?token=${accessToken}&omit=memberships&per_page=100`,
    { json: true },
  );
  return response.body.response.map(({ id, name }: Group) => ({
    id,
    name,
  }));
}

export async function getAllMessages(
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
    // tslint:disable-next-line:no-expression-statement
    allMessages = allMessages.concat(messages);
  }
  return filterValues(allMessages).reverse();
}

// tslint:disable-next-line:readonly-array
function filterValues(messages: ReadonlyArray<Message>): Message[] {
  return messages.map(({ id, name, user_id, text, created_at }: Message) => ({
    id,
    // tslint:disable-next-line:object-literal-sort-keys
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
): Promise<{
  readonly count: number;
  readonly messages: ReadonlyArray<Message>;
}> {
  const response = await got(
    `https://api.groupme.com/v3/groups/${groupId}/messages?token=${accessToken}${
      limit ? `&limit=${limit}` : ''
    }${beforeId ? `&before_id=${beforeId}` : ''}`,
    { json: true },
  );
  return response.body.response;
}
