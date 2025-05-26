import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import NotificationPanel from "./NotificationPanel";
import io from "socket.io-client";
import { Toaster } from "@/components/ui/toaster";

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL || "http://localhost:5000";
const LOCAL_STORAGE_KEY = "dashboardNotifications";

interface Notification {
  type: string;
  data: any;
  time: Date;
}

const DashboardLayout = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  // Load notifications from local storage on initial load
  useEffect(() => {
    const storedNotifications = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedNotifications) {
      try {
        const parsedNotifications = JSON.parse(storedNotifications).map((n: Notification) => ({ ...n, time: new Date(n.time) }));
        setNotifications(parsedNotifications);
      } catch (error) {
        console.error("Failed to parse notifications from local storage:", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }, []);

  // Save notifications to local storage whenever they change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL);

    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    const handleNewNotification = (type: string, data: any) => {
      console.log(`${type} received:`, data);
      const newNotification: Notification = { type, data, time: new Date() };
      setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);
    };

    socket.on("new:order", (data) => handleNewNotification("new_order", data));

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const toggleNotificationPanel = () => {
    setIsNotificationPanelOpen((prev) => !prev);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (notificationTime: Date) => {
    setNotifications((prevNotifications) => 
      prevNotifications.filter(n => n.time.toISOString() !== notificationTime.toISOString())
    );
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-400 via-purple-500 to-purple-700">
        <DashboardSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <DashboardHeader 
            notificationCount={notifications.length} 
            onNotificationIconClick={toggleNotificationPanel} 
          />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
        <NotificationPanel 
          isOpen={isNotificationPanelOpen}
          onClose={() => setIsNotificationPanelOpen(false)}
          notifications={notifications}
          onClearAll={clearAllNotifications}
          onRemoveNotification={removeNotification}
        />
        <Toaster />
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
