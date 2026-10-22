# Manual de uso

[Inicio](../README.md) · [Desarrollo](desarrollo.md) · [Manual](manual.md) · [API](referencia-api.md) · [Migración](migracion.md)

## Instalación en Oracle APEX

Referencias de API: **24.1 y 26.1**. Este archivo se carga como JavaScript de navegador; no requiere `import`, npm ni un proceso de compilación.

1. En **Shared Components → Static Application Files**, cargar `invUtils.js`.
2. Abrir **Shared Components → User Interface Attributes → JavaScript → File URLs**.
3. Agregar la referencia del archivo, sin etiquetas `<script>`:

```text
#APP_FILES#invUtils.js
```

También puede cargarse solo en una página desde **JavaScript → File URLs**. Elegir un único punto de carga para evitar reinicializar el estado. Para usar una versión minificada, primero verificar que exista `invUtils.min.js` y utilizar `#APP_FILES#invUtils#MIN#.js`.

La biblioteca requiere `apex` y `apex.jQuery`, proporcionados por APEX. Las operaciones sobre regiones se ejecutan cuando el IG ya está inicializado, por ejemplo desde una Dynamic Action o desde **Execute when Page Loads**. No dependen de `apexUtils.js`.

Referencias oficiales: [JavaScript en APEX 24.1](https://docs.oracle.com/en/database/oracle/apex/24.1/aexjs/index.html), [JavaScript en APEX 26.1](https://docs.oracle.com/en/database/oracle/apex/26.1/aexjs/index.html).

## Organización y alcance

| Acceso | Responsabilidad | Ejemplo |
|---|---|---|
| `invUtils` | Alertas, números y control de ejecuciones | `invUtils.mostrarAlerta(200, "Proceso completado")` |
| `invUtils.item` | Lectura numérica de ítems de página | `invUtils.item.leerNumero("P10_TOTAL")` |
| `invUtils.grid` | Interactive Grids, cálculos, navegación y sincronización con ítems | `invUtils.grid.leerCelda("Prima", "MONTO_TOTAL", 1)` |

Solo se publica `window.invUtils`. Los temporizadores, configuraciones, valores anteriores y auxiliares quedan dentro del módulo. El listado del `return` final es la fuente de verdad de la API pública.

`apexUtils.js` se conserva como referencia original. Esta reorganización no crea alias globales para `apexUtils`, `apexGridUtils` ni las funciones sueltas. Las páginas de prueba deben actualizar sus llamadas usando la [guía de migración](migracion.md). [README.html](../README.html) corresponde a la documentación anterior; este manual describe [invUtils.js](../invUtils.js).

Se conservaron los parámetros, opciones y datos devueltos por las funciones existentes. Por eso opciones como `sourceColumns`, `targetColumn`, `decimalPlaces`, `refresh` y retornos como `success`, `data` o `sum` siguen con su nombre original. Los métodos propios de los objetos de fórmulas, sumas y control de depuración también se nombran en español.

## Ejemplos de uso

### Alertas, números e ítems

```javascript
invUtils.mostrarAlerta(200, "Proceso completado");
invUtils.mostrarAlerta(500, "No se pudo completar el proceso");

// El ítem contiene un texto con formato europeo, por ejemplo "1.234,56".
const importe = invUtils.item.leerNumero("P10_TOTAL", 0);
const [costo, cantidad] = invUtils.item.leerNumeros([
    "P10_COSTO", "P10_CANTIDAD"
]);

invUtils.normalizarNumero("1.234,56");       // 1234.56
invUtils.formatearNumeroEuropeo(1234.56, 2); // "1.234,56"

invUtils.posponerEjecucion("recalcular_total", function () {
    // Ejecutar el cálculo de la página.
}, 300);
```

`item.leerValorNumerico` es un nombre alternativo de `item.leerNumero`; también devuelve un número. No es un lector genérico de texto. `leerNumero` conserva la interpretación europea: elimina puntos de miles y usa la coma decimal. No debe usarse para un ítem cuyo texto utiliza el punto como separador decimal. `normalizarNumero` conserva sus heurísticas originales y no sustituye una conversión explícita según NLS.

En JavaScript, un número se escribe `1234.56`. El valor con formato europeo se escribe como texto: `"1.234,56"`. Escribir `1.234,56` sin comillas en una llamada pasa dos argumentos distintos.

### Lectura y asignación en una grilla

```javascript
// "Prima" es el Static ID de la región; "MONTO_TOTAL" es el nombre de columna.
const valor = invUtils.grid.leerCelda("Prima", "MONTO_TOTAL", 1);
const seleccionado = invUtils.grid.leerCeldaSeleccionada("Prima", "MONTO_TOTAL");

invUtils.grid.asignarCelda("Prima", "MONTO_TOTAL", 1, "1.234,56");
invUtils.grid.asignarCeldaSeleccionada("Prima", "IND_NO_INCLUIR", "S");
```

Las funciones de acceso por índice utilizan `1` para la primera fila y `-1` para la selección. Operan sobre los registros cargados en el modelo; no implican obtener todas las filas del servidor. `leerFilaActual` utiliza el contexto del elemento con foco y requiere indicar las columnas.

### Cálculos automáticos

```javascript
invUtils.grid.configurarCalculoAutomatico("Prima", {
    sourceColumns: ["CANTIDAD", "COSTO"],
    targetColumn: "TOTAL",
    formula: function (valores) {
        return valores.CANTIDAD * valores.COSTO;
    },
    decimalPlaces: 2,
    autoTrigger: true,
    triggerOnLoad: true
});

// Alternativa para cantidad × costo:
// invUtils.grid.configurarMultiplicacion("Prima", "CANTIDAD", "COSTO", "TOTAL", 2);
```

Elegir una sola configuración para el mismo cálculo. Las suscripciones se vinculan al modelo disponible al configurarlas; probar su ciclo de vida si la página reemplaza el modelo. `estaInicializado` solo comprueba el almacén interno de configuraciones, no que una región de APEX está lista.

### Sincronización entre una grilla y un ítem

```javascript
// Selección/cambios de la grilla → ítem de página.
invUtils.grid.sincronizarItem("Prima", "MONTO_TOTAL", "P10_TOTAL");

// Alternativa: sincronización en ambas direcciones.
// invUtils.grid.sincronizarItemBidireccional("Prima", "MONTO_TOTAL", "P10_TOTAL", {
//     debug: false,
//     pushInitialGridToItem: true,
//     pushInitialItemToGrid: false,
//     asPopupLov: false
// });
```

Estas funciones enlazan un ítem de página con la fila seleccionada. No son una implementación de la sincronización del editor activo mediante `setActiveRecordValue`. Esta reorganización no agrega las utilidades nuevas que se discutieron como propuestas.

### Extracción y carga de datos

```javascript
const resultado = invUtils.grid.extraerDatos({
    regionId: "Prima",
    campos: [
        { nombre: "CANTIDAD", alias: "cantidad" },
        { nombre: "COSTO", alias: "costo" }
    ],
    campoDestino: "P10_DATOS",
    formatoSalida: "json"
});

if (resultado.success) {
    console.log(resultado.count, resultado.data);
}

// Variante abreviada:
// invUtils.grid.extraerCampos("Prima", ["CANTIDAD", "COSTO"], "P10_DATOS");

// Cargar datos directamente (revisar las opciones de limpieza y refresco):
// invUtils.grid.cargarDatosDirectos("Prima", [{ CANTIDAD: 2, COSTO: "10,00" }]);
```

`extraerDatos(configuracion)` corresponde a la antigua `extraerDatosIG`; `extraerCampos(regionId, campos, campoDestino)` corresponde a la antigua función abreviada `extraerDatos`.

## Consultas relacionadas

- Consultar las firmas y los efectos de cada familia en la [referencia de API](referencia-api.md).
- Revisar las [limitaciones y validaciones por versión](desarrollo.md#mantenimiento-y-validación-por-versión), especialmente antes de refrescar una región con cambios pendientes.
- Para actualizar llamadas existentes, consultar la [guía de migración](migracion.md).
