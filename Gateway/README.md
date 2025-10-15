# Gateway / Reverse Proxy
**Fecha:** 2025-10-15

## Propósito
Ruteo hacia microservicios, validación JWT, CORS y trazabilidad.

## Mapa de rutas (ejemplo)
```jsonc
{
  "/api/v1/auth/*": "http://authsvc:8080",
  "/api/v1/catalog/*": "http://catalogsvc:8080",
  "/api/v1/orders/*": "http://ordersvc:8080"
}
```

## Seguridad
Validación de token en rutas protegidas y CORS restringido.
