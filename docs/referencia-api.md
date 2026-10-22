# Referencia de API

[Inicio](../README.md) · [Desarrollo](desarrollo.md) · [Manual](manual.md) · [API](referencia-api.md) · [Migración](migracion.md)

## Parámetros comunes

| Parámetro | Significado |
|---|---|
| `regionId`, `gridStaticId` | Static ID de la región Interactive Grid. |
| `itemName`, `targetItem`, `campoDestino` | Nombre del ítem de página correspondiente. |
| `columnName`, `targetColumn` | Nombre de la columna, no su encabezado ni el Static ID del editor. |
| `rowIndex` | En los accesos por índice, `1` indica la primera fila y `-1` la selección; se usan registros cargados en el modelo. |
| `value` | Valor que se asignará; revisar la variante numérica o de formato elegida. |
| `decimalPlaces` | Cantidad de decimales. El valor por defecto y el significado de `null` dependen de la firma. |
| `refresh`, `refreshRegion` | Opciones de refresco de la vista o región; ver los efectos de cada función. |
| `config`, `options`, `configuracion` | Objetos de opciones propios de cada función. Sus claves no se renombraron. |

Los ejemplos de configuración están en el [manual](manual.md#ejemplos-de-uso). No todas las funciones comparten el mismo contrato de retorno.

## Retornos y efectos principales

| Función o familia | Retorno y efecto |
|---|---|
| `invUtils.item.leerNumero`, `leerValorNumerico` | Número convertido o `defaultValue`; usan interpretación europea. |
| `invUtils.item.leerNumeros` | Array de números, en el orden de los ítems recibidos. |
| `invUtils.grid.leerCelda` y variantes de lectura de valor | Valor leído o `null` cuando no se encuentra. Consultar la variante numérica para su valor por defecto. |
| `invUtils.grid.asignarCelda` | Booleano; asigna al modelo, puede refrescar la vista y programa una verificación posterior. No confirma un guardado en base de datos. |
| `invUtils.grid.configurarCalculoAutomatico` | Identificador de configuración o `null` ante error; puede registrar eventos y programar el cálculo inicial. |
| `invUtils.grid.extraerDatos`, `extraerCampos` | Objeto con `success`, `data` y `count` en éxito; incluye `error` cuando falla. También asigna el resultado al ítem destino. |
| `invUtils.grid.asignarCeldaVerificada`, `asignarCeldaPausandoEventos` y sus variantes | `Promise<boolean>`; realizan verificaciones y reintentos. |
| `invUtils.grid.recalcularFilas` | No devuelve una promesa; programa el trabajo mediante un temporizador. |
| `invUtils.grid.sumarColumna`, `sumarTotal` | Objeto con la suma inicial y un método para recalcular; véase el detalle al final del catálogo. |
| `invUtils.grid.depurarCambios` | Objeto de control de depuración o `null`; véase el detalle al final del catálogo. |

Las advertencias sobre métodos heredados y pruebas en APEX están en [validación por versión](desarrollo.md#mantenimiento-y-validación-por-versión).


## Efectos de las variantes existentes

Estos nombres describen mecanismos; no garantizan que Oracle APEX acepte todos los métodos opcionales usados por la implementación heredada.

| Función o familia | Comportamiento que se conserva |
|---|---|
| `asignarCeldaConRecalculo` y sus variantes | Asignan el valor y programan el recálculo si se proporciona `recalculoConfig`; respetan la opción de refresco. |
| `refrescarConRecalculo` | Refresca la vista y programa el cálculo recibido, cuando existe. |
| `refrescarCalculosRegistrados` | Refresca la región y programa los cálculos previamente configurados. Conserva la llamada a `clearChanges()` del refresco. |
| `refrescarConConfirmacion` | Puede confirmar cambios en el modelo antes de refrescar la vista; el refresco completo de la región es opcional. |
| `asignarNumeroMarcado` y sus variantes | Asignan un número e intentan marcar o actualizar el registro con los métodos disponibles. |
| `asignarNumeroSinFormato` y sus variantes | Intentan desactivar temporalmente el formato del modelo mediante `disableFormatting`, asignan el número y restauran esa opción. |
| `asignarCeldaMarcada` y sus variantes | Asignan el valor e intentan marcar los cambios según `forceDirty`. |
| `asignarCeldaVerificada` y sus variantes | Verifican el valor y realizan reintentos; devuelven una promesa y conservan las condiciones originales de éxito. |
| `asignarCeldaActivada` y sus variantes | Pueden simular la interacción con la celda antes de asignar el valor. |
| `asignarCeldaPausandoEventos` y sus variantes | Intentan suspender temporalmente los listeners internos del modelo, restaurarlos y verificar el valor con reintentos. No suspenden todos los eventos de la página. |

## Catálogo de funciones

Las firmas incluyen los parámetros y sus valores por defecto. En cada tabla se indica el prefijo que debe usarse. Las equivalencias anteriores están en la [guía de migración](migracion.md). La implementación y sus comentarios JSDoc se encuentran en [invUtils.js](../invUtils.js); el `return` final define la API pública.

### Generales

Prefijo: `invUtils.`

| Firma |
|---|
| `mostrarAlerta(status, mensaje)` |
| `posponerEjecucion(key, callback, delay = 300, immediate = false)` |
| `cancelarEjecucionPendiente(key)` |
| `ejecutarSiCambia(key, newValue, callback, delay = 100)` |
| `cancelarEjecucionesPendientes()` |
| `normalizarNumero(value)` |
| `formatearNumeroEuropeo(value, decimalPlaces = 2, useThousandsSeparator = true)` |
| `convertirNumeroEuropeo(value, decimalPlaces = 2)` |

### Ítems de página

Prefijo: `invUtils.item.`

| Firma |
|---|
| `leerNumero(itemName, defaultValue = 0)` |
| `leerValorNumerico(itemName, defaultValue = 0)` |
| `leerNumeros(itemNames, defaultValue = 0)` |

### Edición y datos

Prefijo: `invUtils.grid.`

| Firma |
|---|
| `habilitarEdicion(regionId)` |
| `extraerDatos(configuracion)` |
| `extraerCampos(regionId, campos, campoDestino)` |
| `cargarDatos(configuracion)` |
| `cargarDatosDirectos(regionId, datos, limpiar = true, refrescar = true, modoEdicion = true)` |
| `cargarDesdeItem(regionId, campoOrigen, limpiar = true, refrescar = true, modoEdicion = true)` |

### Cálculos y configuración

Prefijo: `invUtils.grid.`

| Firma |
|---|
| `configurarCalculoAutomatico(gridStaticId, config)` |
| `calcularColumnas(gridStaticId, config)` |
| `configurarMultiplicacion(gridStaticId, cantidadColumn = 'CANTIDAD', costoColumn = 'COSTO', totalColumn = 'TOTAL', decimalPlaces = 3)` |
| `asegurarCalculoAutomatico(gridStaticId, targetColumn = 'TOTAL')` |
| `asegurarFormatoDecimal(gridStaticId, columnName, decimalPlaces = 2)` |
| `sumarColumna(gridStaticId, columnName, targetItem, decimalPlaces = 2, autoUpdate = true)` |
| `sumarTotal(gridStaticId, targetItem, decimalPlaces = 2)` |
| `escucharCambios(gridStaticId, callback, eventTypes = ['set', 'add', 'delete', 'reset'])` |
| `forzarRecalculo(gridStaticId, config)` |
| `actualizarCalculoAutomatico(gridStaticId, targetColumn = null, delay = 50)` |
| `leerConfiguracionCalculo(gridStaticId, targetColumn = null)` |
| `eliminarConfiguracionCalculo(gridStaticId, targetColumn = null)` |
| `leerConfiguracionesCalculo(gridStaticId = null)` |
| `estaInicializado()` |
| `inicializarModulo()` |
| `recalcularFilas(gridStaticId, sourceColumnsOrConfig, targetColumn, formula, decimalPlaces = 2, delay = 50)` |

### Lectura de valores

Prefijo: `invUtils.grid.`

| Firma |
|---|
| `leerColumna(gridStaticId, columnName)` |
| `leerCelda(gridStaticId, columnName, rowIndex = -1)` |
| `leerCeldaSeleccionada(gridStaticId, columnName)` |
| `leerPrimeraCelda(gridStaticId, columnName)` |
| `leerFilaActual(gridStaticId, columns = null)` |
| `leerNumeroCelda(gridStaticId, columnName, rowIndex = -1, defaultValue = 0)` |
| `leerNumeroSeleccionado(gridStaticId, columnName, defaultValue = 0)` |
| `leerPrimerNumero(gridStaticId, columnName, defaultValue = 0)` |
| `leerNumeroRedondeado(gridStaticId, columnName, rowIndex = -1, decimalPlaces = 2, defaultValue = 0)` |
| `leerNumeroSeleccionadoRedondeado(gridStaticId, columnName, decimalPlaces = 2, defaultValue = 0)` |
| `leerPrimerNumeroRedondeado(gridStaticId, columnName, decimalPlaces = 2, defaultValue = 0)` |
| `leerEnteroCelda(gridStaticId, columnName, rowIndex = -1, defaultValue = 0)` |
| `leerEnteroSeleccionado(gridStaticId, columnName, defaultValue = 0)` |
| `leerPrimerEntero(gridStaticId, columnName, defaultValue = 0)` |

### Asignación de valores

Prefijo: `invUtils.grid.`

| Firma |
|---|
| `asignarColumna(gridStaticId, columnName, value)` |
| `asignarCelda(gridStaticId, columnName, rowIndex, value, refresh = true)` |
| `asignarCeldaSeleccionada(gridStaticId, columnName, value, refresh = true)` |
| `asignarPrimeraCelda(gridStaticId, columnName, value, refresh = true)` |
| `limpiarCeldasSeleccionadas(gridStaticId, columnNames, value = '', refresh = true)` |
| `asignarNumeroCelda(gridStaticId, columnName, rowIndex, value, decimalPlaces = null, refresh = true)` |
| `asignarNumeroSeleccionado(gridStaticId, columnName, value, decimalPlaces = null, refresh = true)` |
| `asignarPrimerNumero(gridStaticId, columnName, value, decimalPlaces = null, refresh = true)` |
| `asignarEnteroCelda(gridStaticId, columnName, rowIndex, value, refresh = true)` |
| `asignarEnteroSeleccionado(gridStaticId, columnName, value, refresh = true)` |
| `asignarPrimerEntero(gridStaticId, columnName, value, refresh = true)` |
| `asignarCeldaConRecalculo(gridStaticId, columnName, rowIndex, value, recalculoConfig, refresh = true)` |
| `asignarCeldaSeleccionadaConRecalculo(gridStaticId, columnName, value, recalculoConfig, refresh = true)` |
| `asignarPrimeraCeldaConRecalculo(gridStaticId, columnName, value, recalculoConfig, refresh = true)` |
| `asignarFilas(gridStaticId, targetColumn, valueOrFormula, options)` |
| `asignarValorFilas(gridStaticId, targetColumn, value, options)` |

### Navegación y foco

Prefijo: `invUtils.grid.`

| Firma |
|---|
| `irACelda(gridStaticId, columnName, rowIndex = -1, focus = true)` |
| `irAPrimeraCelda(gridStaticId, columnName)` |
| `irACeldaSeleccionada(gridStaticId, columnName)` |
| `configurarRestauracionFoco(enable = true)` |
| `habilitarRestauracionFoco()` |
| `deshabilitarRestauracionFoco()` |
| `leerUltimoFoco()` |
| `asignarUltimoFoco(cellElement)` |
| `restaurarFoco(delay = 50)` |
| `limpiarReferenciaFoco()` |
| `leerEstadoFoco()` |

### Refresco y confirmación del modelo

Prefijo: `invUtils.grid.`

| Firma |
|---|
| `refrescarRegion(gridStaticId, refreshRegion = true)` |
| `refrescarConRecalculo(gridStaticId, recalculoConfig = null)` |
| `refrescarCalculosRegistrados(gridStaticId, targetColumn = null, delay = 100)` |
| `confirmarCambios(gridStaticId, commitAll = true, forceDirty = true)` |
| `refrescarVista(gridStaticId, commitChanges = true)` |
| `refrescarConConfirmacion(gridStaticId, commitChanges = true, refreshRegion = false)` |
| `marcarFila(gridStaticId, rowIndex = -1)` |
| `marcarRegistro(model, targetRow, columnName = null)` |

### Variantes de asignación existentes

Prefijo: `invUtils.grid.`

| Firma |
|---|
| `asignarNumeroMarcado(gridStaticId, columnName, rowIndex, value, decimalPlaces = null, refresh = true)` |
| `asignarNumeroSeleccionadoMarcado(gridStaticId, columnName, value, decimalPlaces = null, refresh = true)` |
| `asignarPrimerNumeroMarcado(gridStaticId, columnName, value, decimalPlaces = null, refresh = true)` |
| `asignarNumeroSinFormato(gridStaticId, columnName, rowIndex, value, decimalPlaces = null, refresh = true)` |
| `asignarNumeroSeleccionadoSinFormato(gridStaticId, columnName, value, decimalPlaces = null, refresh = true)` |
| `asignarPrimerNumeroSinFormato(gridStaticId, columnName, value, decimalPlaces = null, refresh = true)` |
| `asignarNumeroEuropeo(gridStaticId, columnName, rowIndex, value, decimalPlaces = 2, refresh = true)` |
| `asignarNumeroSeleccionadoEuropeo(gridStaticId, columnName, value, decimalPlaces = 2, refresh = true)` |
| `asignarPrimerNumeroEuropeo(gridStaticId, columnName, value, decimalPlaces = 2, refresh = true)` |
| `asignarCeldaMarcada(gridStaticId, columnName, rowIndex, value, refresh = true, forceDirty = true)` |
| `asignarCeldaSeleccionadaMarcada(gridStaticId, columnName, value, refresh = true, forceDirty = true)` |
| `asignarPrimeraCeldaMarcada(gridStaticId, columnName, value, refresh = true, forceDirty = true)` |
| `asignarCeldaVerificada(gridStaticId, columnName, rowIndex, value, maxAttempts = 5, delayBetweenAttempts = 200)` |
| `asignarCeldaSeleccionadaVerificada(gridStaticId, columnName, value, maxAttempts = 5, delayBetweenAttempts = 200)` |
| `asignarPrimeraCeldaVerificada(gridStaticId, columnName, value, maxAttempts = 5, delayBetweenAttempts = 200)` |
| `simularInteraccionUsuario(gridStaticId, columnName, rowIndex = -1)` |
| `asignarCeldaActivada(gridStaticId, columnName, rowIndex, value, simulateInteraction = true)` |
| `asignarCeldaSeleccionadaActivada(gridStaticId, columnName, value, simulateInteraction = true)` |
| `asignarPrimeraCeldaActivada(gridStaticId, columnName, value, simulateInteraction = true)` |
| `asignarCeldaPausandoEventos(gridStaticId, columnName, rowIndex, value, refresh = true, maxRetries = 3)` |
| `asignarCeldaSeleccionadaPausandoEventos(gridStaticId, columnName, value, refresh = true, maxRetries = 3)` |
| `asignarPrimeraCeldaPausandoEventos(gridStaticId, columnName, value, refresh = true, maxRetries = 3)` |

### Selección y sincronización con ítems

Prefijo: `invUtils.grid.`

| Firma |
|---|
| `sincronizarItemSeleccion(gridStaticId, columnName, itemName)` |
| `sincronizarItemCambios(gridStaticId, columnName, itemName)` |
| `asignarColumnaSeleccionada(gridStaticId, columnName, value)` |
| `seleccionarFilaInicial(gridStaticId, callback)` |
| `sincronizarItem(gridStaticId, columnName, itemName, options)` |
| `sincronizarDesdeItem(gridStaticId, columnName, itemName, options)` |
| `sincronizarItemBidireccional(gridStaticId, columnName, itemName, options)` |

### Diagnóstico

Prefijo: `invUtils.grid.`

| Firma |
|---|
| `depurarCambios(gridStaticId, columnName = null)` |

### Fórmulas y configuraciones rápidas

| Acceso |
|---|
| `invUtils.grid.formulas.multiplicar(values, col1, col2)` |
| `invUtils.grid.formulas.agregarImpuesto(values, priceCol, taxPercent = 10)` |
| `invUtils.grid.formulas.calcularSubtotal(values, qtyCol, priceCol, discountCol)` |
| `invUtils.grid.formulas.sumar(values, ...columns)` |
| `invUtils.grid.formulas.promediar(values, ...columns)` |
| `invUtils.grid.configuracionesRapidas.configurarProducto(gridStaticId, col1, col2, targetCol, decimalPlaces = 2)` |
| `invUtils.grid.configuracionesRapidas.configurarImpuesto(gridStaticId, priceCol, targetCol, taxPercent = 10, decimalPlaces = 2)` |
| `invUtils.grid.configuracionesRapidas.configurarDescuento(gridStaticId, qtyCol, priceCol, discountCol, targetCol, decimalPlaces = 2)` |

### Objeto de control de depuración

`invUtils.grid.depurarCambios(regionId, columna)` devuelve un objeto de control o `null` si falla:

| Método |
|---|
| `control.leerEstadoActual()` |
| `control.simularCambioManual()` |
| `control.detenerDepuracion()` |
| `control.leerResumen()` |

La propiedad `control.debugInfo` conserva su nombre. `simularCambioManual` modifica un valor de prueba; utilizarlo únicamente en un entorno de pruebas.

### Objeto de resultado de suma

`invUtils.grid.sumarColumna(...)` y `invUtils.grid.sumarTotal(...)` devuelven `sum`, `gridStaticId`, `columnName`, `targetItem` y el método `calcularSuma()`. Este método recalcula el total, actualiza el ítem y devuelve el nuevo número; `sum` contiene el total inicial.
