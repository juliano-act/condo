import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Acesso | CondoConnect",
};

export default function Layout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="w-full auth-wrapper">
        {children}
        </div>
    );
}
