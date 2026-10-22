# invUtils — Utilidades para Oracle APEX

## Cómo agregar nuevas funciones

1. Abrir `invUtils.js` y ubicar la sección de implementación correspondiente: **GENERAL**, **ITEM** o **GRID**. Las funciones que combinan una grilla con un ítem pertenecen a GRID.
2. Declarar la función **dentro del módulo**, con un nombre en español y en `camelCase`. Documentar con JSDoc qué hace, sus parámetros y su retorno. Las funciones comparten un ámbito privado y pueden llamarse directamente por su nombre.
3. Buscar **API PÚBLICA — PUBLICAR AQUÍ LAS NUEVAS FUNCIONES**, al final del archivo. Agregar el nombre al `return`: en la raíz para utilidades generales, dentro de `item` para ítems o dentro de `grid` para grillas. Si es una función auxiliar interna, no publicarla.
4. Agregar su firma y un ejemplo a este README. Mantener en inglés los nombres de métodos, eventos y opciones de Oracle APEX; no traducir, por ejemplo, `model.setValue` o `getSelectedRecords`.
5. Validar sintaxis y probar el caso real en una página APEX: resultado, parámetros inválidos y, si usa una grilla, selección, edición y refresco. Si registra eventos, comprobar también que no duplique suscripciones.
6. Subir la nueva versión del archivo a APEX y comprobar que el navegador cargue esa versión.

Ejemplo didáctico de una futura función (no incluida actualmente):

```javascript
// Dentro del módulo, en la sección ITEM:
/**
 * Lee el valor de un ítem de página.
 * @param {string} nombreItem - Nombre del ítem, por ejemplo P10_OBSERVACION.
 * @returns {string|string[]} Valor devuelto por el ítem.
 */
function obtenerValorItem(nombreItem) {
    return apex.item(nombreItem).getValue();
}

// En el return final, agregar una propiedad a item:
item: {
    obtenerNumero,
    obtener,
    obtenerNumeros,
    obtenerValor: obtenerValorItem
}

// Después de publicarla, desde una Dynamic Action:
const observacion = invUtils.item.obtenerValor("P10_OBSERVACION");
```

El nombre de la propiedad pública puede ser distinto al nombre interno. El ejemplo utiliza esa posibilidad para evitar colisiones entre funciones del módulo. Las funciones internas no necesitan añadirse a `window`.

## Reglas de nombres

Prioridad: **precisión → consistencia → brevedad**. Estas reglas se aplican a funciones públicas y auxiliares propios de la biblioteca.

- Usar nombres cortos, en español y en `camelCase`, con un máximo recomendado de **tres palabras** (por ejemplo, `leerCeldaSeleccionada`). Se permiten excepciones documentadas cuando acortar el nombre oculta una diferencia de comportamiento. No contar simplemente las mayúsculas ni omitir letras para cumplir el límite.
- Seguir **verbo + objeto + calificativo opcional**. Para consultar valores de ítems o celdas, usar `leer`; para establecerlos, `asignar`.
- Mantener un vocabulario consistente: no alternar `get`, `obtener` y `leer`, ni `set`, `establecer` y `asignar` para la misma intención.
- Evitar concatenar acciones con `Y`, como `asignarYRefrescar`. El nuevo nombre y su documentación deben conservar la información sobre los efectos de la función. No eliminar comportamientos para abreviar el nombre.
- Aprovechar el contexto de `invUtils.item` y `invUtils.grid`: evitar repetir `Item`, `Grid` o `IG` cuando no aporta información. Conservarlo cuando distingue el destino de una operación entre grilla e ítem.
- Evitar abreviaturas poco claras y calificativos vagos como `Robusto`, `Seguro`, `Simple` o `Mejorado`. Nombrar el mecanismo o la diferencia concreta.
- Para consultas booleanas, usar `es`, `esta`, `tiene` o `puede`, por ejemplo `estaInicializado`.
- Distinguir singular y plural: `leerNumero` devuelve un número; `leerNumeros`, varios.
- Reservar `guardar` para operaciones de persistencia real. Asignar un valor al modelo del navegador no equivale a guardarlo en la base de datos.
- No traducir ni renombrar métodos, eventos u opciones de Oracle APEX. Estas reglas no cambian contratos externos como `model.setValue`, `onChange` o `getSelectedRecords`.

