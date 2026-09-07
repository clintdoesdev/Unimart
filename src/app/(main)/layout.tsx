import { TopBar } from "@/components/nav/TopBar";
import { BottomTabBar } from "@/components/nav/BottomTabBar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="flex flex-1 flex-col pb-16 lg:pb-0">{children}</main>
      <BottomTabBar />
    </div>
  );
}
