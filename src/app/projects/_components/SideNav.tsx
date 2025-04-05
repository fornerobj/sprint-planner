"use client";

import { useState } from "react";

export function SideNav() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <ul className="">
      <li>
        <a>Project Board</a>
      </li>
      <li>
        <a>Metrics</a>
      </li>
      <li>
        <a>Settings</a>
      </li>
    </ul>
  );
}