| Intención | Verbo | Ejemplo |
|---|---|---|
| Consultar valores | `leer` | `leerCelda` |
| Establecer valores | `asignar` | `asignarCelda` |
| Quitar contenido | `limpiar` | `limpiarCelda` |
| Incorporar registros | `cargar` | `cargarDatos` |
| Recopilar registros o campos | `extraer` | `extraerDatos` |
| Definir opciones o comportamiento | `configurar` | `configurarCalculo` |
| Ejecutar o repetir una fórmula | `calcular` / `recalcular` | `calcularTotal` |
| Coordinar valores | `sincronizar` | `sincronizarItem` |
| Cambiar la selección | `seleccionar` | `seleccionarFila` |
| Dar foco | `enfocar` | `enfocarCelda` |
| Navegar hasta una celda | `ir` | `irACelda` |
| Permitir o impedir una operación | `habilitar` / `deshabilitar` | `habilitarEdicion` |

No usar estos verbos como sinónimos intercambiables: `enfocar`, `seleccionar` e `ir` describen operaciones diferentes. Las funciones existentes que realizan varias acciones deben documentar esas acciones aunque su nombre no las enumere.

## Objetivo y versiones de referencia

Este paquete está 100% enfocado al uso en Oracle APEX, desde la versión 24.1 hasta la versión 26.1, posterior a esas versiones requerirá nueva validación para su uso.

Este es el alcance objetivo del proyecto, no una certificación de pruebas ya realizadas en todas esas versiones. Mantener la legibilidad para personas y agentes IA y validar las operaciones usadas en cada versión antes de publicar.

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
| `invUtils` | Alertas, números y control de ejecuciones | `invUtils.alerta(200, "Proceso completado")` |
| `invUtils.item` | Lectura numérica de ítems de página | `invUtils.item.obtenerNumero("P10_TOTAL")` |
| `invUtils.grid` | Interactive Grids, cálculos, navegación y sincronización con ítems | `invUtils.grid.obtenerValorCelda("Prima", "MONTO_TOTAL", 1)` |

Solo se publica `window.invUtils`. Los temporizadores, configuraciones, valores anteriores y auxiliares quedan dentro del módulo. El listado del `return` final es la fuente de verdad de la API pública.

`apexUtils.js` se conserva como referencia original. Esta reorganización no crea alias globales para `apexUtils`, `apexGridUtils` ni las funciones sueltas. Las páginas de prueba deben actualizar sus llamadas usando el catálogo al final de este documento. `README.html` corresponde a la documentación anterior; este README describe `invUtils.js`.

Se conservaron los parámetros, opciones y datos devueltos por las funciones existentes. Por eso opciones como `sourceColumns`, `targetColumn`, `decimalPlaces`, `refresh` y retornos como `success`, `data` o `sum` siguen con su nombre original. Los métodos propios de los objetos de fórmulas, sumas y control de depuración también se nombran en español.

## Ejemplos de uso

### Alertas, números e ítems

```javascript
invUtils.alerta(200, "Proceso completado");
invUtils.alerta(500, "No se pudo completar el proceso");

// El ítem contiene un texto con formato europeo, por ejemplo "1.234,56".
const importe = invUtils.item.obtenerNumero("P10_TOTAL", 0);
const [costo, cantidad] = invUtils.item.obtenerNumeros([
    "P10_COSTO", "P10_CANTIDAD"
]);

invUtils.normalizarNumero("1.234,56");       // 1234.56
invUtils.formatearNumeroEuropeo(1234.56, 2); // "1.234,56"

invUtils.posponerEjecucion("recalcular_total", function () {
    // Ejecutar el cálculo de la página.
}, 300);
```

`item.obtener` es una abreviatura de `item.obtenerNumero`; también devuelve un número. No es un lector genérico de texto. `obtenerNumero` conserva la interpretación europea: elimina puntos de miles y usa la coma decimal. No debe usarse para un ítem cuyo texto utiliza el punto como separador decimal. `normalizarNumero` conserva sus heurísticas originales y no sustituye una conversión explícita según NLS.

En JavaScript, un número se escribe `1234.56`. El valor con formato europeo se escribe como texto: `"1.234,56"`. Escribir `1.234,56` sin comillas en una llamada pasa dos argumentos distintos.

### Lectura y asignación en una grilla

