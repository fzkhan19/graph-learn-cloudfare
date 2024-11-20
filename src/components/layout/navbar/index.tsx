"use client";
import { Home, Menu } from "lucide-react";
import Link from "next/link";
import React, { Suspense, useMemo } from "react";

import { cn } from "@/lib/utils";

import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";
import {
	Sheet,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "../../ui/sheet";

import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Image from "next/image";
import { ToggleTheme as ToggleThemeComponent } from "../toggle-theme";

const MemoizedRouteList = React.lazy(() =>
	import("./MemoizedRouteList").then((module) => ({
		default: module.MemoizedRouteList,
	})),
);

interface RouteProps {
	href: string;
	label: string;
}

const CustomNavigationMenu = React.memo(() => {
	const routeList: RouteProps[] = useMemo(
		() => [
			{
				href: "#about",
				label: "About",
			},
			{
				href: "#projects",
				label: "Projects",
			},
			{
				href: "#contact",
				label: "Contact",
			},
			{
				href: "/blog",
				label: "Blog",
			},
		],
		[],
	);

	return (
		<NavigationMenu className="mx-auto hidden">
			<NavigationMenuList>
				<NavigationMenuItem>
					<Suspense fallback={<div>Loading...</div>}>
						<MemoizedRouteList routeList={routeList} />
					</Suspense>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
});

const MemoizedSheetContent = React.memo(SheetContent);
const MemoizedSheetFooter = React.memo(SheetFooter);
const ToggleTheme = React.memo(ToggleThemeComponent);

export const Navbar = () => {
	const [isOpen, setIsOpen] = React.useState(false);

	const routeList: RouteProps[] = useMemo(
		() => [
			{
				href: "#about",
				label: "About",
			},
			{
				href: "#projects",
				label: "Projects",
			},
			{
				href: "#contact",
				label: "Contact",
			},
			{
				href: "/blog",
				label: "Blog",
			},
		],
		[],
	);

	return (
		<header
			className={cn("absolute z-40 flex w-fit items-center gap-4 p-4 py-3")}
		>
			{/* <!-- Mobile --> */}
			<div className="flex items-center">
				<Sheet open={isOpen} onOpenChange={setIsOpen}>
					<SheetTrigger asChild>
						<Menu
							className="cursor-pointer"
							onClick={() => setIsOpen(!isOpen)}
						/>
					</SheetTrigger>
					<MemoizedSheetContent
						className="flex flex-col justify-between rounded-tr-2xl rounded-br-2xl border-secondary bg-card"
						side="left"
					>
						<div>
							<SheetHeader className="mb-4 ml-4">
								<SheetTitle className="flex items-center">
									<Link
										className="flex items-center gap-4 px-2 font-extrabold text-xl"
										href="/"
									>
										<Image
											alt="logo"
											width={500}
											height={500}
											src="/grape.png"
											className="h-10 w-8"
										/>
										Graph Learn
									</Link>
								</SheetTitle>
							</SheetHeader>

							<div className="flex flex-col gap-2">
								{routeList.map(({ href, label }) => (
									<Button
										key={href}
										asChild
										className="justify-start text-base"
										variant="ghost"
										onClick={() => setIsOpen(false)}
									>
										<Link href={href}>{label}</Link>
									</Button>
								))}
							</div>
						</div>

						<MemoizedSheetFooter className="w-full flex-col items-start justify-start sm:flex-col">
							<Separator className="mb-2" />
							<div className="flex w-full items-center justify-between">
								<ToggleTheme />
								<Link className="mx-3" href={"/"}>
									<Button
										className="w-full justify-start"
										size="sm"
										variant="ghost"
									>
										<Home className="size-5" />
									</Button>
								</Link>
							</div>
						</MemoizedSheetFooter>
					</MemoizedSheetContent>
				</Sheet>
			</div>

			<Link
				className="flex items-center gap-4 px-2 font-extrabold text-xl"
				href="/"
			>
				<Image
					alt="logo"
					width={500}
					height={500}
					src="/grape.png"
					className="h-10 w-8"
				/>
				Graph Learn
			</Link>

			{/* <!-- Desktop --> */}
			<CustomNavigationMenu />

			<div className="hidden items-center lg:hidden">
				<Link className="mx-3" href={"/"}>
					<Button className="w-full justify-start" size="sm" variant="ghost">
						<Home className="size-5" />
					</Button>
				</Link>
				<ToggleTheme />
			</div>
		</header>
	);
};
