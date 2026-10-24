import { useEffect, useRef, useState } from 'react';

interface PdfViewerProps {
  dataUrl?: string;
  fileName?: string;
}

export function PdfViewer({ dataUrl, fileName }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [numPages, setNumPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const pdfDocRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);
    setCurrentPage(1);

    if (!dataUrl) {
      setLoading(false);
      return;
    }

    const loadPdf = async () => {
      try {
        // Dynamic browser import of the vendored PDF.js library
        const loadModule = new Function('url', 'return import(url)');
        const pdfjs = await loadModule('/vendor/pdfjs/build/pdf.mjs');
        pdfjs.GlobalWorkerOptions.workerSrc = '/vendor/pdfjs/build/pdf.worker.mjs';

        let pdfData: Uint8Array;
        if (dataUrl.startsWith('data:')) {
          const base64 = dataUrl.split(',')[1];
          const binary = atob(base64);
          pdfData = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            pdfData[i] = binary.charCodeAt(i);
          }
        } else {
          const res = await fetch(dataUrl);
          const buf = await res.arrayBuffer();
          pdfData = new Uint8Array(buf);
        }

        if (isCancelled) return;

        const loadingTask = pdfjs.getDocument({
          data: pdfData,
          isEvalSupported: false,
          cMapUrl: '/vendor/pdfjs/cmaps/',
          cMapPacked: true,
          standardFontDataUrl: '/vendor/pdfjs/standard_fonts/',
          wasmUrl: '/vendor/pdfjs/wasm/',
        });

        const doc = await loadingTask.promise;
        if (isCancelled) return;

        pdfDocRef.current = doc;
        setNumPages(doc.numPages);
        setLoading(false);
      } catch (err: any) {
        if (!isCancelled) {
          console.error('Error loading PDF via PDF.js:', err);
          setError('No se pudo renderizar con PDF.js. Puedes usar el visor alternativo o descargarlo.');
          setLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [dataUrl]);

  // Render current page onto canvas
  useEffect(() => {
    let isCancelled = false;
    const doc = pdfDocRef.current;
    const canvas = canvasRef.current;

    if (!doc || !canvas || loading || error) return;

    const renderPage = async () => {
      try {
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const page = await doc.getPage(currentPage);
        if (isCancelled) return;

        const viewport = page.getViewport({ scale });
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('PDF Page render error:', err);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
    };
  }, [currentPage, scale, loading, error]);

  return (
    <div className="pdf-viewer-container">
      {/* Controls Bar */}
      <div className="pdf-controls">
        <div className="page-nav">
          <button
            className="btn-pdf-nav"
            disabled={currentPage <= 1 || loading}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            ◀ Anterior
          </button>
          <span className="page-counter">
            Página {currentPage} de {numPages}
          </span>
          <button
            className="btn-pdf-nav"
            disabled={currentPage >= numPages || loading}
            onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
          >
            Siguiente ▶
          </button>
        </div>

        <div className="zoom-controls">
          <button
            className="btn-pdf-nav"
            onClick={() => setScale((s) => Math.max(0.7, s - 0.2))}
            title="Reducir zoom"
          >
            -
          </button>
          <span className="zoom-level">{Math.round(scale * 100)}%</span>
          <button
            className="btn-pdf-nav"
            onClick={() => setScale((s) => Math.min(2.5, s + 0.2))}
            title="Aumentar zoom"
          >
            +
          </button>
        </div>

        {dataUrl && (
          <a
            href={dataUrl}
            download={fileName || 'documento.pdf'}
            className="btn-pdf-download"
            title="Descargar archivo original"
          >
            ⬇ Descargar
          </a>
        )}
      </div>

      {/* Render Area */}
      <div className="pdf-canvas-wrapper">
        {loading && (
          <div className="pdf-loading">
            <div className="spinner"></div>
            <p>Cargando documento PDF...</p>
          </div>
        )}

        {error && (
          <div className="pdf-fallback">
            <p className="pdf-error-text">⚠️ {error}</p>
            {dataUrl && (
              <iframe
                src={dataUrl}
                title={fileName || 'Documento PDF'}
                className="pdf-iframe-fallback"
              />
            )}
          </div>
        )}

        <canvas
          ref={canvasRef}
          className="pdf-canvas"
          style={{ display: loading || error ? 'none' : 'block' }}
        />
      </div>
    </div>
  );
}
