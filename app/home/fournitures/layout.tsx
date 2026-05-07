import React from "react";

type Props = {
  children: React.ReactNode;
};

export default function HomeFournituresLayout({ children }: Props) {
  return (
    <div className="mx-auto w-full min-w-full py-4 text-foreground">
      {children}
    </div>
  );
}
