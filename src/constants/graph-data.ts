// data.js (or data.json)
export const graphData = {
	contents: [
		{
			type: "video",
			url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
			title: "Featured Video",
		},
		{
			type: "webpage",
			url: "https://nextjs.org/",
			title: "Next.js Documentation",
		},
		{
			type: "webpage",
			url: "https://nextjs.org/",
			title: "Next.js Documentation",
		},
		{
			type: "text",
			text: "This is a dynamic text node",
			title: "Text Note",
		},
		{
			type: "text",
			text: "This is a dynamic text node",
			title: "Text Note",
		},
		{
			type: "text",
			text: "This is a dynamic text node",
			title: "Text Note",
		},
		{
			type: "text",
			text: "This is a dynamic text node",
			title: "Text Note",
		},
	],
	relationships: [
		{ source: 0, target: 1 },
		{ source: 0, target: 2 },
		{ source: 1, target: 3 },
		{ source: 1, target: 4 },
		{ source: 2, target: 5 },
		{ source: 2, target: 6 },
	],
};
