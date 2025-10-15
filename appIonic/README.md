# Aplicación Móvil — Ionic
**Fecha:** 2025-10-15

## Propósito
Cliente móvil/PWA (Angular + Ionic) con autenticación y flujo de compra.

## Pages / Componentes detectados
- (No se detectaron pages/componentes)

## Servicios detectados
- (No se detectaron servicios)

## Rutas detectadas
- (No se detectaron rutas)

## Request típicos
**Refresh Token**
```jsonc
POST /api/v1/auth/refresh
Body: {"refreshToken":"<token_guardado>"}
```
**Checkout**
```jsonc
POST /api/v1/orders/checkout
Body: {
  "userId": 12,
  "paymentMethod": "CARD",
  "shippingAddress": {"fullName":"Nombre","address1":"Calle 1-23","city":"Guatemala","country":"GT","zip":"01001","phone":"+50212345678"},
  "notes": "Entregar en oficina."
}
```
