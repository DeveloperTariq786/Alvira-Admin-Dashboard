import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, ChevronDown, RefreshCw, MoreHorizontal, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { getOrders } from "@/services/orderService";
import { Order, OrdersApiResponse } from "@/types/order";
import { StatusBadge } from "@/components/ui/status-badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Format currency - keeping this as it might still be useful
const formatCurrency = (value: number, currency: string = "INR") => { // Defaulting to INR
  return new Intl.NumberFormat("en-IN", { // Using en-IN for INR
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(value);
};

// Format date - keeping this
const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const Orders = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data, isLoading, error, refetch } = useQuery<OrdersApiResponse, Error>({
    queryKey: ["orders", { page: 1, limit: 10, search: searchTerm, status: statusFilter === "all" ? undefined : statusFilter }],
    queryFn: () => getOrders({ page: 1, limit: 10, search: searchTerm, status: statusFilter === "all" ? undefined : statusFilter }),
  });

  const orders = data?.orders || [];

  const handleViewDetails = (order: Order) => {
    navigate(`/orders/${order.id}`);
  };
  
  if (isLoading && !data) return <div className="flex items-center justify-center h-screen"><LoadingSpinner message="Loading orders..." size="large"/></div>;
  if (error) return <div className="p-4 text-red-600">Error fetching orders: {error.message}</div>;
  
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage and process customer orders</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div>
              <CardTitle className="text-xl">All Orders</CardTitle>
              <CardDescription>Total orders: {data?.totalItems || 0}</CardDescription>
            </div>
             <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:min-w-[250px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by order #, customer..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Filter className="h-4 w-4 mr-1" />
                      Status: {statusFilter === "all" ? "All" : statusFilter.replace(/_/g, " ").split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {["all", "PENDING", "PAYMENT_PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map(statusVal => (
                       <DropdownMenuItem key={statusVal} onClick={() => setStatusFilter(statusVal)}>
                         {statusVal === "all" ? "All" : statusVal.replace(/_/g, " ").split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}
                       </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center pr-6">Actions</TableHead> 
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                       <LoadingSpinner message="Fetching orders..." />
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
                {orders.map((order: Order) => (
                  <TableRow key={order.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium pl-6">{order.orderNumber}</TableCell>
                    <TableCell>
                      <div className="font-medium">{order.user.name}</div>
                      <div className="text-xs text-muted-foreground">{order.user.phone}</div>
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} /> 
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status === 'PAYMENT_PENDING' ? 'payment pending' : (order.isPaid ? "paid" : "pending")} />
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(order.total, order.currency)}</TableCell>
                    <TableCell className="text-center pr-6">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(order)}
                        className="whitespace-nowrap"
                      >
                        View Order
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 py-4 px-6 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => alert("Pagination: Previous Page")}
                disabled={data.page <= 1 || isLoading}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {data.page} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => alert("Pagination: Next Page")}
                disabled={data.page >= data.totalPages || isLoading}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;
