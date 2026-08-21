# Esquema futuro e-commerce

Esta etapa implementa `Category -> Product -> ProductVariant` y deja preparado el camino para los siguientes modulos.

## Carrito y usuarios

Propuesta posterior:

- `User`: cuenta de cliente.
- `Address`: direcciones de envio/facturacion asociadas a usuario.
- `Cart`: carrito activo por usuario o sesion anonima.
- `CartItem`: items referenciando `ProductVariant`.

El carrito debe validar stock contra variantes, no contra productos generales.

## Pedidos

Propuesta:

- `Order`
  - `id`
  - `userId`
  - `status`
  - `subtotal`
  - `discount`
  - `shipping`
  - `total`
  - `currency`
  - `createdAt`
  - `updatedAt`

- `OrderItem`
  - `id`
  - `orderId`
  - `productVariantId`
  - `productName`
  - `variantName`
  - `unitPrice`
  - `quantity`
  - `subtotal`

Los pedidos deben guardar copia del nombre, variante y precio al momento de compra. No deben depender del precio actual del catalogo.

## Pagos

Propuesta:

- `Payment`
  - `id`
  - `orderId`
  - `provider`
  - `providerTransactionId`
  - `amount`
  - `currency`
  - `status`

No almacenar datos completos de tarjetas.

## Facturacion

Propuesta:

- `Invoice`
  - `id`
  - `orderId`
  - `number`
  - `status`
  - `issuedAt`

La facturacion debe depender de `Order` y no recalcular importes desde productos actuales.
