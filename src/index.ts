import 'dotenv/config';
import express from 'express';
import db from './db.js';
import isValidLink from './misc/isValidLink.ts';

const ENABLE_LOGGING = process.env.ENABLE_LOGGING === 'true';
const FULL_HOST = process.env.FULL_HOST ?? 'http://localhost:4214';

const shutdown = () =>
{
	database.database.close();
	process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

const app = express();
const database = db();

app.use(express.static('public'));

app.post('/new/:link', async (req, res) =>
{
	const link = req.params.link;

	if (!isValidLink(link))
	{
		res.status(400).send({ error: 'The link must be a valid URL, must begin with "http(s)://" and must not be a private address or the same as this tool\'s hostname.' });
		return;
	}

	const linkId = await generateUniqueLinkId();
	database.run(`INSERT INTO ${process.env.DB_TABLE_NAME} (id, url) VALUES (?, ?)`, [linkId, link]);

	if (ENABLE_LOGGING) console.log(`Created a new link ${linkId} for link ${link}`);

	res.send({ shortUrl: `${FULL_HOST}/${linkId}` });
});

app.get('/:id', async (req, res) =>
{
	const linkId = req.params.id;

	if (!isValidLinkId(linkId))
	{
		res.status(400).send({ error: 'Invalid link ID' });
		return;
	}

	const rows = database.query(`SELECT url FROM ${process.env.DB_TABLE_NAME} WHERE id = ?`, [linkId]);
	const link = rows[0];

	if (link === undefined || link === null || typeof link.url !== 'string')
	{
		res.status(404).send({ error: 'Link not found' });
		return;
	}

	if (ENABLE_LOGGING) console.log(`Retrieved ${link.url} for link ID ${linkId}`);

	res.redirect(301, link.url);
});

const port = process.env.PORT ?? 4214;
app.listen(port, () => console.log(`Server listening on ${port}`));

database.queryWithoutParams(`
	CREATE TABLE IF NOT EXISTS ${process.env.DB_TABLE_NAME} (
		id TEXT PRIMARY KEY,
		url TEXT,
		CONSTRAINT id_length CHECK (length(id) = ${parseInt(process.env.LINK_ID_LENGTH ?? "8")}),
		CONSTRAINT url_length CHECK (length(url) > 0 AND length(url) <= 2048)
	);
`);

const isValidLinkId = (id: string): boolean =>
{
	const validLinkIdChars = /^[A-Za-z0-9]+$/;
	return id.length === parseInt(process.env.LINK_ID_LENGTH ?? "8") && validLinkIdChars.test(id);
}

const generateUniqueLinkId = async () =>
{
	const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	const linkIdLength = parseInt(process.env.LINK_ID_LENGTH ?? "8");
	let linkId = '';

	do
	{
		linkId = '';

		for (let i = 0; i < linkIdLength; i++)
			linkId += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	while (await doesLinkIdExist(linkId));

	return linkId;
};

const doesLinkIdExist = async (linkId: string) =>
	database.query(`SELECT id FROM ${process.env.DB_TABLE_NAME} WHERE id = ?`, [linkId]).length > 0;