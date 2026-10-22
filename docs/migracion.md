# Guía de migración

[Inicio](../README.md) · [Desarrollo](desarrollo.md) · [Manual](manual.md) · [API](referencia-api.md) · [Migración](migracion.md)

## Antes de actualizar una página

1. Identificar si usa los nombres originales (`apexGridUtils`, `apexUtils` o funciones globales) o la primera organización en español del commit `e9676e1`.
2. Actualizar sus llamadas con la tabla correspondiente y cargar `invUtils.js` según el [manual](manual.md#instalación-en-oracle-apex).
3. Conservar los parámetros y opciones de cada firma. Los cambios de nombres no agregan alias globales ni certifican nuevos comportamientos.
4. Probar la página y sus Dynamic Actions. Consultar la [referencia de API](referencia-api.md) para comprobar el destino y los efectos de cada función.

`apexUtils.js` permanece como referencia original. `README.html` contiene documentación histórica. La documentación vigente comienza en el [README](../README.md).

El commit `762bc1d` registra el renombrado y la actualización del README antes de separar esta documentación. La tabla en español también incluye auxiliares internos; publicarlos depende del `return` final del módulo.

## Equivalencias desde la API original

La columna de origen conserva los nombres históricos. Usar la ruta completa de destino para actualizar una llamada.

### Generales

| Nombre o acceso original | Acceso actual |
|---|---|
| `customAlert` | `invUtils.mostrarAlerta` |
| `debounce` | `invUtils.posponerEjecucion` |
| `cancelDebounce` | `invUtils.cancelarEjecucionPendiente` |
| `executeOnChange` | `invUtils.ejecutarSiCambia` |
| `clearAllDebounces` | `invUtils.cancelarEjecucionesPendientes` |
| `normalizeNumber` | `invUtils.normalizarNumero` |
| `formatToEuropean` | `invUtils.formatearNumeroEuropeo` |
| `toEuropeanFormat` | `invUtils.convertirNumeroEuropeo` |

### Ítems de página

| Nombre o acceso original | Acceso actual |
|---|---|
| `getNumeric` | `invUtils.item.leerNumero` |
| `get` | `invUtils.item.leerValorNumerico` |
| `getMultipleNumeric` | `invUtils.item.leerNumeros` |

### Edición y datos

| Nombre o acceso original | Acceso actual |
|---|---|
| `habilitarEdicion` | `invUtils.grid.habilitarEdicion` |
| `extraerDatosIG` | `invUtils.grid.extraerDatos` |
| `extraerDatos` | `invUtils.grid.extraerCampos` |
| `setearDatosIG` | `invUtils.grid.cargarDatos` |
| `setearDatosDirectos` | `invUtils.grid.cargarDatosDirectos` |
| `setearDatos` | `invUtils.grid.cargarDesdeItem` |

### Cálculos y configuración

| Nombre o acceso original | Acceso actual |
|---|---|
| `setupAutoCalculation` | `invUtils.grid.configurarCalculoAutomatico` |
| `calculate` | `invUtils.grid.calcularColumnas` |
| `setupCantidadPorCosto` | `invUtils.grid.configurarMultiplicacion` |
| `ensureAutoCalculation` | `invUtils.grid.asegurarCalculoAutomatico` |
| `ensureDecimalFormat` | `invUtils.grid.asegurarFormatoDecimal` |
| `sumColumnToItem` | `invUtils.grid.sumarColumna` |
| `sumTotalToItem` | `invUtils.grid.sumarTotal` |
| `setupGridListener` | `invUtils.grid.escucharCambios` |
| `forceRecalculate` | `invUtils.grid.forzarRecalculo` |
| `refreshAutoCalculation` | `invUtils.grid.actualizarCalculoAutomatico` |
| `getAutoCalculationConfig` | `invUtils.grid.leerConfiguracionCalculo` |
| `clearAutoCalculationConfig` | `invUtils.grid.eliminarConfiguracionCalculo` |
| `getAllAutoCalculationConfigs` | `invUtils.grid.leerConfiguracionesCalculo` |
| `isInitialized` | `invUtils.grid.estaInicializado` |
| `initialize` | `invUtils.grid.inicializarModulo` |
| `recalculateAllRows` | `invUtils.grid.recalcularFilas` |

### Lectura de valores

| Nombre o acceso original | Acceso actual |
|---|---|
| `getColumnValue` | `invUtils.grid.leerColumna` |
| `getCellValue` | `invUtils.grid.leerCelda` |
| `getSelectedCellValue` | `invUtils.grid.leerCeldaSeleccionada` |
| `getFirstCellValue` | `invUtils.grid.leerPrimeraCelda` |
| `getCurrentRow` | `invUtils.grid.leerFilaActual` |
| `getNumericCellValue` | `invUtils.grid.leerNumeroCelda` |
| `getSelectedNumericCellValue` | `invUtils.grid.leerNumeroSeleccionado` |
| `getFirstNumericCellValue` | `invUtils.grid.leerPrimerNumero` |
| `getNumericCellValueWithDecimals` | `invUtils.grid.leerNumeroRedondeado` |
| `getSelectedNumericCellValueWithDecimals` | `invUtils.grid.leerNumeroSeleccionadoRedondeado` |
| `getFirstNumericCellValueWithDecimals` | `invUtils.grid.leerPrimerNumeroRedondeado` |
| `getIntegerCellValue` | `invUtils.grid.leerEnteroCelda` |
| `getSelectedIntegerCellValue` | `invUtils.grid.leerEnteroSeleccionado` |
| `getFirstIntegerCellValue` | `invUtils.grid.leerPrimerEntero` |

### Asignación de valores

| Nombre o acceso original | Acceso actual |
|---|---|
| `setColumnValue` | `invUtils.grid.asignarColumna` |
| `setCellValue` | `invUtils.grid.asignarCelda` |
| `setSelectedCellValue` | `invUtils.grid.asignarCeldaSeleccionada` |
| `setFirstCellValue` | `invUtils.grid.asignarPrimeraCelda` |
| `cleanSelectedCellValues` | `invUtils.grid.limpiarCeldasSeleccionadas` |
| `setNumericCellValue` | `invUtils.grid.asignarNumeroCelda` |
| `setSelectedNumericCellValue` | `invUtils.grid.asignarNumeroSeleccionado` |
| `setFirstNumericCellValue` | `invUtils.grid.asignarPrimerNumero` |
| `setIntegerCellValue` | `invUtils.grid.asignarEnteroCelda` |
| `setSelectedIntegerCellValue` | `invUtils.grid.asignarEnteroSeleccionado` |
| `setFirstIntegerCellValue` | `invUtils.grid.asignarPrimerEntero` |
| `setValueAndRecalculate` | `invUtils.grid.asignarCeldaConRecalculo` |
| `setSelectedValueAndRecalculate` | `invUtils.grid.asignarCeldaSeleccionadaConRecalculo` |
| `setFirstValueAndRecalculate` | `invUtils.grid.asignarPrimeraCeldaConRecalculo` |
| `setAllRowsValue` | `invUtils.grid.asignarFilas` |
| `setAllRowsFixed` | `invUtils.grid.asignarValorFilas` |

### Navegación y foco

| Nombre o acceso original | Acceso actual |
|---|---|
| `gotoCell` | `invUtils.grid.irACelda` |
| `gotoFirstCell` | `invUtils.grid.irAPrimeraCelda` |
| `gotoSelectedCell` | `invUtils.grid.irACeldaSeleccionada` |
| `initializeFocusRestoration` | `invUtils.grid.configurarRestauracionFoco` |
| `enableFocusRestoration` | `invUtils.grid.habilitarRestauracionFoco` |
| `disableFocusRestoration` | `invUtils.grid.deshabilitarRestauracionFoco` |
| `getLastFocusedCell` | `invUtils.grid.leerUltimoFoco` |
| `setLastFocusedCell` | `invUtils.grid.asignarUltimoFoco` |
| `restoreFocus` | `invUtils.grid.restaurarFoco` |
| `clearLastFocusedCell` | `invUtils.grid.limpiarReferenciaFoco` |
| `getFocusRestorationStatus` | `invUtils.grid.leerEstadoFoco` |

### Refresco y confirmación del modelo

| Nombre o acceso original | Acceso actual |
|---|---|
| `refreshGrid` | `invUtils.grid.refrescarRegion` |
| `refreshGridAndRecalculate` | `invUtils.grid.refrescarConRecalculo` |
| `refreshGridAndRecalculateSimple` | `invUtils.grid.refrescarCalculosRegistrados` |
| `commitGridChanges` | `invUtils.grid.confirmarCambios` |
| `refreshGridViewOnly` | `invUtils.grid.refrescarVista` |
| `refreshGridSafe` | `invUtils.grid.refrescarConConfirmacion` |
| `forceRecordDirty` | `invUtils.grid.marcarFila` |
| `forceDirtyState` | `invUtils.grid.marcarRegistro` |

### Variantes de asignación existentes

| Nombre o acceso original | Acceso actual |
|---|---|
| `setNumericCellValueWithCommit` | `invUtils.grid.asignarNumeroMarcado` |
| `setSelectedNumericCellValueWithCommit` | `invUtils.grid.asignarNumeroSeleccionadoMarcado` |
| `setFirstNumericCellValueWithCommit` | `invUtils.grid.asignarPrimerNumeroMarcado` |
| `setNumericValueRobust` | `invUtils.grid.asignarNumeroSinFormato` |
| `setSelectedNumericValueRobust` | `invUtils.grid.asignarNumeroSeleccionadoSinFormato` |
| `setFirstNumericValueRobust` | `invUtils.grid.asignarPrimerNumeroSinFormato` |
| `setNumericValueEuropean` | `invUtils.grid.asignarNumeroEuropeo` |
| `setSelectedNumericValueEuropean` | `invUtils.grid.asignarNumeroSeleccionadoEuropeo` |
| `setFirstNumericValueEuropean` | `invUtils.grid.asignarPrimerNumeroEuropeo` |
| `setCellValueWithDirty` | `invUtils.grid.asignarCeldaMarcada` |
| `setSelectedCellValueWithDirty` | `invUtils.grid.asignarCeldaSeleccionadaMarcada` |
| `setFirstCellValueWithDirty` | `invUtils.grid.asignarPrimeraCeldaMarcada` |
| `setCellValueWithStabilization` | `invUtils.grid.asignarCeldaVerificada` |
| `setSelectedCellValueWithStabilization` | `invUtils.grid.asignarCeldaSeleccionadaVerificada` |
| `setFirstCellValueWithStabilization` | `invUtils.grid.asignarPrimeraCeldaVerificada` |
| `simulateUserInteraction` | `invUtils.grid.simularInteraccionUsuario` |
| `setCellValueWithActivation` | `invUtils.grid.asignarCeldaActivada` |
| `setSelectedCellValueWithActivation` | `invUtils.grid.asignarCeldaSeleccionadaActivada` |
| `setFirstCellValueWithActivation` | `invUtils.grid.asignarPrimeraCeldaActivada` |
| `setCellValueRobust` | `invUtils.grid.asignarCeldaPausandoEventos` |
| `setSelectedCellValueRobust` | `invUtils.grid.asignarCeldaSeleccionadaPausandoEventos` |
| `setFirstCellValueRobust` | `invUtils.grid.asignarPrimeraCeldaPausandoEventos` |

### Selección y sincronización con ítems

| Nombre o acceso original | Acceso actual |
|---|---|
| `setItemOnRowSelect` | `invUtils.grid.sincronizarItemSeleccion` |
| `setItemOnRowOrCellChange` | `invUtils.grid.sincronizarItemCambios` |
| `setValueToSelectedRow` | `invUtils.grid.asignarColumnaSeleccionada` |
| `selectFirstRowOnInit` | `invUtils.grid.seleccionarFilaInicial` |
| `syncGridToItem` | `invUtils.grid.sincronizarItem` |
| `syncItemToGrid` | `invUtils.grid.sincronizarDesdeItem` |
| `syncGridItemValues` | `invUtils.grid.sincronizarItemBidireccional` |

### Diagnóstico

| Nombre o acceso original | Acceso actual |
|---|---|
| `debugGrid` | `invUtils.grid.depurarCambios` |

### Fórmulas y configuraciones rápidas

| Nombre o acceso original | Acceso actual |
|---|---|
| `apexGridUtils.presetFormulas.multiply(...)` | `invUtils.grid.formulas.multiplicar` |
| `apexGridUtils.presetFormulas.addTax(...)` | `invUtils.grid.formulas.agregarImpuesto` |
| `apexGridUtils.presetFormulas.subtotalWithDiscount(...)` | `invUtils.grid.formulas.calcularSubtotal` |
| `apexGridUtils.presetFormulas.sum(...)` | `invUtils.grid.formulas.sumar` |
| `apexGridUtils.presetFormulas.average(...)` | `invUtils.grid.formulas.promediar` |
| `apexGridUtils.quick.multiplyColumns(...)` | `invUtils.grid.configuracionesRapidas.configurarProducto` |
| `apexGridUtils.quick.priceWithTax(...)` | `invUtils.grid.configuracionesRapidas.configurarImpuesto` |
| `apexGridUtils.quick.subtotalWithDiscount(...)` | `invUtils.grid.configuracionesRapidas.configurarDescuento` |

### Objeto de control de depuración

| Nombre o acceso original | Acceso actual |
|---|---|
| `control.getCurrentState()` | `control.leerEstadoActual` |
| `control.simulateManualChange()` | `control.simularCambioManual` |
| `control.stopDebug()` | `control.detenerDepuracion` |
| `control.getSummary()` | `control.leerResumen` |

El método `calculateSum()` del resultado de una suma se llama ahora `calcularSuma()`. La propiedad `sum` conserva su nombre.


## Cambios de nombres respecto al commit e9676e1

Se conservan las firmas, valores por defecto y lógica. Esta tabla permite actualizar las llamadas anteriores en español; no se mantienen alias con esos nombres.

| Antes | Ahora |
|---|---|
| `alerta` | `mostrarAlerta` |
| `convertirAFormatoEuropeo` | `convertirNumeroEuropeo` |
| `obtenerNumero` | `leerNumero` |
| `obtener` | `leerValorNumerico` |
| `obtenerNumeros` | `leerNumeros` |
| `cargarDatosDesdeItem` | `cargarDesdeItem` |
| `calcular` | `calcularColumnas` |
| `configurarCantidadPorCosto` | `configurarMultiplicacion` |
| `sumarColumnaEnItem` | `sumarColumna` |
| `sumarTotalEnItem` | `sumarTotal` |
| `obtenerConfiguracionCalculo` | `leerConfiguracionCalculo` |
| `obtenerConfiguracionesCalculo` | `leerConfiguracionesCalculo` |
| `inicializar` | `inicializarModulo` |
| `obtenerValorColumna` | `leerColumna` |
| `obtenerValorCelda` | `leerCelda` |
| `obtenerValorCeldaSeleccionada` | `leerCeldaSeleccionada` |
| `obtenerValorPrimeraCelda` | `leerPrimeraCelda` |
| `obtenerFilaActual` | `leerFilaActual` |
| `obtenerNumeroCelda` | `leerNumeroCelda` |
| `obtenerNumeroCeldaSeleccionada` | `leerNumeroSeleccionado` |
| `obtenerNumeroPrimeraCelda` | `leerPrimerNumero` |
| `obtenerNumeroCeldaConDecimales` | `leerNumeroRedondeado` |
| `obtenerNumeroCeldaSeleccionadaConDecimales` | `leerNumeroSeleccionadoRedondeado` |
| `obtenerNumeroPrimeraCeldaConDecimales` | `leerPrimerNumeroRedondeado` |
| `obtenerEnteroCelda` | `leerEnteroCelda` |
| `obtenerEnteroCeldaSeleccionada` | `leerEnteroSeleccionado` |
| `obtenerEnteroPrimeraCelda` | `leerPrimerEntero` |
| `establecerValorColumna` | `asignarColumna` |
| `establecerValorCelda` | `asignarCelda` |
| `establecerValorCeldaSeleccionada` | `asignarCeldaSeleccionada` |
| `establecerValorPrimeraCelda` | `asignarPrimeraCelda` |
| `establecerNumeroCelda` | `asignarNumeroCelda` |
| `establecerNumeroCeldaSeleccionada` | `asignarNumeroSeleccionado` |
| `establecerNumeroPrimeraCelda` | `asignarPrimerNumero` |
| `establecerEnteroCelda` | `asignarEnteroCelda` |
| `establecerEnteroCeldaSeleccionada` | `asignarEnteroSeleccionado` |
| `establecerEnteroPrimeraCelda` | `asignarPrimerEntero` |
| `establecerValorYRecalcular` | `asignarCeldaConRecalculo` |
| `establecerValorSeleccionadoYRecalcular` | `asignarCeldaSeleccionadaConRecalculo` |
| `establecerPrimerValorYRecalcular` | `asignarPrimeraCeldaConRecalculo` |
| `establecerValorEnFilas` | `asignarFilas` |
| `establecerValorFijoEnFilas` | `asignarValorFilas` |
| `cursorCelda` | `irACelda` |
| `cursorCeldaSeleccionada` | `irACeldaSeleccionada` |
| `inicializarRestauracionFoco` | `configurarRestauracionFoco` |
| `obtenerUltimaCeldaConFoco` | `leerUltimoFoco` |
| `establecerUltimaCeldaConFoco` | `asignarUltimoFoco` |
| `limpiarUltimaCeldaConFoco` | `limpiarReferenciaFoco` |
| `obtenerEstadoRestauracionFoco` | `leerEstadoFoco` |
| `refrescar` | `refrescarRegion` |
| `refrescarYRecalcular` | `refrescarConRecalculo` |
| `refrescarYRecalcularColumna` | `refrescarCalculosRegistrados` |
| `refrescarSoloVista` | `refrescarVista` |
| `refrescarSeguro` | `refrescarConConfirmacion` |
| `forzarRegistroModificado` | `marcarFila` |
| `forzarEstadoModificado` | `marcarRegistro` |
| `establecerNumeroCeldaConConfirmacion` | `asignarNumeroMarcado` |
| `establecerNumeroCeldaSeleccionadaConConfirmacion` | `asignarNumeroSeleccionadoMarcado` |
| `establecerNumeroPrimeraCeldaConConfirmacion` | `asignarPrimerNumeroMarcado` |
| `establecerNumeroRobusto` | `asignarNumeroSinFormato` |
| `establecerNumeroSeleccionadoRobusto` | `asignarNumeroSeleccionadoSinFormato` |
| `establecerPrimerNumeroRobusto` | `asignarPrimerNumeroSinFormato` |
| `establecerNumeroEuropeo` | `asignarNumeroEuropeo` |
| `establecerNumeroSeleccionadoEuropeo` | `asignarNumeroSeleccionadoEuropeo` |
| `establecerPrimerNumeroEuropeo` | `asignarPrimerNumeroEuropeo` |
| `establecerValorCeldaComoModificado` | `asignarCeldaMarcada` |
| `establecerValorCeldaSeleccionadaComoModificado` | `asignarCeldaSeleccionadaMarcada` |
| `establecerValorPrimeraCeldaComoModificado` | `asignarPrimeraCeldaMarcada` |
| `establecerValorCeldaConEstabilizacion` | `asignarCeldaVerificada` |
| `establecerValorCeldaSeleccionadaConEstabilizacion` | `asignarCeldaSeleccionadaVerificada` |
| `establecerValorPrimeraCeldaConEstabilizacion` | `asignarPrimeraCeldaVerificada` |
| `establecerValorCeldaConActivacion` | `asignarCeldaActivada` |
| `establecerValorCeldaSeleccionadaConActivacion` | `asignarCeldaSeleccionadaActivada` |
| `establecerValorPrimeraCeldaConActivacion` | `asignarPrimeraCeldaActivada` |
| `establecerValorCeldaRobusto` | `asignarCeldaPausandoEventos` |
| `establecerValorCeldaSeleccionadaRobusto` | `asignarCeldaSeleccionadaPausandoEventos` |
| `establecerValorPrimeraCeldaRobusto` | `asignarPrimeraCeldaPausandoEventos` |
| `actualizarItemAlSeleccionarFila` | `sincronizarItemSeleccion` |
| `actualizarItemAlCambiarFilaOCelda` | `sincronizarItemCambios` |
| `establecerValorEnFilaSeleccionada` | `asignarColumnaSeleccionada` |
| `seleccionarPrimeraFilaAlIniciar` | `seleccionarFilaInicial` |
| `sincronizarConItem` | `sincronizarItem` |
| `depurar` | `depurarCambios` |
| `obtenerContextoRegistro` | `leerContextoRegistro` |
| `obtenerEstadoActual` | `leerEstadoActual` |
| `obtenerResumen` | `leerResumen` |
| `multiplicarColumnas` | `configurarProducto` |
| `precioConImpuesto` | `configurarImpuesto` |
| `subtotalConDescuento` | `calcularSubtotal` |

En `grid.configuracionesRapidas`, `subtotalConDescuento` pasa a `configurarDescuento`; en `grid.formulas`, pasa a `calcularSubtotal`.
