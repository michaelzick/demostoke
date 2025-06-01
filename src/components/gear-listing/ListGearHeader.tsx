
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/helpers";
import { ArrowLeft, Upload, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ListGearHeaderProps {
  children: React.ReactNode;
  currentPage?: "manual" | "lightspeed-pos";
}

const ListGearHeader = ({ children, currentPage = "manual" }: ListGearHeaderProps) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleManualEntry = () => {
    navigate("/list-gear");
  };

  const handleLightspeedPOS = () => {
    if (isAuthenticated) {
      navigate("/list-gear/lightspeed-pos");
    } else {
      navigate("/auth/signin");
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <GearListingSidebar 
          onManualEntry={handleManualEntry}
          onLightspeedPOS={handleLightspeedPOS}
          currentPage={currentPage}
        />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" asChild>
                <Link to="/my-gear" className="flex items-center">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to My Gear
                </Link>
              </Button>
              <SidebarTrigger />
            </div>

            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-6 text-left">List Your Gear</h1>
            </div>

            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

const GearListingSidebar = ({ 
  onManualEntry, 
  onLightspeedPOS, 
  currentPage 
}: {
  onManualEntry: () => void;
  onLightspeedPOS: () => void;
  currentPage: "manual" | "lightspeed-pos";
}) => {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>List Your Gear</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={onManualEntry}
                  isActive={currentPage === "manual"}
                >
                  <Upload />
                  <span>Manual Entry</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <Collapsible className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <RefreshCw />
                      <span>Sync With POS</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton 
                          onClick={onLightspeedPOS}
                          isActive={currentPage === "lightspeed-pos"}
                        >
                          <span>Lightspeed POS</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default ListGearHeader;