```javascript
// "Prima" es el Static ID de la región; "MONTO_TOTAL" es el nombre de columna.
const valor = invUtils.grid.obtenerValorCelda("Prima", "MONTO_TOTAL", 1);
const seleccionado = invUtils.grid.obtenerValorCeldaSeleccionada("Prima", "MONTO_TOTAL");

invUtils.grid.establecerValorCelda("Prima", "MONTO_TOTAL", 1, "1.234,56");
invUtils.grid.establecerValorCeldaSeleccionada("Prima", "IND_NO_INCLUIR", "S");
```

Las funciones de acceso por índice utilizan `1` para la primera fila y `-1` para la selección. Operan sobre los registros cargados en el modelo; no implican obtener todas las filas del servidor. `obtenerFilaActual` utiliza el contexto del elemento con foco y requiere indicar las columnas.

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
// invUtils.grid.configurarCantidadPorCosto("Prima", "CANTIDAD", "COSTO", "TOTAL", 2);
```

Elegir una sola configuración para el mismo cálculo. Las suscripciones se vinculan al modelo disponible al configurarlas; probar su ciclo de vida si la página reemplaza el modelo. `estaInicializado` solo comprueba el almacén interno de configuraciones, no que una región de APEX está lista.

### Sincronización entre una grilla y un ítem

```javascript
// Selección/cambios de la grilla → ítem de página.
invUtils.grid.sincronizarConItem("Prima", "MONTO_TOTAL", "P10_TOTAL");

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

## Mantenimiento y validación por versión

El cambio organiza y renombra la biblioteca existente; no certifica el comportamiento completo de todos sus métodos en APEX 24.1 o 26.1. Antes de publicar, validar en ambas versiones las operaciones usadas por la aplicación. Se conservan variantes históricas que intentan métodos opcionales como `markDirty`, `commitRecord` o `commit`, y accesos a datos internos como `_meta`; no deben tomarse como una garantía de API pública de Oracle.

