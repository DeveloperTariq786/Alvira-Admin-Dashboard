import React from 'react';
import { AbandonedCart } from '@/types/abandonedCart';
import AbandonedCartListItem from './AbandonedCartListItem';

interface AbandonedCartListProps {
  carts: AbandonedCart[];
}

const AbandonedCartList: React.FC<AbandonedCartListProps> = ({ carts }) => {
  if (carts.length === 0) {
    return <p>No abandoned carts found.</p>;
  }

  return (
    <div>
      {carts.map((cart) => (
        <AbandonedCartListItem key={cart.id} cart={cart} />
      ))}
    </div>
  );
};

export default AbandonedCartList; 