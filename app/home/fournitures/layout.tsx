import React from "react";

type Props = {
  children: React.ReactNode;
};

/** Conteneur large cohérent avec la zone fournitures (navbar / footer dans `app/home/layout.tsx`). */
export default function HomeFournituresLayout({ children }: Props) {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">{children}</div>
  );
}
