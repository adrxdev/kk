import { v4 as uuidv4 } from 'uuid';
import { DeliveryOrder } from '@/types';
import { getCoffeeById } from './product';
import { createClient } from '@supabase/supabase-js';

const keyName = 'coffee-shop-orders';

// ✅ Supabase client setup
const supabaseUrl = 'https://qmtuxyfeisyvbnsnzntd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtdHV4eWZlaXN5dmJuc256bnRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwOTMzNjUsImV4cCI6MjA3MDY2OTM2NX0.yBdT7rsK13N_thFmpSJor3q5FA58klsbiBUgsMRFUW4';
const supabase = createClient(supabaseUrl, supabaseKey);

const sortByDate = (list: DeliveryOrder[]): DeliveryOrder[] => {
  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export async function getOrderList(): Promise<DeliveryOrder[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    // Save a backup locally
    if (data) {
      window.localStorage.setItem(keyName, JSON.stringify(data));
      return data as DeliveryOrder[];
    }

    return [];
  } catch (err) {
    console.error('Error:: getOrderList :', err);
    // fallback to localStorage
    const value = window.localStorage.getItem(keyName);
    return value ? sortByDate(JSON.parse(value)) : [];
  }
}

export async function getOrderById(id: string): Promise<DeliveryOrder | null> {
  try {
    const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
    if (error) throw error;
    return data || null;
  } catch (err) {
    console.error('Error:: getOrderById :', err);
    const orders = getOrderList();
    return (await orders).find((o) => o.id === id) || null;
  }
}

export async function getOrderCount(): Promise<number> {
  const orders = await getOrderList();
  return orders.length;
}

const shortRandomUUID = (): string => {
  return uuidv4().replace(/-/g, '').substring(0, 8);
};

const makeFakeOrder = (newOrder: TAddOrder): DeliveryOrder => {
  const id = shortRandomUUID();
  const date = new Date().toISOString();
  const firstItem = newOrder.items[0];
  const image = getCoffeeById(firstItem.productId).image;

  return { ...newOrder, id, date, image };
};

export type TAddOrder = Omit<DeliveryOrder, 'id' | 'date' | 'image'>;

export async function addOrder(newOrder: TAddOrder): Promise<DeliveryOrder | null> {
  try {
    const order = makeFakeOrder(newOrder);

    // Save to Supabase
    const { error } = await supabase.from('orders').insert(order);
    if (error) throw error;

    // Also save locally
    const oldOrders = await getOrderList();
    const mergeData: DeliveryOrder[] = [...oldOrders, order];
    window.localStorage.setItem(keyName, JSON.stringify(mergeData));

    return order;
  } catch (err) {
    console.error('Error:: addOrder :', err);
    return null;
  }
}

export async function removeAllOrders(): Promise<void> {
  try {
    await supabase.from('orders').delete().neq('id', ''); // delete all rows
    window.localStorage.removeItem(keyName);
  } catch (err) {
    console.error('Error:: removeAllOrders :', err);
  }
}

// ✅ Realtime subscription
export function subscribeToOrders(callback: (orders: DeliveryOrder[]) => void) {
  supabase
    .channel('orders-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      async () => {
        const updatedOrders = await getOrderList();
        callback(updatedOrders);
      }
    )
    .subscribe();
}
