# Supabase de MUSÉ TENTACIÓN: guía para Luca

Esta carpeta tiene todo lo necesario para crear la base de datos de la tienda.

| Archivo | Para qué sirve |
|---|---|
| `esquema.sql` | Crea las tablas, la seguridad y el lugar donde se guardan las fotos. |
| `datos-ejemplo.sql` | Carga 6 productos **de ejemplo** (precios inventados) para probar la web. |

---

## 1. Crear el proyecto

1. Entrá a https://supabase.com/dashboard e iniciá sesión.
2. Tocá **New project**.
3. Completá:
   - **Name:** `muse-tentacion`
   - **Database Password:** inventá una contraseña fuerte y **guardala en un lugar seguro**, nunca en la web ni en este repositorio.
   - **Region:** `South America (São Paulo)`, que es la más cercana a Argentina.
4. Tocá **Create new project** y esperá 1 o 2 minutos a que termine.

## 2. Crear las tablas

1. En el menú de la izquierda entrá a **SQL Editor**.
2. Tocá **New query**.
3. Abrí `supabase/esquema.sql`, copiá **todo** el contenido y pegalo.
4. Tocá **Run**. Tiene que aparecer *Success. No rows returned*.
   - Si Supabase muestra un aviso de "operaciones destructivas", confirmá: el archivo solo crea cosas.
5. Comprobá en **Table Editor** que existan `productos`, `imagenes_producto` y `variantes_producto`.

## 3. Copiar la URL y la clave publicable

1. Tocá el botón **Connect**, arriba en el panel. También están en **Project Settings → API Keys** y **Project Settings → Data API**.
2. Copiá estos dos datos y pegalos en `supabase.js`:
   - **Project URL**: tiene esta forma: `https://abcdxyz123.supabase.co`
   - **Publishable key**: empieza con `sb_publishable_...`
3. ⚠ **NO** copies la **Secret key** (`sb_secret_...`) ni la `service_role`. Esas claves dan control total de la base y nunca van en la web.

(van en las constantes `SUPABASE_URL` y `SUPABASE_PUBLIC_KEY`).

## 4. Subir las fotos de productos

1. En el menú entrá a **Storage**. Ya existe un bucket llamado **`productos`** que creó el esquema.
2. Entrá al bucket y tocá **Upload files**.
3. Recomendaciones:
   - Formatos JPG, PNG o WEBP de hasta 5 MB. Lo ideal es WEBP de unos 1200 px de lado.
   - Nombres en minúscula, sin espacios ni tildes, por ejemplo `combo-donas-frutilla-1.webp`.
4. Para ver la dirección de una foto, tocala y elegí **Get URL**. Va a quedar así:
   `https://<ID-DEL-PROYECTO>.supabase.co/storage/v1/object/public/productos/combo-donas-frutilla-1.webp`
5. Esa URL va en la columna `imagen` del producto y en `url` dentro de `imagenes_producto`.

## 5. Cargar los productos de ejemplo (opcional, para probar)

1. Abrí `supabase/datos-ejemplo.sql`.
2. Cambiá **una sola línea**, la que dice `base text := 'https://[[ID-DEL-PROYECTO]].supabase.co/...'`, y poné el ID real de tu proyecto. El ID es la parte de la Project URL que va antes de `.supabase.co`.
3. Pegalo en **SQL Editor → New query** y tocá **Run**.
4. Si querés que las fotos se vean, subí al bucket fotos con los nombres que figuran al principio del archivo.
5. Para borrar los ejemplos cuando cargues los productos reales, corré esto:
   ```sql
   delete from public.productos where codigo like 'EJ-%';
   ```

## 6. Cargar y editar productos reales

Se hace todo desde **Table Editor**:

- **productos**: una fila por producto.
  - `categoria`: `donas` o `cuchareables`.
  - `precio`: en pesos y sin puntos, por ejemplo `12900`.
  - `unidades_por_item`: cuántas unidades trae lo que se compra. Los combos de donas llevan `2`. El checkout lo usa para el tope de compra online.
  - `subtitulo`: la línea corta que aparece debajo del nombre.
  - `activo`: si lo desmarcás, el producto se oculta de la web sin borrarlo.
  - `tiene_variantes`: marcalo si el cliente elige fruta o tamaño. En ese caso el precio y el stock se cargan en `variantes_producto`.
- **variantes_producto**: una fila por combinación.
  - `sabor` es obligatorio, por ejemplo `Frutilla`.
  - `tamano` es opcional, por ejemplo `Pote 500 g`.
- **imagenes_producto**: fotos extra para la galería, con `orden` 1, 2, 3...
- Las columnas `material`, `color` y `talle` se completan solas. **No las edites.**

La web solo puede **leer** productos activos. Nadie puede modificar datos desde la web; solo vos, desde el panel.

---

## Mercado Pago: plan (todavía no implementado)

Para cobrar con Mercado Pago hace falta el **Access Token** de la cuenta. Es una clave **secreta**, así que no puede estar en la web. Este es el plan:

1. **Edge Function `crear-preferencia`** en Supabase. Es un pequeño servidor que corre dentro de Supabase.
2. El Access Token se guarda como **secreto** del proyecto y nunca queda en el repositorio. Se carga en **Edge Functions → Secrets** con el nombre `MP_ACCESS_TOKEN`.
3. Flujo de pago:
   1. El checkout llama a la función con los productos (ids y cantidades) y los datos del cliente. En `checkout.js` ya está preparada la función `iniciarPagoMercadoPago(pedido)`.
   2. La función vuelve a leer los precios desde la base, porque nunca confía en los precios que manda el navegador. También vuelve a revisar los topes de compra y crea la "preferencia de pago" en Mercado Pago.
   3. Devuelve el link de pago y la web redirige al cliente a Mercado Pago.
4. Más adelante se suman una tabla `pedidos` y un webhook, para que Mercado Pago avise cuando un pago se aprueba.

Lo que vas a tener que hacer cuando lleguemos a esa etapa:
- Entrar a https://www.mercadopago.com.ar/developers, crear una aplicación y copiar el **Access Token**.
- Pegar el Access Token **solo** en Supabase, en Edge Functions → Secrets. Nunca lo pegues en el chat ni en un archivo.
