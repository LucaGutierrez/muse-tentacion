-- =====================================================================
--  MUSÉ TENTACIÓN — ESQUEMA DE BASE DE DATOS (Supabase / PostgreSQL)
-- =====================================================================
--  Cómo usarlo: pegar TODO este archivo en Supabase > SQL Editor > Run.
--  Se puede volver a correr sin romper nada (usa IF NOT EXISTS / OR REPLACE).
--
--  Tablas (mismos nombres que ya usa la web):
--    productos           -> cada dulce del catálogo
--    imagenes_producto   -> galería de fotos de cada producto
--    variantes_producto  -> opciones de compra (sabor/fruta + tamaño/cantidad)
--
--  COMPATIBILIDAD CON EL CÓDIGO ACTUAL
--  El JS heredado de la joyería lee las columnas `material`, `color` y `talle`.
--  Para no romperlo, esas columnas existen como columnas GENERADAS (solo lectura)
--  que copian a las columnas nuevas con nombres de dulces:
--    productos.material          = productos.subtitulo
--    variantes_producto.color    = variantes_producto.sabor
--    variantes_producto.talle    = variantes_producto.tamano
--  Siempre se cargan datos en las columnas nuevas (subtitulo, sabor, tamano).
--  Cuando el JS se actualice a los nombres nuevos, las columnas de
--  compatibilidad se pueden borrar (ver final del archivo).
--
--  SEGURIDAD
--  - RLS activado en todas las tablas.
--  - La clave publicable (anon) solo puede LEER productos activos.
--  - Nadie puede insertar/editar/borrar con la clave publicable.
--    Los productos se cargan desde el panel de Supabase (Table Editor).
-- =====================================================================


-- ---------------------------------------------------------------------
-- Función auxiliar: mantiene actualizado el campo actualizado_en
-- ---------------------------------------------------------------------
create or replace function public.marcar_actualizado_en()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.actualizado_en = now();
    return new;
end;
$$;


-- =====================================================================
--  PRODUCTOS
-- =====================================================================
create table if not exists public.productos (
    id               bigint generated always as identity primary key,

    nombre           text        not null,
    -- Línea corta bajo el nombre. Ej: "Chocolate semiamargo y frutillas frescas"
    subtitulo        text,
    -- Compatibilidad: el JS actual lee `material`. No cargar a mano.
    material         text generated always as (subtitulo) stored,
    descripcion      text,

    -- Categorías. Para sumar una nueva, ver "AGREGAR UNA CATEGORÍA" al final.
    categoria        text        not null
                     check (categoria in ('donas', 'cuchareables')),

    -- Precio base en pesos argentinos (ARS), sin decimales.
    -- Si el producto tiene variantes con precio propio, manda el de la variante.
    precio           integer     not null check (precio >= 0),

    -- Foto principal (URL pública del bucket "productos").
    imagen           text,

    -- Cuántas unidades reales trae cada ítem que se compra.
    -- Ej: "Combo 2 donas" = 2. Lo usa el checkout para el tope por unidades
    -- (donas: máx. 20 unidades = 10 combos; cuchareables: máx. 10).
    unidades_por_item integer    not null default 1 check (unidades_por_item >= 1),

    -- Stock cuando el producto NO tiene variantes (en ítems vendibles: combos, potes...).
    stock            integer     not null default 0 check (stock >= 0),

    -- true = el cliente elige sabor/tamaño (stock y precio en variantes_producto)
    tiene_variantes  boolean     not null default false,

    codigo           text unique,          -- código interno / SKU
    peso             integer,              -- gramos aproximados (opcional)
    ingredientes     text,                 -- lista de ingredientes (opcional)
    alergenos        text,                 -- ej: "Contiene leche, gluten. Puede contener frutos secos."
    etiqueta         text,                 -- ej: "Nuevo", "Más vendido" (opcional)

    destacado        boolean     not null default false,
    activo           boolean     not null default true,   -- false = oculto en la web

    creado_en        timestamptz not null default now(),
    actualizado_en   timestamptz not null default now()
);

comment on table  public.productos is 'Catálogo de MUSÉ TENTACIÓN.';
comment on column public.productos.material is 'Compatibilidad con JS heredado: copia de subtitulo. No editar.';
comment on column public.productos.precio is 'Precio en ARS, entero.';

create index if not exists productos_categoria_activo_idx
    on public.productos (categoria, activo);

drop trigger if exists productos_actualizado_en on public.productos;
create trigger productos_actualizado_en
    before update on public.productos
    for each row execute function public.marcar_actualizado_en();


-- =====================================================================
--  IMÁGENES DE PRODUCTO (galería)
-- =====================================================================
create table if not exists public.imagenes_producto (
    id           bigint generated always as identity primary key,
    producto_id  bigint  not null references public.productos (id) on delete cascade,
    url          text    not null,      -- URL pública del bucket "productos"
    alt          text,                  -- texto alternativo (accesibilidad)
    orden        integer not null default 1,
    creado_en    timestamptz not null default now()
);

create index if not exists imagenes_producto_producto_idx
    on public.imagenes_producto (producto_id, orden);


