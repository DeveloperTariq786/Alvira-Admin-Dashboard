import React from "react";
import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface DashboardHeaderProps {
  notificationCount?: number;
  onNotificationIconClick?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ notificationCount = 0, onNotificationIconClick }) => {
  return (
    <header className="bg-white border-b border-border shadow-md px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="lg:hidden" />
        <div className="relative max-w-md hidden md:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full pl-10 md:w-[300px] lg:w-[400px] bg-background/90"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          onClick={onNotificationIconClick}
        >
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
              {notificationCount}
            </span>
          )}
        </Button>
        
      </div>
    </header>
  );
};

export default DashboardHeader;
