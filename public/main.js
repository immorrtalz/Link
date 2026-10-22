import isValidLink from './isValidLink.js';

const shortenButton = document.getElementById('shortenButton');
const linkInput = document.getElementById('linkInput');
const shortUrlContainer = document.querySelector('.shortUrlContainer');
const shortUrlMessage = document.getElementById('shortUrlMessage');
const shortUrlLink = document.getElementById('shortUrlLink');

const COOLDOWN_MS = 1000;
let cooldown = null;

shortenButton.addEventListener('click', async () =>
{
	if (cooldown !== null)
	{
		shortUrlMessage.textContent = 'Not so fast! Please wait a moment before shortening another link.';
		shortUrlLink.style.display = 'none';
		return;
	}

	shortUrlContainer.style.display = 'flex';
	const link = linkInput.value;

	if (!isValidLink(link))
	{
		shortUrlMessage.textContent = 'The link must be a valid URL, must begin with "http(s)://" and must not be a private address or the same as this tool\'s hostname.';
		shortUrlLink.style.display = 'none';
		return;
	}

	clearTimeout(cooldown);

	try
	{
		cooldown = setTimeout(() => cooldown = null, COOLDOWN_MS);

		const response = await fetch(`/new/${encodeURIComponent(link)}`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' }
		});

		const responseStatus = response.status;

		if (responseStatus !== 200)
		{
			const errorJson = await response.json();
			shortUrlMessage.textContent = errorJson.error ?? 'An unknown error occurred';
			shortUrlLink.style.display = 'none';
			return;
		}

		const responseJson = await response.json();

		shortUrlMessage.textContent = "Click to copy:";
		shortUrlLink.href = responseJson.shortUrl;
		shortUrlLink.textContent = responseJson.shortUrl;
		shortUrlLink.style.display = 'block';
	}
	catch (error)
	{
		shortUrlMessage.textContent = error.message ?? 'An unknown error occurred';
		shortUrlLink.style.display = 'none';
	}
});

shortUrlLink.addEventListener('click', e =>
{
	e.preventDefault();
	const url = shortUrlLink.href;
	navigator.clipboard.writeText(url);
});