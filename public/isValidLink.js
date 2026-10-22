// Everything below was generated with AI for security reasons
const PRIVATE_IP_RANGES =
[
	{ pattern: /^127\./ },
	{ pattern: /^10\./ },
	{ pattern: /^192\.168\./ },
	{ pattern: /^172\.(1[6-9]|2\d|3[01])\./ },
	{ pattern: /^169\.254\./ },
	{ pattern: /^0\./ },
	{ pattern: /^::1$/ },
	{ pattern: /^f[cd][0-9a-f]{2}:/i },
	{ pattern: /^fe80:/i },
];

const isLikelyPrivateAddress = (hostname) =>
	hostname === 'localhost' || PRIVATE_IP_RANGES.some(({ pattern }) => pattern.test(hostname));

const isValidLink = (link) =>
{
	if (link.length === 0 || link.length > 2048) return false;

	try
	{
		const url = new URL(link);

		return (url.protocol === 'http:' || url.protocol === 'https:')
			&& !isLikelyPrivateAddress(url.hostname);
	}
	catch { return false; }
};

export default isValidLink;