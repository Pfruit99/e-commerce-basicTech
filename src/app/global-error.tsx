"use client";

import { useEffect } from "react";

/** Reemplaza el layout raíz cuando este falla: define su propio documento y no recibe los estilos globales. */
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          margin: 0,
        }}
      >
        <div role="alert">
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Algo salió mal</h1>
          <p style={{ marginBottom: "1rem" }}>No pudimos cargar basicTech. Probá de nuevo en unos segundos.</p>
          {error.digest && <p style={{ fontSize: "0.75rem" }}>Código: {error.digest}</p>}
          <button type="button" onClick={() => retry()} style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
