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
- Los cambios se guardan en el navegador con `localStorage`.
- El boton **Exportar datos** descarga un nuevo `store-data.js` para reemplazar el archivo publicado.
- El panel incluye `noindex,nofollow`, pero en un sitio estatico el PIN no es seguridad real de servidor. Para acceso privado real entre varios usuarios, el siguiente paso seria agregar backend, base de datos y autenticacion.

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

## Probar localmente

Puedes abrir [index.html](index.html) directamente en el navegador. No requiere instalacion de dependencias.
