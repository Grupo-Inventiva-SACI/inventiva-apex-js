# invUtils — Utilidades para Oracle APEX

Biblioteca JavaScript para trabajar con ítems de página e Interactive Grids. Prioriza la legibilidad para personas y agentes IA y el mantenimiento entre versiones de APEX.

## Objetivo

Este paquete está 100% enfocado al uso en Oracle APEX, desde la versión 24.1 hasta la versión 26.1, posterior a esas versiones requerirá nueva validación para su uso.

Este es el alcance objetivo, no una certificación de pruebas en todas esas versiones. Consultar la [validación por versión](docs/desarrollo.md#mantenimiento-y-validación-por-versión).

## Instalación rápida

1. Subir [invUtils.js](invUtils.js) a **Shared Components → Static Application Files**.
2. En **User Interface Attributes → JavaScript → File URLs**, agregar:

```text
#APP_FILES#invUtils.js
```

Requiere `apex` y `apex.jQuery`, proporcionados por APEX; no requiere npm ni compilación. Cargar el archivo una sola vez. Las operaciones sobre grillas se ejecutan cuando la región ya está inicializada. Ver la [instalación detallada](docs/manual.md#instalación-en-oracle-apex).

## Uso básico

Desde una Dynamic Action de tipo **Execute JavaScript Code**:

```javascript
invUtils.mostrarAlerta(200, "Proceso completado");
const total = invUtils.item.leerNumero("P10_TOTAL");
const importe = invUtils.grid.leerCelda("Prima", "MONTO_TOTAL", 1);
```

`invUtils` agrupa las utilidades generales; `invUtils.item`, las de ítems; e `invUtils.grid`, las de grillas. `"Prima"` es el Static ID de la región y `"MONTO_TOTAL"`, el nombre de columna.

## Documentación

| Guía | Contenido |
|---|---|
| [Desarrollo](docs/desarrollo.md) | Cómo agregar y publicar funciones, reglas de nombres y validación. |
| [Manual de uso](docs/manual.md) | Instalación detallada y ejemplos organizados por tarea. |
| [Referencia de API](docs/referencia-api.md) | Firmas, parámetros, retornos y efectos de las funciones. |
| [Migración](docs/migracion.md) | Equivalencias entre los nombres originales, los anteriores en español y los actuales. |

[apexUtils.js](apexUtils.js) se conserva como referencia original; [README.html](README.html) contiene documentación anterior. El código y la documentación vigente se mantienen juntos en este repositorio.

**Autor:** Luis Talavera. Licencia: [MIT](LICENSE.md).

**Reconstruido por:** [@Ramphire](https://github.com/Ramphire)
