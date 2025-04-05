"use client";

import { useState } from "react";
import { Hamburger } from "~/app/_utils/Icons";

export function SideNav() {
  const [isOpen, setIsOpen] = useState(true);

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
        <Hamburger />
      </button>
      <ul
        className={`mt-6 ${isOpen ? "opacity-100" : "hidden opacity-0"} transition-opacity duration-300 ease-in-out`}
      >
        <li className="whitespace-nowrap">
          <a>Project Board</a>
        </li>
        <li>
          <a>Reports</a>
        </li>
        <li>
          <a>Settings</a>
        </li>
      </ul>
    </div>
  );
}
