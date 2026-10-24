/// <reference types="vite/client" />

declare module '/vendor/pdfjs/build/pdf.mjs' {
  export const GlobalWorkerOptions: {
    workerSrc: string;
  };
  export function getDocument(src: any): {
    promise: Promise<any>;
  };
  const defaultExport: any;
  export default defaultExport;
}
