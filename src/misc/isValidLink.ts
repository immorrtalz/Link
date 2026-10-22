const SELF_HOSTNAME = process.env.SELF_HOSTNAME ?? 'localhost:4214';

// Everything below was generated with AI for security reasons
const PRIVATE_IP_RANGES: { pattern: RegExp; version: 4 | 6 }[] =
[
	{ pattern: /^127\./, version: 4 },								// loopback
	{ pattern: /^10\./, version: 4 },								// private
	{ pattern: /^192\.168\./, version: 4 },						// private
	{ pattern: /^172\.(1[6-9]|2\d|3[01])\./, version: 4 },	// private
	{ pattern: /^169\.254\./, version: 4 },						// link-local
	{ pattern: /^0\./, version: 4 },									// "this" network
	{ pattern: /^::1$/, version: 6 },								// loopback
	{ pattern: /^f[cd][0-9a-f]{2}:/i, version: 6 },				// unique local
	{ pattern: /^fe80:/i, version: 6 },								// link-local
];

const isPrivateAddress = (hostname: string): boolean =>
	hostname === 'localhost' || PRIVATE_IP_RANGES.some(({ pattern }) => pattern.test(hostname));

const isValidLink = (link: string): boolean =>
{
	if (link.length === 0 || link.length > 2048) return false;

	try
	{
		const url = new URL(link);

		return (url.protocol === 'http:' || url.protocol === 'https:')
			&& !isPrivateAddress(url.hostname)
			&& url.host.toLowerCase() !== SELF_HOSTNAME;
	}
	catch { return false; }
};

export default isValidLink;