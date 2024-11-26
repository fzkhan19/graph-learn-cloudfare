"use client";

import {
	type ColorMode,
	Controls,
	type Edge,
	Position,
	ReactFlow,
	useEdgesState,
	useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

// Import the data from the constant
import { graphData } from "@/constants/graph-data"; // Adjust path accordingly
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import FlickeringGrid from "./ui/flickering-grid";

type NodeType = "video" | "webpage" | "text";

interface NodeContent {
	id: number;
	type: NodeType;
	url?: string;
	text?: string;
	title: string;
	parentId: number | null;
}

interface Relationship {
	source: number; // Index of the source node
	target: number; // Index of the target node
}

const getNodeDimensions = (type: NodeType) => {
	switch (type) {
		case "video":
			return { width: 800, height: 500 };
		case "webpage":
			return { width: 900, height: 1000 };
		case "text":
			return { width: 500, height: 300 };
		default:
			return { width: 300, height: 200 };
	}
};

// Generate node positions based on relationships and dimensions
const generatePositions = (
	contents: NodeContent[],
	relationships: Relationship[],
	startPosition = { x: 100, y: 100 },
	padding = 100,
	horizontalSpacing = 300,
) => {
	const positions: { x: number; y: number }[] = [];
	const placedNodes = new Set<number>();
	const childrenMap = new Map<number, number[]>();
	const subtreeWidths = new Map<number, number>(); // Track subtree widths for bottom-up calculation

	// Build a map of parent -> children relationships
	for (const { source, target } of relationships) {
		if (!childrenMap.has(source)) {
			childrenMap.set(source, []);
		}
		childrenMap.get(source)?.push(target);
	}

	// Recursive function to calculate subtree width
	const calculateSubtreeWidth = (nodeIndex: number): number => {
		const children = childrenMap.get(nodeIndex) || [];
		if (children.length === 0) {
			const nodeDimensions = getNodeDimensions(contents[nodeIndex].type);
			return nodeDimensions.width;
		}

		let totalWidth = children.reduce(
			(total, childIndex) =>
				total + calculateSubtreeWidth(childIndex) + horizontalSpacing,
			-horizontalSpacing, // Subtract last spacing
		);

		// Check if any child is of type "webpage" and apply extra width
		const hasWebpageChild = children.some(
			(childIndex) => contents[childIndex].type === "webpage",
		);
		if (hasWebpageChild) {
			totalWidth += horizontalSpacing; // Add extra spacing if a child is a webpage
		}

		subtreeWidths.set(nodeIndex, totalWidth);
		return totalWidth;
	};

	// Start by calculating all subtree widths
	contents.forEach((_, index) => {
		if (!subtreeWidths.has(index)) {
			calculateSubtreeWidth(index);
		}
	});

	// Place the first node at the starting position
	positions[0] = startPosition;
	placedNodes.add(0);

	// Recursive function to place nodes based on calculated subtree widths
	const placeChildren = (sourceIndex: number) => {
		const children = childrenMap.get(sourceIndex) || [];
		if (children.length === 0) return;

		const sourcePosition = positions[sourceIndex];
		const sourceDimensions = getNodeDimensions(contents[sourceIndex].type);

		// Calculate total subtree width for children
		const childrenTotalWidth = subtreeWidths.get(sourceIndex) || 0;

		// Start x position for the first child
		let currentX =
			sourcePosition.x + (sourceDimensions.width - childrenTotalWidth) / 2;

		for (const childIndex of children) {
			if (placedNodes.has(childIndex)) continue;

			const childDimensions = getNodeDimensions(contents[childIndex].type);

			positions[childIndex] = {
				x: currentX,
				y: sourcePosition.y + sourceDimensions.height + padding,
			};

			currentX +=
				subtreeWidths.get(childIndex) ||
				childDimensions.width + horizontalSpacing - 50;
			placedNodes.add(childIndex);

			// Recursively place this child's children
			placeChildren(childIndex);
		}

		// Center the parent node relative to its children
		if (children.length > 0) {
			const firstChildIndex = children[0];
			const lastChildIndex = children[children.length - 1];
			const firstChildPos = positions[firstChildIndex];
			const lastChildPos = positions[lastChildIndex];
			const parentCenterX =
				(firstChildPos.x +
					getNodeDimensions(contents[firstChildIndex].type).width / 2 +
					lastChildPos.x +
					getNodeDimensions(contents[lastChildIndex].type).width / 2) /
				2;

			positions[sourceIndex].x = parentCenterX - sourceDimensions.width / 2;
		}
	};

	// Begin placement from root
	placeChildren(0);

	return positions;
};

// Generate nodes with dimensions and position
const generateNodes = (
	nodes: NodeContent[],
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	_theme?: any,
	startPosition = { x: 100, y: 100 },
) => {
	// Create relationships array from parentId
	const relationships = nodes
		.filter((node) => node.parentId)
		.map((node) => ({
			source: nodes.findIndex((n) => n.id === node.parentId),
			target: nodes.findIndex((n) => n.id === node.id),
		}));

	const positions = generatePositions(nodes, relationships, startPosition);

	const titleXmargin =
		nodes[0].type === "text" ? 250 : nodes[0].type === "video" ? 100 : 50;
	// Create title node
	const titleNode = {
		id: "title",
		position: {
			x: positions[0].x - titleXmargin, // Adjust x position relative to first node
			y: positions[0].y - 200, // Place it above the first node
		},
		data: {
			label: (
				<div className="flex h-full w-full items-center justify-center">
					<h1 className="font-extrabold font-os text-7xl dark:text-white">
						{graphData.title}
					</h1>
				</div>
			),
		},
		style: {
			width: 1000,
			height: 100,
			padding: "8px",
			background: "transparent",
			border: "none",
			pointerEvents: "none",
			boxShadow: "none",
		},
	};

	const regularNodes = nodes.map((node, index) => {
		const dimensions = getNodeDimensions(node.type);
		return {
			id: node.id,
			position: positions[index],
			sourcePosition: Position.Bottom,
			targetPosition: Position.Top,
			data: {
				label: (
					<div className="relative h-full w-full">
						{(node.type === "webpage" || node.type === "video") && node.url && (
							<Link
								href={node.url}
								target="_blank"
								rel="noopener noreferrer"
								className="-top-10 absolute right-0 flex items-center gap-2 text-gray-600 text-lg hover:text-blue-500"
							>
								Open {node.title} <ExternalLink size={18} />
							</Link>
						)}
						{renderContent(node)}
					</div>
				),
			},
			style: {
				width: dimensions.width,
				height: dimensions.height,
				padding: "8px",
				borderWidth: "1px",
				borderRadius: "16px",
				backgroundColor: "transparent",
				boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
			},
		};
	});

	return [titleNode, ...regularNodes];
};

// Render the content of the nodes based on their type
const renderContent = (content: NodeContent) => {
	switch (content.type) {
		case "video":
			return (
				<iframe
					className="h-full w-full rounded-lg"
					src={content.url}
					title={content.title}
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
					allowFullScreen
				/>
			);
		case "webpage":
			return (
				<iframe
					className="h-full w-full rounded-lg"
					src={content.url}
					title={content.title}
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
				/>
			);
		case "text":
			return (
				<div
					className={cn(
						"flex h-full w-full items-center justify-center",
						"text-balance p-4 font-medium font-os text-3xl",
						"bg-white dark:bg-black dark:text-white",
					)}
				>
					{content.text}
				</div>
			);
	}
};

// Calculate the translateExtent based on the positions of the nodes and the last node's position
const calculateTranslateExtent = (
	positions: { x: number; y: number }[],
	contents: NodeContent[],
): [[number, number], [number, number]] => {
	const startX = Math.min(...positions.map((pos) => pos.x));
	const startY = Math.min(...positions.map((pos) => pos.y));
	const endX = Math.max(
		...positions.map(
			(pos, index) => pos.x + getNodeDimensions(contents[index].type).width,
		),
	);
	const endY = Math.max(
		...positions.map(
			(pos, index) => pos.y + getNodeDimensions(contents[index].type).height,
		),
	);

	// Adjust translate extent to fit all nodes without infinite panning
	return [
		[startX - 500, startY - 500], // Padding to prevent edge cutoff
		[endX + 500, endY + 200], // Padding to prevent edge cutoff
	];
};

export default function GraphComponent() {
	const { nodes } = graphData;
	const { theme } = useTheme();

	// Generate edges from parentId relationships
	const initialEdges: Edge[] = nodes
		.filter((node) => node.parentId !== null)
		.map((node) => ({
			id: `e${node.parentId}-${node.id}`,
			source: node.parentId.toString(),
			target: node.id.toString(),
			type: "smoothstep",
			animated: true,
		}));

	const [graphNodes] = useNodesState(
		generateNodes(
			nodes.map((node) => ({
				...node,
				id: Number(node.id),
				parentId: node.parentId !== null ? Number(node.parentId) : null,
				type: node.type as NodeType,
				title: node.title || "",
				url: node.url || "",
				text: node.text || "",
			})) as NodeContent[],
			theme,
		).map((node) => ({
			...node,
			id: node.id.toString(),
			style: {
				...node.style,
				pointerEvents: (node.style as React.CSSProperties).pointerEvents,
			},
		})),
	);
	const [edges] = useEdgesState(initialEdges);

	const positions = generatePositions(
		nodes.map((node) => ({
			...node,
			id: Number(node.id),
			parentId: node.parentId !== null ? Number(node.parentId) : null,
			type: node.type as NodeType,
			title: node.title || "",
			url: node.url || "",
			text: node.text || "",
		})),
		nodes
			.filter((node) => node.parentId)
			.map((node) => ({
				source: nodes.findIndex((n) => n.id === node.parentId?.toString()),
				target: nodes.findIndex((n) => n.id === node.id),
			})),
	);

	const translateExtent = calculateTranslateExtent(
		positions,
		nodes.map((node) => ({
			...node,
			id: Number.parseInt(node.id.toString()),
			parentId:
				node.parentId !== null
					? Number.parseInt(node.parentId.toString())
					: null,
			type: node.type as NodeType,
		})) as NodeContent[],
	);

	return (
		<div className="h-full w-full">
			<ReactFlow
				nodes={graphNodes}
				edges={edges}
				fitView
				zoomOnScroll={false}
				panOnDrag={true}
				panOnScroll={true}
				minZoom={0.1}
				zoomOnDoubleClick={false}
				zoomOnPinch={true}
				nodesDraggable={false}
				nodesFocusable={false}
				edgesFocusable={false}
				translateExtent={translateExtent}
				colorMode={theme as ColorMode}
			>
				<FlickeringGrid
					color={theme === "dark" ? "rgb(245, 231, 254)" : "rgb(53, 4, 110)"}
					flickerChance={0.1}
					squareSize={10}
					maxOpacity={0.03}
				/>
				<Controls />
			</ReactFlow>
		</div>
	);
}
