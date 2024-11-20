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
			type: "text",
			text: "This is a dynamic text node",
			title: "Text Note",
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
	],
	relationships: [
		{ source: 0, target: 1 }, // Node 1 -> Node 2
		{ source: 1, target: 2 }, // Node 2 -> Node 3
		{ source: 0, target: 3 }, // Node 2 -> Node 4
		{ source: 1, target: 4 }, // Node 2 -> Node 4
	],
};
