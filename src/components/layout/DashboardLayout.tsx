
import { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset
} from "@/components/ui/sidebar";
import { CircleUserRound, LogOut, Home, Users, FileText, PlusCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";

const DashboardLayout = () => {
  const { currentUser, doctor, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, loading, navigate]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medical-primary"></div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center space-x-2 px-4 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-medical-accent text-white">
              <span className="text-xl font-semibold">M</span>
            </div>
            <div className="text-lg font-semibold text-sidebar-foreground">Teethli</div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Dashboard" onClick={() => navigate('/dashboard')} isActive={location.pathname === '/dashboard'}>
                  <Home className="mr-2" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Patients" onClick={() => navigate('/dashboard/patients')} isActive={location.pathname === '/dashboard/patients'}>
                  <Users className="mr-2" />
                  <span>Patients</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Prescriptions" onClick={() => navigate('/dashboard/prescriptions')} isActive={location.pathname === '/dashboard/prescriptions'}>
                  <FileText className="mr-2" />
                  <span>Prescriptions</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Add Patient" onClick={() => navigate('/dashboard/add-patient')} isActive={location.pathname === '/dashboard/add-patient'}>
                  <PlusCircle className="mr-2" />
                  <span>Add Patient</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Settings</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Profile" onClick={() => navigate('/dashboard/profile')} isActive={location.pathname === '/dashboard/profile'}>
                  <Settings className="mr-2" />
                  <span>Profile</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-medical-primary text-white">
                  {doctor?.name ? doctor.name.charAt(0).toUpperCase() : "D"}
                </AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{doctor?.name || "Doctor"}</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">{doctor?.email || currentUser?.email}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} disabled={isLoading}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-2xl font-bold text-medical-primary ml-2">
              {location.pathname === '/dashboard' && 'Dashboard'}
              {location.pathname === '/dashboard/patients' && 'Patients'}
              {location.pathname === '/dashboard/prescriptions' && 'Prescriptions'}
              {location.pathname === '/dashboard/add-patient' && 'Add Patient'}
              {location.pathname === '/dashboard/profile' && 'Profile Settings'}
              {location.pathname.startsWith('/dashboard/patient/') && 'Patient Details'}
            </h1>
          </div>
        </div>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
