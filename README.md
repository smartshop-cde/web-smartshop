# SmartShop Web

Sitio estatico para publicar un catalogo de productos con precio, stock disponible, vendedores por WhatsApp y enlace a la ficha de Google Maps usando Place ID.

## Configurar la tienda

Edita [assets/store-data.js](assets/store-data.js) y cambia:

- `store.domain`: tu dominio comprado en NIC.py.
- `store.googlePlaceId`: el Place ID real de la tienda en Google.
- `products`: nombre, categoria, SKU, precio, stock inicial e imagen.
- `sellers`: nombre, rol, numero de WhatsApp con codigo de pais y mensaje inicial.

Los cambios de stock hechos desde el boton **Gestionar stock** se guardan en el navegador con `localStorage`. Para que el stock se sincronice entre varios vendedores o dispositivos, el siguiente paso seria agregar una base de datos y un panel privado.

## Google Place ID

Cuando tengas el Place ID, reemplaza:

```js
googlePlaceId: "TU_PLACE_ID_AQUI",
```

por el valor real. El sitio arma automaticamente el enlace de Google Maps y agrega datos estructurados `Store` para buscadores.

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
