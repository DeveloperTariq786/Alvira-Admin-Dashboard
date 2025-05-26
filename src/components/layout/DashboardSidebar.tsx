import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,  
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  CheckCircle,
  Users,
  CreditCard,
  Sliders,
  LayoutGrid,
  Star,
  Instagram,
  LogOut,
  ShoppingCart,
  Palette,
  TicketPercent,
  Settings,
  BarChart3,
  Store,
  Image as ImageIcon,
} from "lucide-react";
import { removeToken } from "@/services/loginService";

const sidebarItems = [
  {
    title: "Products",
    icon: Store,
    path: "/products",
  },
  {
    title: "Orders",
    icon: ShoppingCart,
    path: "/orders",
  },
  {
    title: "Customers",
    icon: Users,
    path: "/customers",
  },
  {
    title: "Promotions",
    icon: TicketPercent,
    path: "/promotions",
  },
  {
    title: "Categories",
    icon: Palette,
    path: "/categories",
  },
  {
    title: "Color & Size",
    icon: Star,
    path: "/colors-sizes",
  },
  {
    title: "Instagram",
    icon: Instagram,
    path: "/instagram",
  },
  {
    title: "Image Management",
    icon: ImageIcon,
    path: "/image-management",
  },
  {
    title: "Abandoned Carts",
    icon: BarChart3,
    path: "/abandoned-carts",
  },
];

const DashboardSidebar = () => {
  const { open, isMobile, setOpenMobile } = useSidebar();
  const navigate = useNavigate();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const performLogout = () => {
    removeToken();
    navigate('/login');
    setIsLogoutDialogOpen(false);
  };
  
  const handleLogoutClick = () => {
    setIsLogoutDialogOpen(true);
  };
  
  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };
  
  // Enhanced active class styling inspired by the provided HTML/CSS
  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "flex items-center gap-2 w-full rounded-md bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-3 shadow-md transform transition-all duration-300 hover:translate-x-1"
      : "flex items-center gap-2 w-full rounded-md hover:bg-accent px-4 py-3 transition-all duration-300 hover:translate-x-1";

  return (
    <Sidebar
      className={`border-r border-border shadow-lg transition-all duration-300 bg-card/95 backdrop-blur-md ${
        open ? "w-64" : "w-14"
      }`}
    >
      <div className="p-6 flex flex-col items-center justify-center border-b border-border h-auto">
        {open ? (
          <>
            <img src="/logo.jpg" alt="Alvira Logo" className="w-24 h-24 mb-2 rounded-full" />
            <h1 className="font-extrabold text-2xl bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">Alvira</h1>
            <p className="text-xs text-muted-foreground mt-1">A HOUSE OF HAND EMBROIDERY</p>
          </>
        ) : (
          <img src="/logo.jpg" alt="Alvira Logo" className="w-10 h-10 rounded-full" />
        )}
      </div>
      
      <SidebarContent className="py-6">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="px-3 space-y-1">
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.path} className="my-1">
                  <SidebarMenuButton asChild>
                    <NavLink to={item.path} className={getNavClass} end={item.path === "/"} onClick={handleNavClick}>
                      <item.icon className="h-5 w-5" />
                      {open && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <div className="mt-auto p-4 border-t border-border">
        {/* Logout Button for large screens */}
        {open && (
          <Button 
            onClick={handleLogoutClick}
            variant="destructive"
            className="flex items-center gap-2 w-full rounded-md px-4 py-3 transition-all duration-300"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </Button>
        )}
        {/* Logout Icon for small screens - circular button */}
        {!open && (
          <Button 
            onClick={handleLogoutClick}
            variant="destructive"
            size="icon"
            className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Confirm Logout</DialogTitle>
            <DialogDescription className="mt-2 text-sm text-gray-600">
              Are you sure you want to log out? You will be redirected to the login page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 sm:flex sm:flex-row-reverse">
            <Button 
              variant="destructive" 
              onClick={performLogout} 
              className="w-full sm:ml-3 sm:w-auto"
            >
              Logout
            </Button>
            <DialogClose asChild>
              <Button 
                variant="outline" 
                className="mt-3 w-full sm:mt-0 sm:w-auto"
              >
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
};

export default DashboardSidebar;
