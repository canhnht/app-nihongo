import { Toast } from 'ionic-native';

export const errorHandler = (message: string) => {
  return (err) => {
    Toast.showLongBottom(message).subscribe(() => {});
    throw err;
  };
};
