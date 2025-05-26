import React from 'react';
import { AbandonedCart } from '@/types/abandonedCart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { UserCircle, ShoppingBag, Clock, TagIcon, CalendarDays, Hourglass } from 'lucide-react';

interface AbandonedCartListItemProps {
  cart: AbandonedCart;
}

const AbandonedCartListItem: React.FC<AbandonedCartListItemProps> = ({ cart }) => {
  const formatLastUpdated = (dateString: string) => {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  };

  return (
    <Card className="mb-6 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden bg-white">
      <CardHeader className="bg-gray-50 border-b p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <CardTitle className="text-xl font-semibold text-gray-800 mb-2 sm:mb-0">Cart ID: {cart.id}</CardTitle>
          <Badge variant={cart.hoursInactive > 72 ? "destructive" : cart.hoursInactive > 24 ? "secondary" : "outline"} className="py-1 px-3 rounded-full text-sm">
            <Hourglass className="mr-1.5 h-4 w-4" /> Inactive: {cart.hoursInactive} hours
          </Badge>
        </div>
        <CardDescription className="text-xs text-gray-500 mt-1">
          Created: {new Date(cart.createdAt).toLocaleDateString()} {new Date(cart.createdAt).toLocaleTimeString()} | Last Activity: {formatLastUpdated(cart.lastUpdated)}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 pb-4 border-b">
          <div className="flex items-start p-3 bg-slate-50 rounded-md">
            <UserCircle className="h-8 w-8 text-blue-500 mr-3 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-gray-700">User Details</h4>
              <p className="text-sm text-gray-600">Name: {cart.user.name}</p>
              <p className="text-sm text-gray-600">Phone: {cart.user.phone}</p>
            </div>
          </div>
          <div className="flex items-start p-3 bg-slate-50 rounded-md">
            <ShoppingBag className="h-8 w-8 text-green-500 mr-3 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-gray-700">Cart Summary</h4>
              <p className="text-sm text-gray-600">Total Value: <span className="font-bold text-green-600">₹{cart.totalValue.toLocaleString()}</span></p>
              <p className="text-sm text-gray-600">Items: {cart.itemCount}</p>
            </div>
          </div>
          <div className="flex items-start p-3 bg-slate-50 rounded-md md:col-span-2 lg:col-span-1">
            <Clock className="h-8 w-8 text-purple-500 mr-3 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-gray-700">Activity</h4>
               <p className="text-sm text-gray-600">Last Updated: {formatLastUpdated(cart.lastUpdated)}</p>
               <p className="text-sm text-gray-600">Created: {new Date(cart.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        
        <h4 className="text-lg font-semibold text-gray-700 mb-3">Items in Cart ({cart.items.length})</h4>
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</TableHead>
                <TableHead className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</TableHead>
                <TableHead className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</TableHead>
                <TableHead className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-200">
              {cart.items.map((item) => (
                <TableRow key={item.productId} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 mr-3">
                        <img className="h-12 w-12 rounded-md object-cover" src={item.image} alt={item.name} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-500">ID: {item.productId}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right">₹{item.price.toLocaleString()}</TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center">{item.quantity}</TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-800 text-right">₹{(item.price * item.quantity).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {cart.items.length === 0 && (
          <p className="text-center text-gray-500 py-4">This cart currently has no items.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default AbandonedCartListItem; 