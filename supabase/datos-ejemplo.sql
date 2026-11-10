-- =====================================================================
--  MUSÉ TENTACIÓN — DATOS DE EJEMPLO
-- =====================================================================
--  ⚠ PRODUCTOS, PRECIOS Y STOCK SON DE EJEMPLO (ARS). Sirven para probar
--    la web; Luca los reemplaza por los reales desde el Table Editor.
--    Todos los códigos empiezan con "EJ-" para reconocerlos.
--
--  Antes de correr:
--   1. Haber corrido supabase/esquema.sql.
--   2. Cambiar UNA sola línea: la de `base` (más abajo), poniendo el ID del
--      proyecto en lugar de [[ID-DEL-PROYECTO]].
--      Ej: https://abcdxyz123.supabase.co/storage/v1/object/public/productos/
--   3. Subir al bucket "productos" las fotos con estos nombres
--      (si todavía no hay fotos, igual se puede correr: solo se verán rotas):
--        combo-donas-frutas-1.jpg      combo-donas-frutas-2.jpg
--        combo-donas-frutilla.jpg      combo-donas-banana.jpg
--        combo-donas-mix.jpg
--        combo-donas-blanco-frambuesa-1.jpg
--        combo-donas-frutos-rojos-1.jpg
--        cuchareable-frutillas-1.jpg   cuchareable-frutillas-2.jpg
--        cuchareable-chocotorta-1.jpg
--        cuchareable-maracuya-1.jpg
--
--  Para borrar todos los ejemplos después:
--     delete from public.productos where codigo like 'EJ-%';
--  (borra también sus imágenes y variantes, por el "on delete cascade")
-- =====================================================================

do $$
declare
    base text := 'https://[[ID-DEL-PROYECTO]].supabase.co/storage/v1/object/public/productos/';
    p    bigint;
