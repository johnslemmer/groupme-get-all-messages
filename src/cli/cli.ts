// tslint:disable:no-console
import got from 'got';

// tslint:disable-next-line:no-expression-statement typedef
(async function main() {
  const response = await got(
    `https://api.groupme.com/v3/groups?token=${
      process.env.GROUPME_ACCESS_TOKEN
    }`,
    { json: true },
  );
  console.log(response.body.response);
})();
