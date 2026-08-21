# SmartShop Web

Sitio estatico con backend SQLite opcional para publicar el catalogo profesional de SmartShop: productos con precio, stock disponible, vendedores por WhatsApp, redes sociales, ubicacion y mapa embebido.

## Configurar la tienda

Edita [assets/store-data.js](assets/store-data.js) y cambia:

- `store.domain`: dominio final de la tienda.
- `store.address`: direccion comercial usada para el mapa y el boton "Como llegar".
- `store.googlePlaceId`: Place ID opcional para enriquecer enlaces y datos estructurados.
- `store.social`: enlaces de Instagram y TikTok. Actualmente ambos usan `@smartshopcde`.
- `products`: nombre, categoria, codigo, marca, variante, precio, stock inicial e imagen.
- `sellers`: nombre, rol, numero de WhatsApp con codigo de pais y mensaje inicial.

## Panel privado

Abre [admin.html](admin.html) para editar la tienda, productos, stock y vendedores desde una interfaz privada.

- PIN inicial: `2026`.
- Con `server.py`, los cambios se guardan en `data/smartshop.sqlite3`.
- Si abres los HTML directamente sin servidor, el sitio usa los datos estaticos como respaldo.
- El panel incluye `noindex,nofollow`, pero el PIN no reemplaza una autenticacion fuerte para produccion publica.

## Base de datos

Para usar la base SQLite local:

```bash
python server.py
```

Luego abre:

```text
http://127.0.0.1:8000
```

La base se crea automaticamente desde [data/seed.json](data/seed.json) la primera vez que corre el servidor.

Al iniciar, el servidor tambien migra bases existentes: agrega `code`, `brand` y `variant` si faltan, asigna codigos a productos antiguos y crea un indice unico para `products.code`.

## Codigos de producto

El codigo visible de cada producto se guarda en `products.code`.

- Tiene exactamente 5 digitos, entre `10000` y `99999`.
- Se genera en `server.py` al guardar catalogo o importar Excel si viene vacio.
- No cambia al editar un producto existente.
- Si hay colision, el servidor genera otro codigo disponible.
- SQLite mantiene `idx_products_code_unique` para evitar duplicados.

## Excel

Desde el panel administrador puedes:

- **Exportar Excel**: descarga `smartshop-productos.xlsx`.
- **Importar Excel**: agrega, actualiza o elimina productos por `code`; `sku` queda como campo interno opcional.

Columnas principales:

- `accion`: dejar vacio para agregar/actualizar, usar `eliminar` para quitar.
- `code`: opcional para productos nuevos; si esta vacio, el servidor genera uno.
- `sku`: opcional y compatible con catalogos anteriores.
- `name`, `category`, `price`, `stock`.
- `featured`: `SI` o `NO`.
- `badge`, `brand`, `variant`, `condition`, `warranty`, `delivery`, `description`, `details`.

Las fotos no se cargan desde Excel. Despues de importar, edita `Imagen URL` directamente en el panel de administrador.

## Mapa y ubicacion

La home usa un iframe de Google Maps con `q=<direccion>&output=embed`, por lo que no requiere API key ni expone claves privadas. El boton "Como llegar" usa `https://www.google.com/maps/dir/?api=1&destination=<direccion codificada>`.

`store.googlePlaceId` puede mantenerse para datos estructurados y enlaces internos, pero no se muestra como texto tecnico al cliente final.

## Publicar con dominio NIC.py

Como es un sitio estatico, puedes subir estos archivos a un hosting estatico o a un servidor web tradicional.

Pasos generales:

1. Sube `index.html` y la carpeta `assets` al hosting.
2. En el panel DNS del dominio de NIC.py, apunta el dominio al hosting con los registros que te entregue el proveedor.
3. Si el proveedor maneja DNS completo, cambia los nameservers en NIC.py.
4. Activa HTTPS en el hosting.
5. Cambia `store.domain` para que coincida con el dominio final.

## Redireccion de www

El servidor incluido redirige automaticamente:

```text
https://www.smartshop.com.py
```

hacia:

```text
https://smartshop.com.py
```

Para que funcione en produccion tambien debes configurar el hosting/DNS:

1. Crea el registro DNS `www` apuntando al mismo hosting que `smartshop.com.py`.
2. En el hosting, agrega `www.smartshop.com.py` como dominio alternativo.
3. Activa redireccion permanente `301` de `www.smartshop.com.py` a `smartshop.com.py`.
4. Activa HTTPS para ambos dominios.

## Probar localmente

Puedes abrir [index.html](index.html) directamente en el navegador. No requiere instalacion de dependencias.
