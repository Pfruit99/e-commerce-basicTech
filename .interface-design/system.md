# Sistema de diseño: basicTech

## Dirección

"Datasheet técnico": precisa, fría, legible. Quien compra hardware compara specs y precio; quien administra revisa cifras y stock. Mundo: hoja de especificaciones, banco de pruebas, PCB, aluminio y grafito.

## Color

- Un solo acento turquesa (hue 195): `--primary`. Significa acción, enlace o estado activo. No se usa como decoración.
- Neutros con croma mínimo (0.002 a 0.016) hacia el hue 195, en claro y oscuro. Un solo hue: solo cambia la luminosidad entre superficies.
- Destructivo solo para errores y stock bajo o agotado.
- Siempre tokens semánticos (`bg-card`, `text-muted-foreground`), nunca grises literales.

## Profundidad

Solo bordes sutiles, sin sombras. `Card` ya trae `ring-1 ring-foreground/10`; imágenes y categorías usan `ring-1 ring-border`, y `ring-primary` al pasar el cursor. Los separadores de sección son `border-b`.

## Tipografía

- Geist para texto, Geist Mono para specs, marca, SKU, índices y cifras.
- `.spec-label`: mono, 11 px, 500, mayúsculas, tracking amplio, `text-muted-foreground`. Para etiquetas y marcas.
- `.spec-value`: mono con `tabular-nums`. Para precios, importes, cantidades y specs.
- Jerarquía por peso y color más que por tamaño. Cifra héroe: 30 px / 600 / tracking ajustado. Nombre de producto: 15 px / 500.
- `text-wrap: balance` en h1 a h3 y `pretty` en párrafos (en `globals.css`).

## Espaciado y forma

Base de 4 px. Tienda más holgada, admin más denso. Radio base `0.625rem`: `rounded-xl` en imágenes y tarjetas, `rounded-md` en chips y etiquetas.

## Patrones

- **Tarjeta de producto** (`product-card.tsx`): marca `.spec-label` → nombre 15/500 → specs mono separadas por `·` → precio `.spec-value` 16/600; stock bajo en destructivo.
- **Encabezado de sección** (home): `.spec-label` con índice (`01 / Ranking`) sobre el título 2xl/600, con `border-b`.
- **Tarjeta de métrica** (admin): etiqueta `.spec-label`, icono atenuado, cifra 30 px tabular, nota opcional a su lado.
- **Placeholder de imagen** (`product-image.tsx`): `bg-muted/50` con cuadrícula de 20 px hecha con `--border`.
- **Banner**: tarjeta con borde, etiqueta en `text-primary`, botón primario con flecha. Sin bloque de color pleno.

## Pendiente

Aplicar la firma a detalle de producto, carrito, checkout, cuenta y el resto del admin (tablas de productos, pagos y usuarios). Revisar todo en navegador, en claro, oscuro y ancho móvil.
