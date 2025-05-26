import React from 'react';
import { Drawer } from 'vaul';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Copy, Trash2, Bell } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Notification {
  type: string;
  data: any;
  time: Date;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onClearAll: () => void;
  onRemoveNotification: (time: Date) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  notifications,
  onClearAll,
  onRemoveNotification,
}) => {
  const { toast } = useToast();

  const handleCopyOrderNumber = (orderNumber: string) => {
    navigator.clipboard.writeText(orderNumber).then(() => {
      toast({
        title: "Order Number Copied!",
        description: orderNumber,
      });
    }).catch(err => {
      console.error('Failed to copy order number: ', err);
      toast({
        title: "Error",
        description: "Failed to copy Order Number.",
        variant: "destructive",
      });
    });
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()} direction="right">
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-[10px] h-full w-[450px] mt-24 fixed bottom-0 right-0 z-50">
          <div className="p-4 bg-muted rounded-t-[10px] flex-none border-b">
            <div className="flex items-center justify-between">
              <Drawer.Title className="font-medium text-lg">Notifications</Drawer.Title>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
                <Bell className="h-12 w-12 mb-4" /> 
                <p className="text-lg font-medium">No new notifications</p>
                <p className="text-sm text-center">You're all caught up!</p>
              </div>
            ) : (
              <div className="p-1 divide-y divide-border">
                {notifications.slice().reverse().map((notification) => (
                  <div key={notification.time.toISOString()} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold text-base capitalize">
                        {notification.type.replace('_', ' ')}
                      </p>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => onRemoveNotification(notification.time)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {notification.type === 'new_order' && notification.data ? (
                      <div className="space-y-2">
                        <p className="text-sm text-foreground/90">{notification.data.message}</p>
                        <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-md">
                          <span className="text-xs font-mono flex-1 break-all">{notification.data.orderNumber}</span>
                          <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => handleCopyOrderNumber(notification.data.orderNumber)}>
                            <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy Number
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <pre className="text-xs bg-gray-100 p-2 rounded-md overflow-x-auto my-1">
                        {JSON.stringify(notification.data, null, 2)}
                      </pre>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(notification.time).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          {notifications.length > 0 && (
            <div className="p-4 border-t flex-none bg-muted/50">
              <Button onClick={onClearAll} className="w-full" variant="outline">
                Clear All Notifications
              </Button>
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default NotificationPanel; 