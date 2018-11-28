# groupme-get-all-messages

Simply grab all of the messages from a specific GroupMe group and output it
as JSON.

## Requirements

- [`node`](https://nodejs.org) version 8 or higher

This comes with [`npm`](https://npmjs.com) and [`npx`](https://www.npmjs.com/package/npx)

## Usage

```bash
npx groupme-get-all-messages
```

This will step you through asking for your developer access token (which you
can get by logging in here: https://dev.groupme.com/ ). And then it will prompt
for which group grab all the messages from.

If you already know your access token and the group ID you can quickly get access
to all the messages via the following:

```bash
npx groupme-get-all-messages <access-token> <group-id>
```

These results in something like the following:

```json
[
  {
    "id": "153037291572045443",
    "created_at": 1530372915,
    "user_id": "123456",
    "name": "John Doe",
    "text": "Hello"
  },
  {
    "id": "153037210843415443",
    "created_at": 1530373108,
    "user_id": "987654",
    "name": "Jane Doe",
    "text": "World!"
  },
  ...
]
```
