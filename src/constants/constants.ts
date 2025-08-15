import { CoffeeSize, DeliOption, LatLng, PaymentMethod } from '@/types';

export const APP_NAME = "Matwels Coffee Station";

export const GOOGLE_OAUTH_CLIENT_ID = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;

export const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export const defaultCoordinate: LatLng = {
  lng: 125.50286111111112,
  lat: 7.088877,
}; 

export const defaultDeliFee = 100;

export const coffeeSizeOptions = [
  {
    value: CoffeeSize.SMALL,
    label: 'Small',
  },
  {
    value: CoffeeSize.MEDIUM,
    label: 'Medium',
  },
  {
    value: CoffeeSize.LARGE,
    label: 'Large',
  },
];

export const deliOptions = [
  {
    value: DeliOption.DELIVER,
    label: 'Deliver',
  },
  {
    value: DeliOption.PICK_UP,
    label: 'Pick Up',
  },
];

export const paymentMethodOptions = [
  {
    value: PaymentMethod.CASH,
    label: "Cash on Delivery (Still in Development) ",
    icon: '/images/cash-payment-icon.png',
  },

  {
    value: PaymentMethod.WAVE_MONEY,
    label: "Pay at Counter",
    icon: '/images/cashier.gif',
  },
];
