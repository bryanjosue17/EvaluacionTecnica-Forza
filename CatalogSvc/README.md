# CatalogSvc — Servicio de Catálogo
**Fecha:** 2025-10-15

## Propósito
Gestión de productos, categorías, inventario y precios.

## Endpoints principales
| Método | Ruta | Descripción |
|---|---|---|
| GET  | `/api/v1/catalog/products` | Lista productos (paginación/filtros). |
| GET  | `/api/v1/catalog/products/{id}` | Detalle de producto. |
| POST | `/api/v1/catalog/products` | Crear producto (admin). |
| PUT  | `/api/v1/catalog/products/{id}` | Actualizar producto. |
| DELETE | `/api/v1/catalog/products/{id}` | Eliminar/Desactivar. |
| GET  | `/api/v1/catalog/categories` | Lista categorías. |

### Request Body
**POST `/products` y PUT `/products/{id}`**
```jsonc
{
  "name": "Camiseta Negra",      // nombre
  "sku": "TSHIRT-BLACK-001",     // SKU
  "price": 199.99,               // precio
  "currency": "GTQ",             // moneda
  "stock": 50,                   // inventario
  "categoryId": 3,               // categoría
  "description": "Corte regular",
  "images": ["https://.../img1.jpg", "https://.../img2.jpg"],
  "status": "ACTIVE"             // ACTIVE|INACTIVE
}
```

### Respuesta (lista)
```jsonc
{
  "page": 1,
  "size": 12,
  "total": 124,
  "items": [{"id": 101, "name": "Camiseta Negra", "sku":"TSHIRT-BLACK-001", "price":199.99, "currency":"GTQ", "stock":50, "categoryId":3, "status":"ACTIVE"}]
}
```

## Seguridad
Operaciones de escritura solo para `admin`.
