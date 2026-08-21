# SmartShop Web

Sitio estatico para publicar un catalogo profesional de productos con precio, stock disponible, vendedores por WhatsApp, redes sociales, ubicacion y enlace a la ficha de Google Maps usando Place ID.

## Configurar la tienda

Edita [assets/store-data.js](assets/store-data.js) y cambia:

- `store.domain`: tu dominio comprado en NIC.py.
- `store.googlePlaceId`: el Place ID real de la tienda en Google.
- `store.social`: enlaces de Instagram y TikTok. Actualmente ambos usan `@smartshopcde`.
- `products`: nombre, categoria, SKU, precio, stock inicial e imagen.
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

## Excel

Desde el panel administrador puedes:

- **Exportar Excel**: descarga `smartshop-productos.xlsx`.
- **Importar Excel**: agrega, actualiza o elimina productos por SKU.

Columnas principales:

- `accion`: dejar vacio para agregar/actualizar, usar `eliminar` para quitar.
- `sku`, `name`, `category`, `price`, `stock`.
- `featured`: `SI` o `NO`.
- `badge`, `condition`, `warranty`, `delivery`, `description`, `details`.

Las fotos no se cargan desde Excel. Despues de importar, edita `Imagen URL` directamente en el panel de administrador.

## Google Place ID

El Place ID actual esta cargado en `store.googlePlaceId`:

```js
googlePlaceId: "ChIJxXxmNJqF9pQRmS5k26rNhvE",
```

El sitio arma automaticamente el enlace de Google Maps y agrega datos estructurados `Store` y `Offer` para buscadores.

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
