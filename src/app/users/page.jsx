import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DataTable } from "@/components/data-table";

const userColumns = [
  { accessorKey: "fullName", header: "Full Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "mobile", header: "Mobile" },
  { accessorKey: "profileType", header: "Profile Type" },
  { accessorKey: "enrolledCourses", header: "Enrolled Courses" },
];

const userData = [
  {
    id: 1,
    fullName: "John Doe",
    email: "john.doe@example.com",
    mobile: "+1 555-1234",
    profileType: "Student",
    enrolledCourses: "Math, Science",
  },
  {
    id: 2,
    fullName: "Jane Smith",
    email: "jane.smith@example.com",
    mobile: "+1 555-5678",
    profileType: "Student",
    enrolledCourses: "English, History",
  },
  // Add more users as needed
];

export default function Page() {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col items-center justify-start w-full min-h-0">
          <div className="w-full max-w-6xl flex flex-col gap-0 mt-8">
            <h1 className="text-2xl font-bold mb-1">Users</h1>
            <p className="text-muted-foreground mb-4">
              Manage your users and their details.
            </p>
            <div className="rounded-xl overflow-hidden mt-10">
              <DataTable data={userData} columns={userColumns} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