-- =====================================================================
--  VARIANTES DE PRODUCTO
--  Cada fila = una combinación comprable.
--  Ej: Dona de chocolate con frutas -> sabor "Frutilla" + tamano "Caja x4"
-- =====================================================================
create table if not exists public.variantes_producto (
    id           bigint generated always as identity primary key,
    producto_id  bigint  not null references public.productos (id) on delete cascade,

    -- Primera opción que elige el cliente: fruta / sabor / cobertura.
    -- OBLIGATORIA mientras la web use el código heredado (exige elegir
    -- primero esta opción). Si un producto solo varía por tamaño,
    -- poner un sabor único, ej. "Clásico".
    sabor        text    not null,

    -- Segunda opción (opcional): tamaño o presentación. Ej: "Vaso 250 g", "Pote 500 g"
    -- (Las donas se venden siempre en combo de 2: eso va en productos.unidades_por_item.)
    tamano       text,

    -- Compatibilidad con el JS heredado. No cargar a mano.
    color        text generated always as (sabor)  stored,
    talle        text generated always as (tamano) stored,

    -- Precio propio de esta variante (ARS). Si es NULL se usa productos.precio.
    precio       integer check (precio is null or precio >= 0),
    stock        integer not null default 0 check (stock >= 0),
    imagen       text,                  -- foto específica de la variante (opcional)
    codigo       text unique,
    orden        integer not null default 1,
    activo       boolean not null default true,

    creado_en       timestamptz not null default now(),
    actualizado_en  timestamptz not null default now(),

    unique (producto_id, sabor, tamano)
);

comment on column public.variantes_producto.color is 'Compatibilidad con JS heredado: copia de sabor. No editar.';
comment on column public.variantes_producto.talle is 'Compatibilidad con JS heredado: copia de tamano. No editar.';

create index if not exists variantes_producto_producto_idx
    on public.variantes_producto (producto_id, activo);

drop trigger if exists variantes_producto_actualizado_en on public.variantes_producto;
create trigger variantes_producto_actualizado_en
    before update on public.variantes_producto
    for each row execute function public.marcar_actualizado_en();


-- =====================================================================
--  PERMISOS + ROW LEVEL SECURITY (RLS)
-- =====================================================================
-- Los roles públicos (anon = visitante con clave publicable,
-- authenticated = usuario logueado) solo pueden hacer SELECT.
revoke all on public.productos          from anon, authenticated;
revoke all on public.imagenes_producto  from anon, authenticated;
revoke all on public.variantes_producto from anon, authenticated;

grant select on public.productos          to anon, authenticated;
grant select on public.imagenes_producto  to anon, authenticated;
grant select on public.variantes_producto to anon, authenticated;

alter table public.productos          enable row level security;
alter table public.imagenes_producto  enable row level security;
alter table public.variantes_producto enable row level security;

-- Productos: solo los activos son visibles.
drop policy if exists "Lectura pública de productos activos" on public.productos;
create policy "Lectura pública de productos activos"
    on public.productos
    for select
    to anon, authenticated
    using (activo = true);

-- Imágenes: visibles solo si su producto está activo.
drop policy if exists "Lectura pública de imágenes de productos activos" on public.imagenes_producto;
create policy "Lectura pública de imágenes de productos activos"
    on public.imagenes_producto
    for select
    to anon, authenticated
    using (
        exists (
            select 1
            from public.productos p
            where p.id = imagenes_producto.producto_id
              and p.activo = true
        )
    );

-- Variantes: visibles si la variante y su producto están activos.
drop policy if exists "Lectura pública de variantes activas" on public.variantes_producto;
create policy "Lectura pública de variantes activas"
    on public.variantes_producto
    for select
    to anon, authenticated
    using (
        activo = true
        and exists (
            select 1
            from public.productos p
            where p.id = variantes_producto.producto_id
              and p.activo = true
        )
    );

-- No hay políticas de INSERT / UPDATE / DELETE: con RLS activado,
-- eso significa que la clave publicable NO puede escribir nada.
-- El panel de Supabase (Table Editor) sí puede, porque usa permisos de administrador.


-- =====================================================================
--  STORAGE: bucket público para fotos de productos
-- =====================================================================
-- Público = cualquiera puede VER las fotos por URL (necesario para la web).
-- Sin políticas de subida: solo se suben fotos desde el panel de Supabase.
-- Límite 5 MB por foto; formatos JPG, PNG y WEBP.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'productos',
    'productos',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
    set public             = excluded.public,
        file_size_limit    = excluded.file_size_limit,
        allowed_mime_types = excluded.allowed_mime_types;

-- URL pública de cada foto:
--   https://<ID-DEL-PROYECTO>.supabase.co/storage/v1/object/public/productos/<nombre-del-archivo>


-- =====================================================================
--  NOTAS DE MANTENIMIENTO (no se ejecutan, son instrucciones)
-- =====================================================================
-- AGREGAR UNA CATEGORÍA (ej. "tortas"):
--   alter table public.productos drop constraint productos_categoria_check;
--   alter table public.productos add constraint productos_categoria_check
--       check (categoria in ('donas', 'cuchareables', 'tortas'));
--   (y avisar para sumarla al menú y a los nombres del catálogo en la web)
--
-- BORRAR COLUMNAS DE COMPATIBILIDAD (solo cuando el JS ya use subtitulo/sabor/tamano):
--   alter table public.productos          drop column material;
--   alter table public.variantes_producto drop column color;
--   alter table public.variantes_producto drop column talle;
