"use client";

import { useState } from "react";
import { Hamburger } from "~/app/_utils/Icons";

export function SideNav() {
  const [isOpen, setIsOpen] = useState(false);

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
          <a className="hover:cursor-pointer hover:text-blue-500">
            Project Board
          </a>
        </li>
        <li>
          <a className="hover:cursor-pointer hover:text-blue-500">Reports</a>
        </li>
        <li>
          <a className="hover:cursor-pointer hover:text-blue-500">Settings</a>
        </li>
      </ul>
    </div>
  );
}
