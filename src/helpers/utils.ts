import { Toast } from 'ionic-native';
import { QuestionType } from './custom-types';

const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  let bytes = new Uint8Array(buffer);
  let len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

export const errorHandler = (message: string) => {
  return (err) => {
    // Toast.showLongBottom(message).subscribe(() => {});
    alert(`errorHandler "${err} ------- ${err.code} ------- ${err.message} -------- ${JSON.stringify(err)} --------- ${err.fileName} ---------- ${err.lineNumber} ------- ${err.stack}"`);
    throw err;
  };
};

export const downloadImageData = (imageUrl: string) => {
  return new Promise((resolve, reject) => {
    let request = new XMLHttpRequest();
    request.open('GET', imageUrl, true);
    request.responseType = 'arraybuffer';

    request.addEventListener('readystatechange', () => {
      if (request.readyState === XMLHttpRequest.DONE) {
        let imageData = 'data:image/jpg;base64,' + arrayBufferToBase64(request.response);
        resolve(imageData);
      }
    });
    request.send();
  });
}
