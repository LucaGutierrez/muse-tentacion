# Musé Tentación

**Postres • Chocolates • Antojos**

Tienda online de Musé Tentación: chocolates con frutas con forma de donas (en combos x2), cuchareables y más dulces que se vienen.

🌐 Sitio: https://www.musetentacion.com.ar

## Qué tiene

- Inicio animado con la identidad de la marca.
- Catálogo por categorías: **Donas de chocolate con frutas** y **Cuchareables**.
- Detalle de producto con variedades (fruta / sabor) y tamaños.
- Carrito y checkout con pago por **Mercado Pago** (en integración).
- Tope por pedido web: hasta 10 combos de donas (20 unidades) y 10 cuchareables. Los pedidos más grandes se coordinan por WhatsApp o mail.

## Tecnologías

- HTML, CSS y JavaScript, sin frameworks ni build.
- [Supabase](https://supabase.com) para productos, variantes, imágenes y stock.
- Deploy en Vercel.

## Estructura

| Archivo / carpeta | Para qué |
|---|---|
| `index.html` | Inicio |
| `catalogo.html` + `catalogo-supabase.js` | Catálogo por categoría |
| `producto.html` + `producto.js` | Detalle de producto |
| `checkout.html` + `checkout.js` | Carrito, tope de pedido y finalización |
| `como-comprar.html` | Guía de compra |
| `componentes/` + `componentes.js` | Navbar y footer compartidos |
| `supabase.js` | Conexión a Supabase (solo clave pública) |
| `supabase/` | Esquema SQL, datos de ejemplo y guía de configuración |
| `imagenes web/` | Logo e imágenes |

## Correr en local

Los componentes se cargan con `fetch`, así que hace falta un servidor (no abrir el HTML con doble clic):

```bash
npx serve .
```

y abrir la dirección que muestra la consola.

## Configurar Supabase

Ver [`supabase/LEEME.md`](supabase/LEEME.md).

## Contacto

- WhatsApp: [11 3349-1144](https://wa.me/5491133491144)
- Mail: [musetentacionarg@gmail.com](mailto:musetentacionarg@gmail.com)
