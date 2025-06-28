import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SiteHeader() {
  return (
    <header className="flex h-12 shrink-0 items-center border-b border-zinc-200 dark:border-zinc-800 bg-background px-2">
      <div className="flex items-center w-full">
        <SidebarTrigger className="ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-5"
        />
      </div>
    </header>
  );
}
