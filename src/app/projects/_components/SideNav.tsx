"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Hamburger } from "~/app/_utils/Icons";

export function SideNav({ projectId }: { projectId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") || "board";

  const navigateTo = (view: string) => {
    router.push(`/projects/${projectId}?view=${view}`);
  };

  return (
    <div
      className={`transition-all duration-300 ease-in-out ${
        isOpen ? "w-32" : "w-6"
      }`}
    >
      <button
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className="hover:cursor-pointer"
      >
        <Hamburger size="8" />
      </button>
      <ul
        className={`mt-6 ${isOpen ? "opacity-100" : "hidden opacity-0"} transition-opacity duration-300 ease-in-out`}
      >
        <li className="whitespace-nowrap">
          <button
            className="hover:cursor-pointer hover:text-blue-500"
            onClick={() => navigateTo("board")}
          >
            Project Board
          </button>
        </li>
        <li>
          <button className="hover:cursor-pointer hover:text-blue-500">
            Reports
          </button>
        </li>
        <li>
          <button
            className="hover:cursor-pointer hover:text-blue-500"
            onClick={() => navigateTo("settings")}
          >
            Settings
          </button>
        </li>
        <li className="whitespace-nowrap">
          <Link href={"/"}>Return home</Link>
        </li>
      </ul>
    </div>
  );
}