- Para nuevas funciones, preferir las APIs documentadas: [modelo 24.1](https://docs.oracle.com/en/database/oracle/apex/24.1/aexjs/model.html), [modelo 26.1](https://docs.oracle.com/en/database/oracle/apex/26.1/aexjs/model.html), [grid 24.1](https://docs.oracle.com/en/database/oracle/apex/24.1/aexjs/grid.html), [grid 26.1](https://docs.oracle.com/en/database/oracle/apex/26.1/aexjs/grid.html).
- Los métodos `confirmarCambios` y las variantes `ConConfirmacion` conservan su lógica anterior. Su nombre no implica un guardado confirmado en base de datos. Probar el guardado real mediante el flujo de APEX.
- `refrescar` y `refrescarSeguro`, cuando se solicita refrescar la región completa, conservan una llamada a `model.clearChanges()` antes del refresco. No utilizarlos como sustituto de guardar los cambios pendientes.
- No asumir que una fila seleccionada es la fila en edición. Algunas variantes heredadas interpretan de manera diferente la selección; validarlas antes de elegirlas para una nueva página.
- Las operaciones diferidas, como `recalcularFilas`, usan temporizadores y no devuelven una promesa que permita esperar su finalización.
- Se conserva la activación automática de restauración de foco a los 100 ms de cargar el archivo. Para deshabilitarla, llamar `invUtils.grid.deshabilitarRestauracionFoco()` después de esa inicialización.
- Al modificar funciones, mantener juntos implementación, documentación y publicación. No añadir APIs que no están implementadas ni documentar una compatibilidad sin probarla.

## Catálogo público y equivalencias

Las firmas incluyen sus valores por defecto. En cada tabla se indica el prefijo que debe usarse. Los nombres anteriores se muestran solo como referencia para actualizar las páginas de prueba.

### Generales

Prefijo: `invUtils.`

| Firma actual | Nombre anterior |
|---|---|
| `alerta(status, mensaje)` | `customAlert` |
| `posponerEjecucion(key, callback, delay = 300, immediate = false)` | `debounce` |
| `cancelarEjecucionPendiente(key)` | `cancelDebounce` |
| `ejecutarSiCambia(key, newValue, callback, delay = 100)` | `executeOnChange` |
| `cancelarEjecucionesPendientes()` | `clearAllDebounces` |
| `normalizarNumero(value)` | `normalizeNumber` |
| `formatearNumeroEuropeo(value, decimalPlaces = 2, useThousandsSeparator = true)` | `formatToEuropean` |
| `convertirAFormatoEuropeo(value, decimalPlaces = 2)` | `toEuropeanFormat` |

### Ítems de página

Prefijo: `invUtils.item.`

| Firma actual | Nombre anterior |
|---|---|
| `obtenerNumero(itemName, defaultValue = 0)` | `getNumeric` |
| `obtener(itemName, defaultValue = 0)` | `get` |
| `obtenerNumeros(itemNames, defaultValue = 0)` | `getMultipleNumeric` |

### Edición y datos

Prefijo: `invUtils.grid.`

| Firma actual | Nombre anterior |
|---|---|
| `habilitarEdicion(regionId)` | `habilitarEdicion` |
| `extraerDatos(configuracion)` | `extraerDatosIG` |
| `extraerCampos(regionId, campos, campoDestino)` | `extraerDatos` |
| `cargarDatos(configuracion)` | `setearDatosIG` |
| `cargarDatosDirectos(regionId, datos, limpiar = true, refrescar = true, modoEdicion = true)` | `setearDatosDirectos` |
| `cargarDatosDesdeItem(regionId, campoOrigen, limpiar = true, refrescar = true, modoEdicion = true)` | `setearDatos` |

### Cálculos y configuración

Prefijo: `invUtils.grid.`

| Firma actual | Nombre anterior |
|---|---|
| `configurarCalculoAutomatico(gridStaticId, config)` | `setupAutoCalculation` |
| `calcular(gridStaticId, config)` | `calculate` |
| `configurarCantidadPorCosto(gridStaticId, cantidadColumn = 'CANTIDAD', costoColumn = 'COSTO', totalColumn = 'TOTAL', decimalPlaces = 3)` | `setupCantidadPorCosto` |
| `asegurarCalculoAutomatico(gridStaticId, targetColumn = 'TOTAL')` | `ensureAutoCalculation` |
| `asegurarFormatoDecimal(gridStaticId, columnName, decimalPlaces = 2)` | `ensureDecimalFormat` |
| `sumarColumnaEnItem(gridStaticId, columnName, targetItem, decimalPlaces = 2, autoUpdate = true)` | `sumColumnToItem` |
| `sumarTotalEnItem(gridStaticId, targetItem, decimalPlaces = 2)` | `sumTotalToItem` |
| `escucharCambios(gridStaticId, callback, eventTypes = ['set', 'add', 'delete', 'reset'])` | `setupGridListener` |
| `forzarRecalculo(gridStaticId, config)` | `forceRecalculate` |
| `actualizarCalculoAutomatico(gridStaticId, targetColumn = null, delay = 50)` | `refreshAutoCalculation` |
| `obtenerConfiguracionCalculo(gridStaticId, targetColumn = null)` | `getAutoCalculationConfig` |
| `eliminarConfiguracionCalculo(gridStaticId, targetColumn = null)` | `clearAutoCalculationConfig` |
| `obtenerConfiguracionesCalculo(gridStaticId = null)` | `getAllAutoCalculationConfigs` |
| `estaInicializado()` | `isInitialized` |
| `inicializar()` | `initialize` |
| `recalcularFilas(gridStaticId, sourceColumnsOrConfig, targetColumn, formula, decimalPlaces = 2, delay = 50)` | `recalculateAllRows` |

### Lectura de valores

Prefijo: `invUtils.grid.`

| Firma actual | Nombre anterior |
|---|---|
| `obtenerValorColumna(gridStaticId, columnName)` | `getColumnValue` |
| `obtenerValorCelda(gridStaticId, columnName, rowIndex = -1)` | `getCellValue` |
| `obtenerValorCeldaSeleccionada(gridStaticId, columnName)` | `getSelectedCellValue` |
| `obtenerValorPrimeraCelda(gridStaticId, columnName)` | `getFirstCellValue` |
| `obtenerFilaActual(gridStaticId, columns = null)` | `getCurrentRow` |
| `obtenerNumeroCelda(gridStaticId, columnName, rowIndex = -1, defaultValue = 0)` | `getNumericCellValue` |
| `obtenerNumeroCeldaSeleccionada(gridStaticId, columnName, defaultValue = 0)` | `getSelectedNumericCellValue` |
| `obtenerNumeroPrimeraCelda(gridStaticId, columnName, defaultValue = 0)` | `getFirstNumericCellValue` |
| `obtenerNumeroCeldaConDecimales(gridStaticId, columnName, rowIndex = -1, decimalPlaces = 2, defaultValue = 0)` | `getNumericCellValueWithDecimals` |
| `obtenerNumeroCeldaSeleccionadaConDecimales(gridStaticId, columnName, decimalPlaces = 2, defaultValue = 0)` | `getSelectedNumericCellValueWithDecimals` |
| `obtenerNumeroPrimeraCeldaConDecimales(gridStaticId, columnName, decimalPlaces = 2, defaultValue = 0)` | `getFirstNumericCellValueWithDecimals` |
| `obtenerEnteroCelda(gridStaticId, columnName, rowIndex = -1, defaultValue = 0)` | `getIntegerCellValue` |
| `obtenerEnteroCeldaSeleccionada(gridStaticId, columnName, defaultValue = 0)` | `getSelectedIntegerCellValue` |
| `obtenerEnteroPrimeraCelda(gridStaticId, columnName, defaultValue = 0)` | `getFirstIntegerCellValue` |

### Asignación de valores

Prefijo: `invUtils.grid.`

| Firma actual | Nombre anterior |
|---|---|
| `establecerValorColumna(gridStaticId, columnName, value)` | `setColumnValue` |
| `establecerValorCelda(gridStaticId, columnName, rowIndex, value, refresh = true)` | `setCellValue` |
| `establecerValorCeldaSeleccionada(gridStaticId, columnName, value, refresh = true)` | `setSelectedCellValue` |
| `establecerValorPrimeraCelda(gridStaticId, columnName, value, refresh = true)` | `setFirstCellValue` |
| `limpiarCeldasSeleccionadas(gridStaticId, columnNames, value = '', refresh = true)` | `cleanSelectedCellValues` |
| `establecerNumeroCelda(gridStaticId, columnName, rowIndex, value, decimalPlaces = null, refresh = true)` | `setNumericCellValue` |
| `establecerNumeroCeldaSeleccionada(gridStaticId, columnName, value, decimalPlaces = null, refresh = true)` | `setSelectedNumericCellValue` |
| `establecerNumeroPrimeraCelda(gridStaticId, columnName, value, decimalPlaces = null, refresh = true)` | `setFirstNumericCellValue` |
| `establecerEnteroCelda(gridStaticId, columnName, rowIndex, value, refresh = true)` | `setIntegerCellValue` |
| `establecerEnteroCeldaSeleccionada(gridStaticId, columnName, value, refresh = true)` | `setSelectedIntegerCellValue` |
| `establecerEnteroPrimeraCelda(gridStaticId, columnName, value, refresh = true)` | `setFirstIntegerCellValue` |
| `establecerValorYRecalcular(gridStaticId, columnName, rowIndex, value, recalculoConfig, refresh = true)` | `setValueAndRecalculate` |
| `establecerValorSeleccionadoYRecalcular(gridStaticId, columnName, value, recalculoConfig, refresh = true)` | `setSelectedValueAndRecalculate` |
| `establecerPrimerValorYRecalcular(gridStaticId, columnName, value, recalculoConfig, refresh = true)` | `setFirstValueAndRecalculate` |
| `establecerValorEnFilas(gridStaticId, targetColumn, valueOrFormula, options)` | `setAllRowsValue` |
| `establecerValorFijoEnFilas(gridStaticId, targetColumn, value, options)` | `setAllRowsFixed` |

### Navegación y foco

Prefijo: `invUtils.grid.`

| Firma actual | Nombre anterior |
|---|---|
| `irACelda(gridStaticId, columnName, rowIndex = -1, focus = true)` | `gotoCell` |
| `irAPrimeraCelda(gridStaticId, columnName)` | `gotoFirstCell` |
| `irACeldaSeleccionada(gridStaticId, columnName)` | `gotoSelectedCell` |
| `inicializarRestauracionFoco(enable = true)` | `initializeFocusRestoration` |
| `habilitarRestauracionFoco()` | `enableFocusRestoration` |
| `deshabilitarRestauracionFoco()` | `disableFocusRestoration` |
| `obtenerUltimaCeldaConFoco()` | `getLastFocusedCell` |
| `establecerUltimaCeldaConFoco(cellElement)` | `setLastFocusedCell` |
| `restaurarFoco(delay = 50)` | `restoreFocus` |
| `limpiarUltimaCeldaConFoco()` | `clearLastFocusedCell` |
| `obtenerEstadoRestauracionFoco()` | `getFocusRestorationStatus` |

### Refresco y confirmación del modelo

Prefijo: `invUtils.grid.`

| Firma actual | Nombre anterior |
|---|---|
| `refrescar(gridStaticId, refreshRegion = true)` | `refreshGrid` |
| `refrescarYRecalcular(gridStaticId, recalculoConfig = null)` | `refreshGridAndRecalculate` |
| `refrescarYRecalcularColumna(gridStaticId, targetColumn = null, delay = 100)` | `refreshGridAndRecalculateSimple` |
| `confirmarCambios(gridStaticId, commitAll = true, forceDirty = true)` | `commitGridChanges` |
| `refrescarSoloVista(gridStaticId, commitChanges = true)` | `refreshGridViewOnly` |
| `refrescarSeguro(gridStaticId, commitChanges = true, refreshRegion = false)` | `refreshGridSafe` |
| `forzarRegistroModificado(gridStaticId, rowIndex = -1)` | `forceRecordDirty` |
| `forzarEstadoModificado(model, targetRow, columnName = null)` | `forceDirtyState` |

### Variantes de asignación existentes

Prefijo: `invUtils.grid.`

| Firma actual | Nombre anterior |
|---|---|
| `establecerNumeroCeldaConConfirmacion(gridStaticId, columnName, rowIndex, value, decimalPlaces = null, refresh = true)` | `setNumericCellValueWithCommit` |
| `establecerNumeroCeldaSeleccionadaConConfirmacion(gridStaticId, columnName, value, decimalPlaces = null, refresh = true)` | `setSelectedNumericCellValueWithCommit` |
| `establecerNumeroPrimeraCeldaConConfirmacion(gridStaticId, columnName, value, decimalPlaces = null, refresh = true)` | `setFirstNumericCellValueWithCommit` |
| `establecerNumeroRobusto(gridStaticId, columnName, rowIndex, value, decimalPlaces = null, refresh = true)` | `setNumericValueRobust` |
| `establecerNumeroSeleccionadoRobusto(gridStaticId, columnName, value, decimalPlaces = null, refresh = true)` | `setSelectedNumericValueRobust` |
| `establecerPrimerNumeroRobusto(gridStaticId, columnName, value, decimalPlaces = null, refresh = true)` | `setFirstNumericValueRobust` |
| `establecerNumeroEuropeo(gridStaticId, columnName, rowIndex, value, decimalPlaces = 2, refresh = true)` | `setNumericValueEuropean` |
| `establecerNumeroSeleccionadoEuropeo(gridStaticId, columnName, value, decimalPlaces = 2, refresh = true)` | `setSelectedNumericValueEuropean` |
| `establecerPrimerNumeroEuropeo(gridStaticId, columnName, value, decimalPlaces = 2, refresh = true)` | `setFirstNumericValueEuropean` |
| `establecerValorCeldaComoModificado(gridStaticId, columnName, rowIndex, value, refresh = true, forceDirty = true)` | `setCellValueWithDirty` |
| `establecerValorCeldaSeleccionadaComoModificado(gridStaticId, columnName, value, refresh = true, forceDirty = true)` | `setSelectedCellValueWithDirty` |
| `establecerValorPrimeraCeldaComoModificado(gridStaticId, columnName, value, refresh = true, forceDirty = true)` | `setFirstCellValueWithDirty` |
| `establecerValorCeldaConEstabilizacion(gridStaticId, columnName, rowIndex, value, maxAttempts = 5, delayBetweenAttempts = 200)` | `setCellValueWithStabilization` |
| `establecerValorCeldaSeleccionadaConEstabilizacion(gridStaticId, columnName, value, maxAttempts = 5, delayBetweenAttempts = 200)` | `setSelectedCellValueWithStabilization` |
| `establecerValorPrimeraCeldaConEstabilizacion(gridStaticId, columnName, value, maxAttempts = 5, delayBetweenAttempts = 200)` | `setFirstCellValueWithStabilization` |
| `simularInteraccionUsuario(gridStaticId, columnName, rowIndex = -1)` | `simulateUserInteraction` |
| `establecerValorCeldaConActivacion(gridStaticId, columnName, rowIndex, value, simulateInteraction = true)` | `setCellValueWithActivation` |
| `establecerValorCeldaSeleccionadaConActivacion(gridStaticId, columnName, value, simulateInteraction = true)` | `setSelectedCellValueWithActivation` |
| `establecerValorPrimeraCeldaConActivacion(gridStaticId, columnName, value, simulateInteraction = true)` | `setFirstCellValueWithActivation` |
| `establecerValorCeldaRobusto(gridStaticId, columnName, rowIndex, value, refresh = true, maxRetries = 3)` | `setCellValueRobust` |
| `establecerValorCeldaSeleccionadaRobusto(gridStaticId, columnName, value, refresh = true, maxRetries = 3)` | `setSelectedCellValueRobust` |
| `establecerValorPrimeraCeldaRobusto(gridStaticId, columnName, value, refresh = true, maxRetries = 3)` | `setFirstCellValueRobust` |

### Selección y sincronización con ítems

Prefijo: `invUtils.grid.`

| Firma actual | Nombre anterior |
|---|---|
| `actualizarItemAlSeleccionarFila(gridStaticId, columnName, itemName)` | `setItemOnRowSelect` |
| `actualizarItemAlCambiarFilaOCelda(gridStaticId, columnName, itemName)` | `setItemOnRowOrCellChange` |
| `establecerValorEnFilaSeleccionada(gridStaticId, columnName, value)` | `setValueToSelectedRow` |
| `seleccionarPrimeraFilaAlIniciar(gridStaticId, callback)` | `selectFirstRowOnInit` |
| `sincronizarConItem(gridStaticId, columnName, itemName, options)` | `syncGridToItem` |
| `sincronizarDesdeItem(gridStaticId, columnName, itemName, options)` | `syncItemToGrid` |
| `sincronizarItemBidireccional(gridStaticId, columnName, itemName, options)` | `syncGridItemValues` |

### Diagnóstico

Prefijo: `invUtils.grid.`

| Firma actual | Nombre anterior |
|---|---|
| `depurar(gridStaticId, columnName = null)` | `debugGrid` |

### Fórmulas y configuraciones rápidas

| Acceso actual | Acceso anterior |
|---|---|
| `invUtils.grid.formulas.multiplicar(values, col1, col2)` | `apexGridUtils.presetFormulas.multiply(...)` |
| `invUtils.grid.formulas.agregarImpuesto(values, priceCol, taxPercent = 10)` | `apexGridUtils.presetFormulas.addTax(...)` |
| `invUtils.grid.formulas.subtotalConDescuento(values, qtyCol, priceCol, discountCol)` | `apexGridUtils.presetFormulas.subtotalWithDiscount(...)` |
| `invUtils.grid.formulas.sumar(values, ...columns)` | `apexGridUtils.presetFormulas.sum(...)` |
| `invUtils.grid.formulas.promediar(values, ...columns)` | `apexGridUtils.presetFormulas.average(...)` |
| `invUtils.grid.configuracionesRapidas.multiplicarColumnas(gridStaticId, col1, col2, targetCol, decimalPlaces = 2)` | `apexGridUtils.quick.multiplyColumns(...)` |
| `invUtils.grid.configuracionesRapidas.precioConImpuesto(gridStaticId, priceCol, targetCol, taxPercent = 10, decimalPlaces = 2)` | `apexGridUtils.quick.priceWithTax(...)` |
| `invUtils.grid.configuracionesRapidas.subtotalConDescuento(gridStaticId, qtyCol, priceCol, discountCol, targetCol, decimalPlaces = 2)` | `apexGridUtils.quick.subtotalWithDiscount(...)` |

### Objeto de control de depuración

`invUtils.grid.depurar(regionId, columna)` devuelve un objeto de control o `null` si falla:

| Método actual | Método anterior |
|---|---|
| `control.obtenerEstadoActual()` | `control.getCurrentState()` |
| `control.simularCambioManual()` | `control.simulateManualChange()` |
| `control.detenerDepuracion()` | `control.stopDebug()` |
| `control.obtenerResumen()` | `control.getSummary()` |

La propiedad `control.debugInfo` conserva su nombre. `simularCambioManual` modifica un valor de prueba; utilizarlo únicamente en un entorno de pruebas.

### Objeto de resultado de suma

`invUtils.grid.sumarColumnaEnItem(...)` y `invUtils.grid.sumarTotalEnItem(...)` devuelven `sum`, `gridStaticId`, `columnName`, `targetItem` y el método `calcularSuma()` (antes `calculateSum()`). Este método recalcula el total, actualiza el ítem y devuelve el nuevo número; `sum` contiene el total inicial.

Autor: Luis Talavera. Licencia: [MIT](LICENSE.md).
