import React, { useState, useEffect, FormEvent } from "react";
import { Search, UserPlus, Filter, ArrowUpDown, CheckCircle, XCircle, Shield, UserCog, ChevronDown, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CustomerDialog } from "@/components/customers/CustomerDialog";
import { 
  getUsers, 
  createUser,
  updateUser,
  deleteUser,
  User, 
  UsersApiResponse, 
  UserRole,
  CreateUserData,
  UpdateUserData
} from "@/services/userService";
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const initialCreateUserData: CreateUserData = {
  name: "",
  phone: "",
  role: "CUSTOMER", // Default role
};

const Customers = () => {
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  
  const [usersData, setUsersData] = useState<UsersApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  
  const [userToCreateData, setUserToCreateData] = useState<CreateUserData>(initialCreateUserData);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToEditData, setUserToEditData] = useState<UpdateUserData>({});
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUsers(currentPage, itemsPerPage, roleFilter === "ALL" ? undefined : roleFilter);
        setUsersData(data);
      } catch (err: any) {
        setError(err.message);
        toast({
          title: "Error fetching customers",
          description: err.message || "Could not retrieve customer data.",
          variant: "destructive",
        });
      }
      setLoading(false);
    };
    fetchUsers();
  }, [currentPage, roleFilter, toast]);

  const filteredUsers = usersData?.users;

  const handleNextPage = () => {
    if (usersData && currentPage < usersData.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const getInitials = (name: string = "") => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  // Create User Handlers
  const handleCreateUserFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserToCreateData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateUserRoleChange = (value: UserRole) => {
    setUserToCreateData(prev => ({ ...prev, role: value }));
  };

  const handleCreateUserSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if(!userToCreateData.name || !userToCreateData.phone || !userToCreateData.role) {
        toast({ title: "Validation Error", description: "Name, Phone, and Role are required.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
      const newUser = await createUser(userToCreateData);
      setUsersData(prev => {
        if (!prev) return { users: [newUser], page: 1, limit: itemsPerPage, totalPages: 1, totalItems: 1 };
        // Optimistically add to the current view or refetch
        // For simplicity, refetching the current page might be easier if order/totalItems change significantly
        // Or add to start of list if on page 1
        if (prev.page === 1) {
          return { ...prev, users: [newUser, ...prev.users], totalItems: prev.totalItems + 1 };
        }
        // If not on page 1, or to ensure data consistency, refetch.
        // For now, just show a success and let next fetch update.
        // Consider invalidating and refetching the current page.
        return prev; 
      });
       // Refetch current page to see the new user if not added above
      const currentRoleFilter = roleFilter === "ALL" ? undefined : roleFilter;
      const refreshedData = await getUsers(currentPage, itemsPerPage, currentRoleFilter);
      setUsersData(refreshedData);

      toast({ title: "Success!", description: `User "${newUser.name}" created successfully.`});
      setIsAddUserDialogOpen(false);
      setUserToCreateData(initialCreateUserData); // Reset form
    } catch (err: any) {
      toast({ title: "Error creating user", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit User Handlers
  const handleEditUserClick = (user: User) => {
    setEditingUser(user);
    setUserToEditData({
      name: user.name,
      phone: user.phone || "",
      role: user.role,
      email: user.email, // Keep other fields if they are part of UpdateUserData
      isPhoneVerified: user.isPhoneVerified,
      dateOfBirth: user.dateOfBirth || undefined,
    });
    setIsEditUserDialogOpen(true);
  };

  const handleEditUserFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserToEditData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleEditUserRoleChange = (value: UserRole) => {
    setUserToEditData(prev => ({ ...prev, role: value }));
  };
  
  const handleEditUserPhoneVerifiedChange = (checked: boolean) => {
    setUserToEditData(prev => ({ ...prev, isPhoneVerified: checked }));
  };

  const handleUpdateUserSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);
    try {
      if(!userToEditData.name || !userToEditData.phone || !userToEditData.role) {
        toast({ title: "Validation Error", description: "Name, Phone, and Role are required.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
      const updatedUser = await updateUser(editingUser.id, userToEditData);
      setUsersData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u),
        };
      });
      toast({ title: "Success!", description: `User "${updatedUser.name}" updated successfully.`});
      setIsEditUserDialogOpen(false);
      setEditingUser(null);
    } catch (err: any) {
      toast({ title: "Error updating user", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete User Handlers
  const handleDeleteUserClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteUser(userToDelete.id);
      setUsersData(prev => {
        if (!prev) return null;
        const newUsers = prev.users.filter(u => u.id !== userToDelete.id);
        // Adjust totalItems and totalPages if necessary, or refetch
        return {
          ...prev,
          users: newUsers,
          totalItems: prev.totalItems -1,
          //totalPages might need recalculation if totalItems drops below a page threshold
        };
      });
      toast({ title: "Success!", description: `User "${userToDelete.name}" deleted successfully.`});
      setIsDeleteConfirmOpen(false);
      setUserToDelete(null);
       // If the current page becomes empty after deletion, go to previous page or refetch.
      if (usersData && usersData.users.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else if (usersData && usersData.users.length === 1 && currentPage === 1 && usersData.totalItems > 1) {
        // Refetch if it was the last item on page 1 but more items exist
         const currentRoleFilter = roleFilter === "ALL" ? undefined : roleFilter;
         const refreshedData = await getUsers(1, itemsPerPage, currentRoleFilter);
         setUsersData(refreshedData);
      }

    } catch (err: any) {
      toast({ title: "Error deleting user", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            View and manage your customers.
          </p>
        </div>
        <Button 
          onClick={() => {
            setUserToCreateData(initialCreateUserData); // Reset form before opening
            setIsAddUserDialogOpen(true);
          }}
        >
          <UserPlus className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Customer List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search customers (API)..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  <Filter className="mr-2 h-4 w-4" /> 
                  Filter by Role: {roleFilter === "ALL" ? "All" : roleFilter}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Select Role</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={roleFilter} onValueChange={(value) => {
                    setRoleFilter(value as UserRole | "ALL");
                    setCurrentPage(1); // Reset to first page on filter change
                }}>
                  <DropdownMenuRadioItem value="ALL">All Roles</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="ADMIN">Admin</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="STAFF">Staff</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="CUSTOMER">Customer</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-10">
              <LoadingSpinner message="Loading customers..." />
            </div>
          )}
          {error && !loading && (
            <div className="text-center text-red-500 py-10">
              Error: {error} <Button onClick={() => { setCurrentPage(1); const currentRoleFilter = roleFilter === "ALL" ? undefined : roleFilter; getUsers(1, itemsPerPage, currentRoleFilter).then(setUsersData); }} className="ml-2">Retry</Button>
            </div>
          )}

          {!loading && !error && usersData && (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[200px]">Customer</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead className="w-[120px]">Joined Date</TableHead>
                      <TableHead className="text-right w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers && filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 border">
                                <AvatarFallback 
                                  className={`${user.role === 'ADMIN' ? 'bg-red-500' : (user.role === 'STAFF' ? 'bg-blue-500' : 'bg-gray-500')} text-white text-xs font-semibold`}
                                >
                                  {getInitials(user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{user.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{user.phone || "N/A"}</TableCell>
                          <TableCell>
                            {user.isPhoneVerified ? (
                              <Badge variant="default" className="flex items-center w-fit bg-green-500 hover:bg-green-600 text-white">
                                <CheckCircle className="mr-1 h-3 w-3" /> Verified
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="flex items-center w-fit">
                                <XCircle className="mr-1 h-3 w-3" /> Not Verified
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {user.role === 'ADMIN' && <Badge variant="destructive" className="text-xs"><Shield className="mr-1 h-3 w-3"/>Admin</Badge>}
                              {user.role === 'STAFF' && <Badge variant="default" className="text-xs bg-blue-500 hover:bg-blue-600 text-white"><UserCog className="mr-1 h-3 w-3"/>Staff</Badge>}
                              {user.role === 'CUSTOMER' && <Badge variant="outline" className="text-xs">Customer</Badge>}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditUserClick(user)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteUserClick(user)} className="text-red-600 hover:!text-red-600 hover:!bg-red-100 dark:hover:!bg-red-800/50">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No customers found for the selected filter.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between space-x-2 pt-4">
                 <span className="text-sm text-muted-foreground">
                  Page {usersData.page} of {usersData.totalPages} ({usersData.totalItems} total users)
                 </span>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handlePreviousPage} 
                    disabled={currentPage === 1 || usersData.totalPages === 0}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleNextPage} 
                    disabled={currentPage === usersData.totalPages || usersData.totalPages === 0}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={(isOpen) => {
        if (!isOpen) setUserToCreateData(initialCreateUserData); // Reset form on close
        setIsAddUserDialogOpen(isOpen);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>Enter the details for the new customer.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUserSubmit} className="space-y-4 py-4">
            <div>
              <Label htmlFor="create-name">Name <span className="text-red-500">*</span></Label>
              <Input id="create-name" name="name" value={userToCreateData.name} onChange={handleCreateUserFormChange} placeholder="Full Name" required />
            </div>
            <div>
              <Label htmlFor="create-phone">Phone Number <span className="text-red-500">*</span></Label>
              <Input id="create-phone" name="phone" type="tel" value={userToCreateData.phone} onChange={handleCreateUserFormChange} placeholder="e.g. 7889396001" required />
            </div>
             {/* Optional: Email for Create User
            <div>
              <Label htmlFor="create-email">Email (Optional)</Label>
              <Input id="create-email" name="email" type="email" value={userToCreateData.email || ""} onChange={handleCreateUserFormChange} placeholder="user@example.com" />
            </div>
            */}
            <div>
              <Label htmlFor="create-role">Role <span className="text-red-500">*</span></Label>
              <Select name="role" value={userToCreateData.role} onValueChange={handleCreateUserRoleChange} required>
                <SelectTrigger id="create-role"><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" /> : null}
                Add Customer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={isEditUserDialogOpen} onOpenChange={(isOpen) => {
          if (!isOpen) setEditingUser(null); // Clear editing user on close
          setIsEditUserDialogOpen(isOpen);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Customer: {editingUser.name}</DialogTitle>
              <DialogDescription>Update the customer's details.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateUserSubmit} className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-name">Name <span className="text-red-500">*</span></Label>
                <Input id="edit-name" name="name" value={userToEditData.name || ""} onChange={handleEditUserFormChange} required />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone Number <span className="text-red-500">*</span></Label>
                <Input id="edit-phone" name="phone" type="tel" value={userToEditData.phone || ""} onChange={handleEditUserFormChange} required />
              </div>
              {/* Optional: Email for Edit User 
              <div>
                <Label htmlFor="edit-email">Email (Optional)</Label>
                <Input id="edit-email" name="email" type="email" value={userToEditData.email || ""} onChange={handleEditUserFormChange} />
              </div>
              */}
              <div>
                <Label htmlFor="edit-role">Role <span className="text-red-500">*</span></Label>
                <Select name="role" value={userToEditData.role || "CUSTOMER"} onValueChange={handleEditUserRoleChange} required>
                  <SelectTrigger id="edit-role"><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                    <SelectItem value="STAFF">Staff</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                    id="edit-isPhoneVerified" 
                    checked={userToEditData.isPhoneVerified || false} 
                    onCheckedChange={(checked) => handleEditUserPhoneVerifiedChange(Boolean(checked))}
                />
                <Label htmlFor="edit-isPhoneVerified">Phone Verified</Label>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete User Confirmation Dialog */}
      {userToDelete && (
        <Dialog open={isDeleteConfirmOpen} onOpenChange={(isOpen) => {
          if (!isOpen) setUserToDelete(null);
          setIsDeleteConfirmOpen(isOpen);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete customer "{userToDelete.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button variant="destructive" onClick={confirmDeleteUser} disabled={isSubmitting}>
                {isSubmitting ? <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" /> : null}
                Delete Customer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Customers;
