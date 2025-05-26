import React, { useEffect, useState, useCallback } from 'react';
import { getAbandonedCarts } from '@/services/abandonedCartService';
import { AbandonedCart } from '@/types/abandonedCart';
import AbandonedCartList from '@/components/abandoned-carts/AbandonedCartList';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AbandonedCartsPage: React.FC = (): JSX.Element => {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchCarts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAbandonedCarts();
      if (response.success) {
        setCarts(response.data);
      } else {
        setError('Failed to fetch abandoned carts: API request unsuccessful');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCarts();
  }, [fetchCarts]);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card className="shadow-xl rounded-lg">
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <CardTitle className="text-2xl md:text-3xl font-bold text-center text-gray-800 flex-grow">Abandoned Carts Monitor</CardTitle>
            <Button variant="outline" onClick={fetchCarts} disabled={loading} className="flex items-center">
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {loading && (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
              <p className="ml-2 text-lg text-gray-600">Loading abandoned carts...</p>
            </div>
          )}
          {error && (
             <div className="text-center py-10">
               <p className="text-red-600 text-lg font-semibold">Error: {error}</p>
               <Button onClick={fetchCarts} className="mt-4">Try Again</Button>
             </div>
          )}
          {!loading && !error && (
            carts.length > 0 ? (
              <AbandonedCartList carts={carts} />
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500 text-lg">No abandoned carts found.</p>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AbandonedCartsPage; 