begin

    -- -----------------------------------------------------------------
    -- 1) DONAS — combo de 2, con variantes por fruta
    -- -----------------------------------------------------------------
    insert into public.productos
        (nombre, subtitulo, descripcion, categoria, precio, imagen,
         unidades_por_item, stock, tiene_variantes, codigo, peso,
         ingredientes, alergenos, etiqueta, destacado)
    values
        ('Combo 2 donas de chocolate con frutas',
         'Chocolate con leche y fruta fresca · 2 unidades',
         'Dos donas de chocolate con leche cubiertas con fruta fresca de estación. Elegí tu fruta favorita. Cada combo trae 2 donas.',
         'donas', 12900, base || 'combo-donas-frutas-1.jpg',
         2, 0, true, 'EJ-DONA-01', 240,
         'Chocolate con leche, fruta fresca, harina, manteca, huevo, azúcar.',
         'Contiene leche, huevo y gluten. Puede contener trazas de frutos secos.',
         'Más vendido', true)
    returning id into p;

    insert into public.imagenes_producto (producto_id, url, alt, orden) values
        (p, base || 'combo-donas-frutas-1.jpg', 'Combo de 2 donas de chocolate con frutas', 1),
        (p, base || 'combo-donas-frutas-2.jpg', 'Detalle de dona de chocolate con frutillas', 2);

    insert into public.variantes_producto
        (producto_id, sabor, tamano, precio, stock, imagen, codigo, orden) values
        (p, 'Frutilla',      null, 12900, 15, base || 'combo-donas-frutilla.jpg', 'EJ-DONA-01-FRU', 1),
        (p, 'Banana',        null, 12900, 10, base || 'combo-donas-banana.jpg',   'EJ-DONA-01-BAN', 2),
        (p, 'Mix de frutas', null, 13500,  8, base || 'combo-donas-mix.jpg',      'EJ-DONA-01-MIX', 3);


    -- -----------------------------------------------------------------
    -- 2) DONAS — combo de 2, sin variantes
    -- -----------------------------------------------------------------
    insert into public.productos
        (nombre, subtitulo, descripcion, categoria, precio, imagen,
         unidades_por_item, stock, tiene_variantes, codigo, peso,
         ingredientes, alergenos, etiqueta)
    values
        ('Combo 2 donas de chocolate blanco y frambuesas',
         'Chocolate blanco y frambuesas · 2 unidades',
         'Dos donas bañadas en chocolate blanco con frambuesas y un toque de crocante. Cada combo trae 2 donas.',
         'donas', 13900, base || 'combo-donas-blanco-frambuesa-1.jpg',
         2, 10, false, 'EJ-DONA-02', 240,
         'Chocolate blanco, frambuesas, harina, manteca, huevo, azúcar.',
         'Contiene leche, huevo y gluten.',
         'Nuevo')
    returning id into p;

    insert into public.imagenes_producto (producto_id, url, alt, orden) values
        (p, base || 'combo-donas-blanco-frambuesa-1.jpg', 'Combo de 2 donas de chocolate blanco con frambuesas', 1);


    -- -----------------------------------------------------------------
    -- 3) DONAS — combo de 2, sin variantes
    -- -----------------------------------------------------------------
    insert into public.productos
        (nombre, subtitulo, descripcion, categoria, precio, imagen,
         unidades_por_item, stock, tiene_variantes, codigo, peso,
         ingredientes, alergenos)
    values
        ('Combo 2 donas semiamargas con frutos rojos',
         'Chocolate semiamargo y frutos rojos · 2 unidades',
         'Para los que aman el chocolate intenso: dos donas de semiamargo con frutos rojos. Cada combo trae 2 donas.',
         'donas', 13500, base || 'combo-donas-frutos-rojos-1.jpg',
         2, 12, false, 'EJ-DONA-03', 240,
         'Chocolate semiamargo, frutos rojos, harina, manteca, huevo, azúcar.',
         'Contiene leche, huevo y gluten. Puede contener trazas de frutos secos.')
    returning id into p;

    insert into public.imagenes_producto (producto_id, url, alt, orden) values
        (p, base || 'combo-donas-frutos-rojos-1.jpg', 'Combo de 2 donas semiamargas con frutos rojos', 1);


    -- -----------------------------------------------------------------
    -- 4) CUCHAREABLES — con variantes (fruta + tamaño)
    -- -----------------------------------------------------------------
    insert into public.productos
        (nombre, subtitulo, descripcion, categoria, precio, imagen,
         unidades_por_item, stock, tiene_variantes, codigo,
         ingredientes, alergenos, destacado)
    values
        ('Cuchareable de chocolate y frutas',
         'Capas de mousse de chocolate, crema y fruta',
         'Postre en vaso para comer con cuchara: mousse de chocolate, crema y fruta fresca. Elegí fruta y tamaño.',
         'cuchareables', 8500, base || 'cuchareable-frutillas-1.jpg',
         1, 0, true, 'EJ-CUCH-01',
         'Chocolate, crema de leche, fruta fresca, azúcar, galletitas de chocolate.',
         'Contiene leche y gluten.',
         true)
    returning id into p;

    insert into public.imagenes_producto (producto_id, url, alt, orden) values
        (p, base || 'cuchareable-frutillas-1.jpg', 'Cuchareable de chocolate con frutillas', 1),
        (p, base || 'cuchareable-frutillas-2.jpg', 'Capas del cuchareable vistas de costado', 2);

    insert into public.variantes_producto
        (producto_id, sabor, tamano, precio, stock, codigo, orden) values
        (p, 'Frutilla',     'Vaso 250 g',  8500, 12, 'EJ-CUCH-01-FRU-250', 1),
        (p, 'Frutilla',     'Pote 500 g', 14900,  6, 'EJ-CUCH-01-FRU-500', 2),
        (p, 'Frutos rojos', 'Vaso 250 g',  8900, 10, 'EJ-CUCH-01-FRO-250', 3),
        (p, 'Frutos rojos', 'Pote 500 g', 15500,  0, 'EJ-CUCH-01-FRO-500', 4);  -- sin stock, para probar


    -- -----------------------------------------------------------------
    -- 5) CUCHAREABLES — sin variantes
    -- -----------------------------------------------------------------
    insert into public.productos
        (nombre, subtitulo, descripcion, categoria, precio, imagen,
         unidades_por_item, stock, tiene_variantes, codigo, peso,
         ingredientes, alergenos)
    values
        ('Cuchareable de chocotorta',
         'Chocolinas, dulce de leche y queso crema',
         'El clásico argentino en versión para comer con cuchara.',
         'cuchareables', 9200, base || 'cuchareable-chocotorta-1.jpg',
         1, 14, false, 'EJ-CUCH-02', 250,
         'Galletitas de chocolate, dulce de leche, queso crema, cacao.',
         'Contiene leche y gluten.')
    returning id into p;

    insert into public.imagenes_producto (producto_id, url, alt, orden) values
        (p, base || 'cuchareable-chocotorta-1.jpg', 'Cuchareable de chocotorta', 1);


    -- -----------------------------------------------------------------
    -- 6) CUCHAREABLES — INACTIVO (para comprobar que NO aparece en la web)
    -- -----------------------------------------------------------------
    insert into public.productos
        (nombre, subtitulo, descripcion, categoria, precio, imagen,
         unidades_por_item, stock, tiene_variantes, codigo, activo)
    values
        ('Cuchareable de maracuyá y chocolate blanco',
         'Próximamente',
         'Mousse de maracuyá con chocolate blanco. Todavía no está a la venta.',
         'cuchareables', 9500, base || 'cuchareable-maracuya-1.jpg',
         1, 0, false, 'EJ-CUCH-03', false);

end;
$$;
