-- =====================================================================
--  MUSÉ TENTACIÓN — COMPROBANTES DE TRANSFERENCIA (Supabase Storage)
-- =====================================================================
--  Cómo usarlo: pegar TODO en Supabase > SQL Editor > Run.
--  Se puede volver a correr sin romper nada.
--
--  Crea el bucket PRIVADO "comprobantes":
--  - Los clientes (clave publicable) solo pueden SUBIR archivos.
--  - Nadie puede verlos, listarlos, cambiarlos ni borrarlos con la
--    clave publicable. Se ven solo desde el panel de Supabase
--    (Storage > comprobantes).
--  - Fotos JPG/PNG/WEBP/HEIC o PDF, hasta 5 MB.
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'comprobantes',
    'comprobantes',
    false,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']
)
on conflict (id) do update
    set public             = excluded.public,
        file_size_limit    = excluded.file_size_limit,
        allowed_mime_types = excluded.allowed_mime_types;

-- Solo SUBIR, en la raíz del bucket, con nombre tipo MT-AAMMDD-1234-xxxxxxxx.ext
drop policy if exists "Clientes suben comprobantes" on storage.objects;
create policy "Clientes suben comprobantes"
    on storage.objects
    for insert
    to anon, authenticated
    with check (
        bucket_id = 'comprobantes'
        and name ~ '^MT-[0-9]{6}-[0-9]{4}-[0-9a-f]{8}\.(jpg|png|webp|heic|pdf)$'
    );

-- No hay políticas de SELECT / UPDATE / DELETE para "comprobantes":
-- con RLS, eso significa que la clave publicable no puede leerlos.
