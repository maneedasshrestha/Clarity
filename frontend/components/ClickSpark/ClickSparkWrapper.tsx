"use client";
import { useTheme } from "next-themes";
import ClickSpark from "./ClickSpark";
import { ReactNode } from "react";

export default function ClickSparkThemeWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const { theme } = useTheme();
  const sparkColor = theme === "dark" ? "#fff" : "#000";
  return <ClickSpark sparkColor={sparkColor}>{children}</ClickSpark>;
}
