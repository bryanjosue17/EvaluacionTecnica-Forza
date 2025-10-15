# Frontend Web — Angular
**Fecha:** 2025-10-15

## Propósito
Aplicación web para autenticación, catálogo, carrito y checkout.

## Pages / Componentes detectados
- (No se detectaron pages/componentes)

## Servicios detectados
- (No se detectaron servicios)

## Rutas detectadas
- (No se detectaron rutas)

## Request típicos (JSON con comentarios)
**Login**
```jsonc
POST /api/v1/auth/login
Body: {"email":"usuario@dominio.com","password":"P@ssw0rd!"}
```
**Listar productos**
```jsonc
GET /api/v1/catalog/products?search=&page=1&size=12
Headers: Authorization: Bearer <jwt>
```
**Agregar al carrito**
```jsonc
POST /api/v1/orders/cart/items
Body: {"userId":12,"productId":101,"quantity":2}
```
