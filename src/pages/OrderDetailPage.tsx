import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrderById, updateOrderStatus } from '@/services/orderService';
import { Order, OrderItem, ShippingAddress, StatusHistory, User as OrderUser } from '@/types/order';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Truck, User, MapPin, CalendarDays, Hash, CreditCard, Info, ListChecks, MessageSquare, Package, ShoppingCart, DollarSign, Percent, History, Edit, Printer, ChevronDown } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";

const formatCurrency = (value: number, currency: string = "INR") => {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: currency, minimumFractionDigits: 2 }).format(value);
};

const formatDate = (dateString: string | null, includeTime: boolean = false) => {
  if (!dateString) return "N/A";
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric', month: 'short', day: 'numeric',
    ...(includeTime && { hour: '2-digit', minute: '2-digit', hour12: true })
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

const DetailItem: React.FC<{ icon?: React.ElementType; label: string; value?: React.ReactNode; children?: React.ReactNode; className?: string; labelClassName?: string; valueClassName?: string }> = 
  ({ icon: Icon, label, value, children, className, labelClassName, valueClassName }) => (
  <div className={`flex flex-col sm:flex-row sm:items-start ${className}`}>
    <div className={`flex items-center w-full sm:w-1/3 mb-1 sm:mb-0 ${labelClassName}`}>
      {Icon && <Icon className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />}
      <span className="font-medium text-muted-foreground">{label}:</span>
    </div>
    {children ? <div className={`w-full sm:w-2/3 text-foreground ${valueClassName}`}>{children}</div> : <span className={`w-full sm:w-2/3 text-foreground ${valueClassName}`}>{value || 'N/A'}</span>}
  </div>
);

const Section: React.FC<{ title: string; icon?: React.ElementType; children: React.ReactNode; actionButton?: React.ReactNode; className?: string }> = 
  ({ title, icon: Icon, children, actionButton, className }) => (
  <Card className={`shadow-lg ${className}`}>
    <CardHeader className="border-b">
      <div className="flex justify-between items-center">
        <CardTitle className="text-xl flex items-center">
          {Icon && <Icon className="h-5 w-5 mr-3 text-primary" />} 
          {title}
        </CardTitle>
        {actionButton}
      </div>
    </CardHeader>
    <CardContent className="p-6 space-y-4">
      {children}
    </CardContent>
  </Card>
);

const validStatusTransitions: Record<string, string[]> = {
  PAYMENT_PENDING: ["PENDING", "CANCELLED"],
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "RETURNED"],
  DELIVERED: ["RETURNED", "REFUNDED"],
  RETURNED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: order, isLoading, error, refetch } = useQuery<Order, Error>({
    queryKey: ['order', orderId], 
    queryFn: () => getOrderById(orderId!),
    enabled: !!orderId,
  });

  const updateStatusMutation = useMutation<Order, Error, { newStatus: string }>({
    mutationFn: async ({ newStatus }: { newStatus: string }) => {
      if (!order) throw new Error("Order data not available for update.");
      return updateOrderStatus(order.id, newStatus);
    },
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Status Updated",
        description: `Order ${updatedOrder.orderNumber} status changed to ${updatedOrder.status}.`,
        variant: "default",
      });
    },
    onError: (updateError) => {
      toast({
        title: "Update Failed",
        description: updateError.message || "Could not update order status.",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = (newStatus: string) => {
    if (!order) return;
    const currentStatus = order.status;
    if (validStatusTransitions[currentStatus]?.includes(newStatus)) {
      updateStatusMutation.mutate({ newStatus });
    } else {
      toast({
        title: "Invalid Transition",
        description: `Cannot change status from ${currentStatus} to ${newStatus}.`,
        variant: "default", 
      });
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-screen"><LoadingSpinner message="Loading order details..." size="large" /></div>;
  if (error) return (
    <div className="container mx-auto p-4 text-center">
      <h2 className="text-2xl font-semibold text-red-600 mb-4">Error Loading Order</h2>
      <p className="text-muted-foreground mb-6">{error.message}</p>
      <Button onClick={() => navigate('/orders')}><ArrowLeft className="mr-2 h-4 w-4"/> Back to Orders</Button>
    </div>
  );
  if (!order) return <div className="container mx-auto p-4 text-center"><p>Order not found.</p><Button onClick={() => navigate('/orders')}><ArrowLeft className="mr-2 h-4 w-4"/> Back to Orders</Button></div>;

  const availableTransitions = validStatusTransitions[order.status] || [];
  const isUpdatingStatus = updateStatusMutation.status === 'pending';

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 bg-background">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <Button variant="outline" onClick={() => navigate('/orders')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders List
          </Button>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Hash className="mr-2 h-6 w-6 text-primary"/>Order #{order.orderNumber}
          </h1>
          <p className="text-muted-foreground">
            Placed on: {formatDate(order.createdAt, true)} | Last updated: {formatDate(order.updatedAt, true)}
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4"/> Print Invoice</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isUpdatingStatus}>
                {isUpdatingStatus ? "Updating..." : "More Actions"} 
                <ChevronDown className="ml-2 h-4 w-4"/>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {availableTransitions.length > 0 && (
                <DropdownMenuSub>
                   <DropdownMenuSubTrigger disabled={isUpdatingStatus}>Update Status</DropdownMenuSubTrigger>
                   <DropdownMenuSubContent>
                      {availableTransitions.map(status => (
                        <DropdownMenuItem 
                          key={status} 
                          onClick={() => handleStatusUpdate(status)}
                          disabled={isUpdatingStatus}
                        >
                          Mark as {status.replace(/_/g, " ").toLowerCase().split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ')}
                        </DropdownMenuItem>
                      ))}
                   </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}
              {order.status !== 'CANCELLED' && order.status !== 'REFUNDED' && availableTransitions.includes('CANCELLED') && (
                <>
                  {availableTransitions.length > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuItem 
                    className="text-red-500 hover:!text-red-600 focus:!text-red-600 focus:!bg-red-50 dark:focus:!bg-red-900/50"
                    onClick={() => handleStatusUpdate('CANCELLED')}
                    disabled={isUpdatingStatus}
                  >
                    Cancel Order
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Customer, Shipping, Payment */}
        <div className="lg:col-span-1 space-y-8">
          <Section title="Customer Details" icon={User}>
            <DetailItem label="Name" value={order.user.name} />
            <DetailItem label="Phone" value={order.user.phone} />
            {/* Add Email if available in order.user */}
          </Section>

          <Section title="Shipping Information" icon={MapPin}>
            <DetailItem label="Recipient" value={order.shippingAddress.name} />
            <DetailItem label="Address">
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            </DetailItem>
            <DetailItem label="Mobile" value={order.shippingAddress.mobile} />
            <DetailItem label="Type" value={order.shippingAddress.type} />
          </Section>

          <Section title="Payment & Order Status" icon={CreditCard}>
            <DetailItem label="Order Status">
              <StatusBadge status={order.status} />
            </DetailItem>
            <DetailItem label="Payment Status">
              <StatusBadge status={order.status === 'PAYMENT_PENDING' ? 'payment pending' : (order.isPaid ? "paid" : "pending")} />
            </DetailItem>
            {order.paidAt && <DetailItem label="Paid At" value={formatDate(order.paidAt, true)} />}
            <Separator className="my-3"/>
            {order.tracking && <DetailItem label="Tracking #" value={order.tracking} />}
            {order.carrier && <DetailItem label="Carrier" value={order.carrier} />}
            {order.estimatedDelivery && <DetailItem label="Est. Delivery" value={formatDate(order.estimatedDelivery)} />}
            {order.deliveredAt && <DetailItem label="Delivered At" value={formatDate(order.deliveredAt, true)} />}
            {order.cancelledAt && <DetailItem label="Cancelled At" value={formatDate(order.cancelledAt, true)} />}
          </Section>
        </div>

        {/* Right Column: Order Items, Summary, History */}
        <div className="lg:col-span-2 space-y-8">
          <Section title="Order Items" icon={ShoppingCart}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60%]">Product</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <img src={item.image || '/placeholder.svg'} alt={item.name} className="w-16 h-16 object-cover rounded-md border" />
                        <div>
                          <p className="font-medium text-base">{item.name}</p>
                          {item.selectedColor && <Badge variant="secondary" className="mr-1 text-xs">Color: {item.selectedColor}</Badge>}
                          {item.selectedSize && <Badge variant="secondary" className="text-xs">Size: {item.selectedSize}</Badge>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">x{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.price, order.currency)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(item.price * item.quantity, order.currency)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Section>

          <Section title="Price Summary" icon={DollarSign} className="sticky top-8">
            <DetailItem label="Subtotal" value={formatCurrency(order.subtotal, order.currency)} labelClassName="font-normal" valueClassName="text-right font-medium"/>
            <DetailItem label="Discount" value={`-${formatCurrency(order.discount, order.currency)}`} labelClassName="font-normal" valueClassName="text-right font-medium"/>
            <DetailItem label="Shipping" value={formatCurrency(order.shipping, order.currency)} labelClassName="font-normal" valueClassName="text-right font-medium"/>
            <DetailItem label="Tax (GST)" value={formatCurrency(order.tax, order.currency)} labelClassName="font-normal" valueClassName="text-right font-medium"/>
            <Separator className="my-4" />
            <DetailItem label="Grand Total" valueClassName="text-right text-2xl font-bold text-primary">
                {formatCurrency(order.total, order.currency)}
            </DetailItem>
          </Section>
          
          {order.statusHistory && order.statusHistory.length > 0 && (
            <Section title="Order History" icon={History}>
              <ScrollArea className="h-60">
                <div className="pr-3 py-1">
                {order.statusHistory.slice().reverse().map(history => (
                  <div key={history.id} className="relative pl-8 pb-5 group last:pb-2">
                    <div className="absolute left-4 top-0 w-0.5 h-full bg-gray-300 dark:bg-gray-600 group-last:h-[18px]"></div>
                    
                    <div className="absolute left-[calc(1rem-0.375rem)] top-[18px] h-3 w-3 rounded-full bg-primary ring-[3px] ring-background dark:ring-slate-900"></div>

                    <div className="ml-4 relative top-[11px]">
                      <div className="flex items-center justify-between mb-1">
                        <StatusBadge status={history.newStatus} />
                        <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">{formatDate(history.createdAt, true)}</span>
                      </div>

                      {history.comment && (
                        <div className="mt-2 text-sm bg-muted/70 dark:bg-slate-800/70 p-2.5 rounded-md shadow-sm border border-transparent hover:border-muted-foreground/10">
                          <p className="italic text-foreground/90 dark:text-slate-300/90">{history.comment}</p>
                        </div>
                      )}

                      {history.previousStatus && (
                        <p className="text-xs text-muted-foreground mt-1.5">
                          (Previous: <span className="italic">{history.previousStatus.replace(/_/g, " ").toLowerCase().split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ')}</span>)
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                </div>
              </ScrollArea>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;