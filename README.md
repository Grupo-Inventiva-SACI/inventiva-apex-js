# APEX Utils - Biblioteca de Utilidades para Oracle APEX

**Versión:** 1.3.0  
**Fecha:** 2025-08-29  
**Licencia:** MIT

Una biblioteca completa de utilidades para trabajar con Interactive Grids y elementos de Oracle APEX, facilitando operaciones comunes como cálculos automáticos, manipulación de datos, navegación y gestión de formularios dinámicos.

## 📋 Resumen de Funciones

### 🔢 Cálculos Automáticos
- **`setupAutoCalculation()`** - Configura cálculos automáticos en Interactive Grids
- **`setupCantidadPorCosto()`** - Configura multiplicación automática (cantidad × costo = total)
- **`refreshAutoCalculation()`** - Refresca todos los cálculos automáticos configurados

### 📊 Obtener Valores
- **`getSelectedCellValue()`** - Obtiene valor de la celda seleccionada (última con foco)
- **`getCurrentRow()`** - Obtiene múltiples campos de la fila con foco como objeto
- **`getCellValue()`** - Obtiene valor de celda específica por fila y columna
- **`getNumericCellValue()`** - Obtiene valor numérico con normalización de formato europeo
- **`getSelectedRows()`** - Obtiene datos de las filas seleccionadas y aplica una fórmula opcional
- **`getSelectedRowsToItem()`** - Obtiene datos de las filas seleccionadas, aplica una fórmula y guarda el resultado en un item

### ✏️ Establecer Valores
- **`setSelectedCellValue()`** - Establece valor en la celda seleccionada
- **`setCellValue()`** - Establece valor en celda específica por fila y columna
- **`setNumericCellValue()`** - Establece valor numérico con control de decimales

### 🧮 Sumas y Totales
- **`sumColumnToItem()`** - Suma todos los valores de una columna y los coloca en un item
- **`sumTotalToItem()`** - Suma la columna TOTAL a un item específico

### 🎯 Navegación
- **`gotoCell()`** - Navega a una celda específica en el grid
- **`gotoSelectedCell()`** - Navega a la celda de la fila seleccionada
- **`gotoFirstCell()`** - Navega a la primera celda de una columna

### 🔄 Refrescar y Actualizar
- **`refreshGrid()`** - Refresca el grid de manera segura
- **`commitGridChanges()`** - Confirma cambios en el modelo del grid
- **`forceRecordDirty()`** - Fuerza el estado "dirty" de un registro

### 📝 Configuración de Datos
- **`setearDatosIG()`** - Settea datos en Interactive Grid con configuración avanzada
- **`setearDatosDirectos()`** - Settea datos directamente en el grid
- **`setearDatos()`** - Settea datos desde un campo JSON de la página

### 🎛️ Utilidades Generales
- **`habilitarEdicion()`** - Habilita modo edición en Interactive Grid
- **`extraerDatosIG()`** - Extrae datos del grid con filtros y transformaciones
- **`normalizeNumber()`** - Normaliza números con formato europeo/latino
- **`formatToEuropean()`** - Formatea números al formato europeo (1.234,56)

### 🎮 Configuraciones Rápidas
- **`quick.multiplyColumns()`** - Multiplicación simple (cantidad × precio = total)
- **`quick.priceWithTax()`** - Precio con IVA automático
- **`quick.subtotalWithDiscount()`** - Subtotal con descuento automático

### 🔍 Debug y Monitoreo
- **`debugGrid()`** - Debug completo para monitorear cambios en Interactive Grid
- **`getAutoCalculationConfig()`** - Obtiene configuración de cálculos automáticos
- **`getAllAutoCalculationConfigs()`** - Obtiene todas las configuraciones almacenadas

### 🎯 Eventos y Listeners
- **`setupGridListener()`** - Configura listener externo para cambios en el grid
- **`setItemOnRowSelect()`** - Settea item de página cuando se selecciona fila
- **`setItemOnRowOrCellChange()`** - Settea item cuando cambia fila o celda
- **`setValueToSelectedRow()`** - Asigna valor a columna de la fila seleccionada
- **`selectFirstRowOnInit()`** - Selecciona automáticamente la primera fila al inicializar
- **`syncItemWithGridColumn()`** - Sincronización bidireccional entre item y columna de grilla

### 🎪 Sistema de Re-enfoque
- **`initializeFocusRestoration()`** - Inicializa sistema de re-enfoque automático
- **`restoreFocus()`** - Restaura el foco en la última celda activa
- **`getFocusRestorationStatus()`** - Obtiene estado del sistema de re-enfoque

---

## 🚀 Instalación

1. Incluir el archivo `apexUtils.js` en tu aplicación APEX
2. El módulo se inicializa automáticamente al cargar la página
3. Todas las funciones están disponibles globalmente

## 🆕 Mejoras en Funciones de Seteo de Valores

### Problema Resuelto

Las funciones de seteo de valores han sido completamente reescritas en la versión 1.2.0 basándose en código que funciona correctamente en producción. El problema anterior era que los valores se establecían pero no se mantenían al interactuar con la grilla.

### ⚠️ Convenciones Importantes

#### Formato Europeo (Obligatorio)
**Todas las funciones de esta biblioteca utilizan formato europeo por defecto:**
- **Separador de miles**: Punto (`.`)
- **Separador decimal**: Coma (`,`)
- **Ejemplo**: `1.234,56` (mil doscientos treinta y cuatro con cincuenta y seis centavos)

```javascript
// ✅ Formato correcto (europeo)
apexGridUtils.setCellValue('mi_grid', 'COSTO', 1, 1.234,56);

// ❌ Formato incorrecto (americano)
apexGridUtils.setCellValue('mi_grid', 'COSTO', 1, 1234.56);
```

#### Sistema de Índices de Filas
**El sistema de índices es 1-basado (no 0-basado):**
- **Fila 1**: Primera fila visible en el grid
- **Fila 2**: Segunda fila visible en el grid
- **Fila -1**: Fila seleccionada actualmente

```javascript
// ✅ Índices correctos
apexGridUtils.setCellValue('mi_grid', 'COSTO', 1, 150.50);  // Primera fila
apexGridUtils.setCellValue('mi_grid', 'COSTO', 2, 200.75);  // Segunda fila
apexGridUtils.setCellValue('mi_grid', 'COSTO', -1, 175.25); // Fila seleccionada

// ❌ Índices incorrectos (0-basado)
apexGridUtils.setCellValue('mi_grid', 'COSTO', 0, 150.50);  // No funciona
```

### Cambios Principales

1. **Método de acceso al modelo mejorado**: 
   - Antes: `apex.region(gridStaticId).call("getViews").grid.model`
   - Ahora: `apex.region(gridStaticId).widget().interactiveGrid("getCurrentView").model`

2. **Obtención de registros mejorada**:
   - Uso directo de `getSelectedRecords()` del modelo actual
   - Iteración más eficiente con `model.forEach()`

3. **SetValue directo y confiable**:
   - Eliminación de métodos complejos de dirty state
   - Uso directo de `model.setValue(record, column, value)`

### Funciones Mejoradas

```javascript
// ✅ Setear valor en celda específica (formato europeo, índice 1-basado)
apexGridUtils.setCellValue('mi_grid', 'COSTO', 1, 1.234,56);  // Primera fila
apexGridUtils.setCellValue('mi_grid', 'COSTO', 2, 2.500,00);  // Segunda fila

// ✅ Setear valor en fila seleccionada
apexGridUtils.setSelectedCellValue('mi_grid', 'COSTO', 1.750,25);

// ✅ Setear valor en primera fila
apexGridUtils.setFirstCellValue('mi_grid', 'COSTO', 1.000,00);

// ✅ Obtener valor de celda específica
let valor = apexGridUtils.getCellValue('mi_grid', 'COSTO', 1);  // Primera fila

// ✅ Navegar a celda específica
apexGridUtils.gotoCell('mi_grid', 'COSTO', 1);  // Primera fila
```

### Ejemplo de Uso Completo

```javascript
// Configurar cálculo automático
apexGridUtils.setupAutoCalculation('DetallesP', {
    sourceColumns: ['CANTIDAD', 'COSTO'],
    targetColumn: 'TOTAL',
    formula: function(values) {
        return values.CANTIDAD * values.COSTO;
    },
    decimalPlaces: 3
});

// Setear valores que se mantienen correctamente (formato europeo)
apexGridUtils.setCellValue('DetallesP', 'CANTIDAD', 1, 10);        // Primera fila
apexGridUtils.setCellValue('DetallesP', 'COSTO', 1, 15,500);       // Primera fila
apexGridUtils.setCellValue('DetallesP', 'CANTIDAD', 2, 5);         // Segunda fila
apexGridUtils.setCellValue('DetallesP', 'COSTO', 2, 25,750);       // Segunda fila

// El cálculo automático se ejecutará y el valor se mantendrá
```

### Solución de Problemas

Si los valores no se mantienen al interactuar con la grilla, usar las funciones mejoradas:

```javascript
// ✅ Usar estas funciones (versión mejorada)
apexGridUtils.setCellValue('grid_id', 'COSTO', 1, 1.500,50);  // Primera fila
apexGridUtils.setSelectedCellValue('grid_id', 'COSTO', 1.750,25);

// ❌ Evitar funciones antiguas que pueden no funcionar
// apexGridUtils.setCellValueWithDirty()
// apexGridUtils.setCellValueWithStabilization()
```

## 🔧 Funciones Principales

### habilitarEdicion(regionId)

Habilita el modo de edición en un Interactive Grid.

```javascript
// Habilitar edición en un grid específico
habilitarEdicion('mi_grid_region');
```

**Parámetros:**
- `regionId` (string): ID de la región del Interactive Grid

**Retorna:** `boolean` - true si se habilitó correctamente

### extraerDatosIG(configuracion)

Extrae datos de un Interactive Grid con configuración avanzada.

```javascript
// Configuración básica
extraerDatosIG({
    regionId: 'mi_grid',
    campos: [
        { nombre: 'ID', alias: 'identificador' },
        { nombre: 'NOMBRE', alias: 'nombre_completo' },
        { nombre: 'ACTIVO', alias: 'estado', obligatorio: false }
    ],
    campoDestino: 'P1_DATOS_EXTRAIDOS',
    formatoSalida: 'array' // 'array' o 'json'
});

// Con transformación de datos
extraerDatosIG({
    regionId: 'mi_grid',
    campos: [
        { 
            nombre: 'FECHA', 
            alias: 'fecha_formateada',
            transformacion: function(valor) {
                return new Date(valor).toLocaleDateString();
            }
        }
    ],
    campoDestino: 'P1_FECHAS'
});
```

**Parámetros:**
- `configuracion.regionId` (string): ID de la región del grid
- `configuracion.campos` (array): Array de objetos con configuración de campos
- `configuracion.campoDestino` (string): ID del item donde guardar los datos
- `configuracion.formatoSalida` (string): 'array' o 'json' (opcional)
- `configuracion.callback` (function): Función a ejecutar después de la extracción (opcional)

### extraerDatos(regionId, campos, campoDestino)

Versión simplificada de extraerDatosIG.

```javascript
// Extracción simple
extraerDatos('mi_grid', ['ID', 'NOMBRE', 'EMAIL'], 'P1_DATOS');
```

## 🎯 APEX Grid Utils

### Configuración de Cálculos Automáticos

#### setupAutoCalculation(gridStaticId, config)

Configura cálculos automáticos en Interactive Grids.

```javascript
// Configurar multiplicación automática (formato europeo)
apexGridUtils.setupAutoCalculation('mi_grid', {
    sourceColumns: ['CANTIDAD', 'PRECIO'],
    targetColumn: 'TOTAL',
    formula: function(values) {
        return values.CANTIDAD * values.PRECIO;
    },
    decimalPlaces: 2,
    autoTrigger: true,
    triggerOnLoad: true
});
```

**Parámetros:**
- `gridStaticId` (string): Static ID del Interactive Grid
- `config.sourceColumns` (array): Columnas que disparan el cálculo
- `config.targetColumn` (string): Columna donde se guarda el resultado
- `config.formula` (function): Función que realiza el cálculo
- `config.decimalPlaces` (number): Número de decimales (default: 2)
- `config.autoTrigger` (boolean): Si debe configurar eventos automáticos (default: true)
- `config.triggerOnLoad` (boolean): Si debe ejecutar al cargar (default: false)

#### Configuraciones Rápidas

```javascript
// Multiplicación simple (formato europeo)
apexGridUtils.quick.multiplyColumns('mi_grid', 'CANTIDAD', 'PRECIO', 'TOTAL', 2);

// Precio con IVA (formato europeo)
apexGridUtils.quick.priceWithTax('mi_grid', 'PRECIO_BASE', 'PRECIO_CON_IVA', 10, 2);

// Subtotal con descuento (formato europeo)
apexGridUtils.quick.subtotalWithDiscount('mi_grid', 'CANTIDAD', 'PRECIO', 'DESCUENTO', 'SUBTOTAL', 2);
```

### Manipulación de Celdas

#### Obtener Valores

```javascript
// Obtener valor de celda seleccionada
let valor = apexGridUtils.getSelectedCellValue('mi_grid', 'TOTAL');

// Obtener valor de primera fila
let primerValor = apexGridUtils.getFirstCellValue('mi_grid', 'TOTAL');

// Obtener valor de fila específica (índice 1 = primera fila)
let valorFila = apexGridUtils.getCellValue('mi_grid', 'TOTAL', 1);

// Obtener todos los campos de la fila seleccionada como objeto
let filaCompleta = apexGridUtils.getCurrentRow('mi_grid', ['TOTAL', 'CANTIDAD', 'PRECIO']);

// Obtener valores numéricos (con normalización de formato europeo)
let valorNumerico = apexGridUtils.getSelectedNumericCellValue('mi_grid', 'TOTAL');
let valorConDecimales = apexGridUtils.getSelectedNumericCellValueWithDecimals('mi_grid', 'TOTAL', 2);
let valorEntero = apexGridUtils.getSelectedIntegerCellValue('mi_grid', 'TOTAL');
```

#### Obtener Valores Numéricos

Estas funciones obtienen valores numéricos de celdas del Interactive Grid, preservando el formato original de los datos y proporcionando valores por defecto si la conversión falla.

##### getNumericCellValue(gridStaticId, columnName, rowIndex, defaultValue)

Obtiene el valor numérico de una celda específica, preservando el formato original de los datos.

```javascript
// Obtener valor numérico de fila específica
let valor = apexGridUtils.getNumericCellValue('mi_grid', 'TOTAL', 1, 0); // grid, columna, fila1, valorPorDefecto

// Obtener valor numérico de fila seleccionada
let valorSeleccionado = apexGridUtils.getSelectedNumericCellValue('mi_grid', 'TOTAL', 0); // grid, columna, valorPorDefecto

// Obtener valor numérico de primera fila
let primerValor = apexGridUtils.getFirstNumericCellValue('mi_grid', 'TOTAL', 0); // grid, columna, valorPorDefecto

// Obtener valor con decimales específicos
let valorConDecimales = apexGridUtils.getNumericCellValueWithDecimals('mi_grid', 'TOTAL', 1, 2, 0); // grid, columna, fila1, 2decimales, valorPorDefecto

// Obtener valor entero
let valorEntero = apexGridUtils.getIntegerCellValue('mi_grid', 'TOTAL', 1, 0); // grid, columna, fila1, valorPorDefecto
```

#### Obtener Fila Completa

##### getCurrentRow(gridStaticId, columns)

Obtiene todos los campos especificados de la fila que tiene el foco actual en el Interactive Grid, devolviendo un objeto con los valores accesibles por nombre de columna.

```javascript
// Obtener campos específicos de la fila seleccionada
let fila = apexGridUtils.getCurrentRow('mi_grid', ['TOTAL', 'CANTIDAD', 'PRECIO']);
console.log(fila.TOTAL);     // Acceder al valor de TOTAL
console.log(fila.CANTIDAD);  // Acceder al valor de CANTIDAD
console.log(fila.PRECIO);    // Acceder al valor de PRECIO

// Obtener un solo campo
let fila = apexGridUtils.getCurrentRow('mi_grid', ['TOTAL']);
console.log(fila.TOTAL);     // Acceder al valor de TOTAL

// Ejemplo práctico
let fila = apexGridUtils.getCurrentRow('IDAutorizacionCanje', ['TOTAL_VALOR', 'TOT_COMPROBANTE', 'COD_ANIMAL']);
console.log('Total Valor:', fila.TOTAL_VALOR);
console.log('Total Comprobante:', fila.TOT_COMPROBANTE);
console.log('Código Animal:', fila.COD_ANIMAL);
```

**Parámetros:**
- `gridStaticId` (string): Static ID del Interactive Grid
- `columns` (array): Array con los nombres de las columnas a obtener

**Retorna:** `object|null` - Objeto con los valores de las columnas especificadas, o null si no hay fila seleccionada

**Características:**
- Obtiene la fila que tiene el foco actual (no necesariamente la última seleccionada)
- Usa `document.activeElement` para detectar la fila activa
- Mapea automáticamente los nombres de columnas a sus índices
- Devuelve un objeto con propiedades accesibles por nombre de columna
- Requiere especificar las columnas que se desean obtener
- Funciona con cualquier Interactive Grid de APEX

**Parámetros:**
- `gridStaticId` (string): Static ID del Interactive Grid
- `columnName` (string): Nombre de la columna
- `rowIndex` (number): Índice de la fila (1 = primera fila, -1 = fila seleccionada, default: -1)
- `defaultValue` (number): Valor por defecto si no se puede convertir (default: 0)

**Retorna:** `number` - Valor numérico preservando formato original

##### Variantes Disponibles

```javascript
// Para fila seleccionada
apexGridUtils.getSelectedNumericCellValue('mi_grid', 'TOTAL', 0); // grid, columna, valorPorDefecto

// Para primera fila
apexGridUtils.getFirstNumericCellValue('mi_grid', 'TOTAL', 0); // grid, columna, valorPorDefecto

// Con decimales específicos
apexGridUtils.getNumericCellValueWithDecimals('mi_grid', 'TOTAL', 1, 2, 0); // grid, columna, fila1, 2decimales, valorPorDefecto
apexGridUtils.getSelectedNumericCellValueWithDecimals('mi_grid', 'TOTAL', 2, 0); // grid, columna, 2decimales, valorPorDefecto
apexGridUtils.getFirstNumericCellValueWithDecimals('mi_grid', 'TOTAL', 2, 0); // grid, columna, 2decimales, valorPorDefecto

// Valores enteros
apexGridUtils.getIntegerCellValue('mi_grid', 'TOTAL', 1, 0); // grid, columna, fila1, valorPorDefecto
apexGridUtils.getSelectedIntegerCellValue('mi_grid', 'TOTAL', 0); // grid, columna, valorPorDefecto
apexGridUtils.getFirstIntegerCellValue('mi_grid', 'TOTAL', 0); // grid, columna, valorPorDefecto
```

**Características:**
- Preserva el formato original de los datos (europeo o estándar)
- Convierte strings a números de forma segura
- Proporciona valor por defecto si la conversión falla
- Preserva decimales exactos cuando es posible
- Funciona con valores nulos, undefined o vacíos

**Ejemplo: Preservación de Formatos**

```javascript
// El grid contiene valores en diferentes formatos
// Fila 1: "1.234,56" (formato europeo)
// Fila 2: "1234.56" (formato estándar)
// Fila 3: "1234" (entero)
// Fila 4: "" (vacío)

let valor1 = apexGridUtils.getNumericCellValue('mi_grid', 'TOTAL', 1, 0); // grid, columna, fila1, valorPorDefecto → 1.234,56 (preserva formato)
let valor2 = apexGridUtils.getNumericCellValue('mi_grid', 'TOTAL', 2, 0); // grid, columna, fila2, valorPorDefecto → 1234.56 (preserva formato)
let valor3 = apexGridUtils.getNumericCellValue('mi_grid', 'TOTAL', 3, 0); // grid, columna, fila3, valorPorDefecto → 1234
let valor4 = apexGridUtils.getNumericCellValue('mi_grid', 'TOTAL', 4, 0); // grid, columna, fila4, valorPorDefecto → 0 (valor por defecto)

// Con decimales específicos
let valorFormateado = apexGridUtils.getNumericCellValueWithDecimals('mi_grid', 'TOTAL', 1, 2, 0); // grid, columna, fila1, 2decimales, valorPorDefecto → 1234.56

// Como entero
let valorEntero = apexGridUtils.getIntegerCellValue('mi_grid', 'TOTAL', 1, 0); // grid, columna, fila1, valorPorDefecto → 1235 (redondeado)
```

#### Setear Valores

```javascript
// Setear valor en celda específica (formato europeo, índice 1-basado)
apexGridUtils.setCellValue('mi_grid', 'COSTO', 1, 1.234,56);  // Primera fila
apexGridUtils.setCellValue('mi_grid', 'COSTO', 2, 2.500,00);  // Segunda fila

// Setear valor en fila seleccionada
apexGridUtils.setSelectedCellValue('mi_grid', 'COSTO', 1.750,25);

// Setear valor en primera fila
apexGridUtils.setFirstCellValue('mi_grid', 'COSTO', 1.000,00);

// Setear valores numéricos con formato europeo
apexGridUtils.setSelectedNumericCellValue('mi_grid', 'COSTO', 1.500,50);
apexGridUtils.setFirstNumericCellValue('mi_grid', 'COSTO', 2.250,75);
```

#### Navegación

```javascript
// Navegar a celda específica (índice 1 = primera fila)
apexGridUtils.gotoCell('mi_grid', 'COSTO', 1);  // Primera fila
apexGridUtils.gotoCell('mi_grid', 'COSTO', 2);  // Segunda fila

// Navegar a primera celda de columna
apexGridUtils.gotoFirstCell('mi_grid', 'COSTO');

// Navegar a celda seleccionada
apexGridUtils.gotoSelectedCell('mi_grid', 'COSTO');
```

### Cálculos y Sumas

```javascript
// Sumar columna y colocar en item (formato europeo)
let sumaConfig = apexGridUtils.sumColumnToItem('mi_grid', 'TOTAL', 'P1_SUMA_TOTAL', 2, true);

// Suma rápida de columna TOTAL (formato europeo)
apexGridUtils.sumTotalToItem('mi_grid', 'P1_SUMA_TOTAL', 2);

// Configurar listener para recalcular automáticamente
apexGridUtils.setupGridListener('mi_grid', function() {
    // Recalcular sumas cuando cambie el grid
    sumaConfig.calculateSum();
}, ['set', 'add', 'delete', 'reset']);
```

### Filas Seleccionadas: Lectura y Cálculo

#### getSelectedRows(gridStaticId, config)

Obtiene los datos de las filas seleccionadas del IG y, opcionalmente, aplica una fórmula para devolver un único resultado calculado.

```javascript
// Ejemplo 1: Obtener los datos "en bruto" de las filas seleccionadas
const filas = apexGridUtils.getSelectedRows('IG_DETALLE', {
    sourceColumns: ['COD_ANIMAL', 'COSTO_DOLARES']
});
console.log(filas);
// filas es un array de objetos:
// [
//   { record, index, values: { COD_ANIMAL: ..., COSTO_DOLARES: ... } },
//   ...
// ]

// Ejemplo 2: Sumar COSTO_DOLARES de las filas seleccionadas
const totalSeleccionado = apexGridUtils.getSelectedRows('IG_DETALLE', {
    sourceColumns: ['COSTO_DOLARES'],
    decimalPlaces: 2,
    formula: function(values, record, index) {
        // values contiene solo las columnas indicadas en sourceColumns
        // esta función se ejecuta por cada fila seleccionada
        if (!this.acumulador) {
            this.acumulador = 0;
        }
        const costo = parseFloat(values.COSTO_DOLARES) || 0;
        this.acumulador += costo;
        return this.acumulador; // el último valor retornado será el resultado final
    }
});
console.log('Total seleccionado:', totalSeleccionado);

// Ejemplo 3: Varias columnas con montos (COSTO_DOLARES_1 ... COSTO_DOLARES_10)
const totalMultiCols = apexGridUtils.getSelectedRows('IG_DETALLE', {
    sourceColumns: [
        'COSTO_DOLARES_1',
        'COSTO_DOLARES_2',
        'COSTO_DOLARES_3',
        'COSTO_DOLARES_4',
        'COSTO_DOLARES_5',
        'COSTO_DOLARES_6',
        'COSTO_DOLARES_7',
        'COSTO_DOLARES_8',
        'COSTO_DOLARES_9',
        'COSTO_DOLARES_10'
    ],
    decimalPlaces: 2,
    formula: function(values, record, index) {
        if (!this.total) {
            this.total = 0;
        }
        Object.keys(values).forEach(function(col) {
            const v = parseFloat(values[col]) || 0;
            this.total += v;
        }, this);
        return this.total;
    }
});
console.log('Total COSTO_DOLARES(1..10) seleccionados:', totalMultiCols);
```

**Parámetros:**
- `gridStaticId` (string): Static ID del Interactive Grid
- `config.sourceColumns` (array): Columnas a leer de cada fila seleccionada
- `config.formula` (function): Función que se ejecuta por cada fila seleccionada: `(values, record, index) => result`
- `config.decimalPlaces` (number): Decimales para el resultado cuando la fórmula devuelve número (opcional)
- `config.autoTrigger` (boolean): Si es `true`, se reejecuta automáticamente cuando cambia la selección (`interactivegridselectionchange`)

**Retorno:**
- Si NO se define `formula`: retorna un **array** con las filas seleccionadas (`[{ record, index, values }, ...]`).
- Si se define `formula`: retorna el **último valor** que devuelva la fórmula (opcionalmente formateado con `decimalPlaces`).

---

#### getSelectedRowsToItem(gridStaticId, config)

Similar a `getSelectedRows`, pero en lugar de devolver el resultado, lo escribe directamente en un item de página.

```javascript
// Ejemplo 1: Sumar COSTO_DOLARES de filas seleccionadas y guardarlo en un item
apexGridUtils.getSelectedRowsToItem('IG_DETALLE', {
    sourceColumns: ['COSTO_DOLARES'],
    targetItem: 'P1_TOTAL_SELECCIONADO',
    decimalPlaces: 2,
    formula: function(values, record, index) {
        if (!this.sum) {
            this.sum = 0;
        }
        const costo = parseFloat(values.COSTO_DOLARES) || 0;
        this.sum += costo;
        return this.sum;
    },
    autoTrigger: true // recalcula cada vez que cambia la selección del IG
});

// Ejemplo 2: Sin fórmula → guarda el valor de la primera columna y primera fila seleccionada
apexGridUtils.getSelectedRowsToItem('IG_DETALLE', {
    sourceColumns: ['COD_ANIMAL'],
    targetItem: 'P1_COD_ANIMAL_SELECCIONADO'
});
```

**Parámetros:**
- `gridStaticId` (string): Static ID del Interactive Grid
- `config.sourceColumns` (array): Columnas a leer de cada fila seleccionada
- `config.targetItem` (string): Nombre del item de página donde se guardará el resultado
- `config.formula` (function): Función que se ejecuta por cada fila seleccionada: `(values, record, index) => result`
- `config.decimalPlaces` (number): Decimales para el resultado cuando la fórmula devuelve número (opcional)
- `config.autoTrigger` (boolean): Si es `true`, se reejecuta automáticamente cuando cambia la selección (`interactivegridselectionchange`)

**Comportamiento:**
- Si NO hay filas seleccionadas → limpia el item (`null`/vacío).
- Si se define `formula` → el último valor devuelto por la fórmula se escribe en `targetItem`.
- Si NO se define `formula` → escribe el valor de la **primera columna** de `sourceColumns` de la **primera fila seleccionada**.

### Recalculación Masiva de Filas

#### recalculateAllRows(gridStaticId, sourceColumnsOrConfig, targetColumn, formula, decimalPlaces, delay)

Recalcula y actualiza valores en una columna específica de **todas las filas** del Interactive Grid de forma síncrona. Esta función es especialmente útil para cálculos que dependen de valores globales o cuando necesitas recalcular toda una columna basada en una fórmula.

**Características principales:**
- ✅ **Procesamiento síncrono** - Ejecuta inmediatamente todas las operaciones
- ✅ **Detección automática** de registros marcados para eliminación
- ✅ **Manejo robusto de errores** - Continúa procesando aunque falle una fila
- ✅ **Soporte para delay** - Permite configurar un delay opcional
- ✅ **Dos formatos de uso** - Compatible con formato antiguo y nuevo objeto de configuración

#### Formato de Uso (Nuevo - Recomendado)

```javascript
// Recalcular porcentajes basados en un total global
apexGridUtils.recalculateAllRows('DetallesP', {
    sourceColumns: ['TOTAL'], 
    targetColumn: 'PORCENTAJE', 
    formula: function(values) {
        const totalGlobal = apexUtils.get('P916_TOTAL_PROD');
        if (totalGlobal <= 0) return 0;
        return (values.TOTAL / totalGlobal) * 100;
    },
    decimalPlaces: 3,
    delay: 50  // Delay opcional en milisegundos
});

// Recalcular precios con IVA
apexGridUtils.recalculateAllRows('Productos', {
    sourceColumns: ['PRECIO_BASE'], 
    targetColumn: 'PRECIO_CON_IVA', 
    formula: function(values) {
        return values.PRECIO_BASE * 1.21; // 21% IVA
    },
    decimalPlaces: 2
});

// Recalcular totales con descuento
apexGridUtils.recalculateAllRows('Detalles', {
    sourceColumns: ['SUBTOTAL', 'DESCUENTO'], 
    targetColumn: 'TOTAL_FINAL', 
    formula: function(values) {
        return values.SUBTOTAL * (1 - values.DESCUENTO / 100);
    },
    decimalPlaces: 2
});
```

#### Formato de Uso (Antiguo - Compatibilidad)

```javascript
// Formato antiguo para compatibilidad
apexGridUtils.recalculateAllRows(
    'DetallesP',                    // gridStaticId
    ['TOTAL'],                      // sourceColumns
    'PORCENTAJE',                   // targetColumn
    function(values) {              // formula
        const totalGlobal = apexUtils.get('P916_TOTAL_PROD');
        return totalGlobal > 0 ? (values.TOTAL / totalGlobal) * 100 : 0;
    },
    3,                              // decimalPlaces
    50                              // delay (opcional)
);
```

#### Parámetros

**Formato Nuevo (Objeto de configuración):**
- `gridStaticId` (string): Static ID del Interactive Grid
- `config.sourceColumns` (array): Array de nombres de columnas fuente
- `config.targetColumn` (string): Columna donde se guardará el resultado
- `config.formula` (function): Función que recibe `(values, record, index)` y retorna el valor a calcular
- `config.decimalPlaces` (number): Número de decimales para redondear (default: 2)
- `config.delay` (number): Delay en milisegundos (default: 50, aunque no se use en procesamiento síncrono)

**Formato Antiguo:**
- `gridStaticId` (string): Static ID del Interactive Grid
- `sourceColumns` (array): Array de nombres de columnas fuente
- `targetColumn` (string): Columna donde se guardará el resultado
- `formula` (function): Función que recibe `(values, record, index)` y retorna el valor a calcular
- `decimalPlaces` (number): Número de decimales para redondear (default: 2)
- `delay` (number): Delay en milisegundos (default: 50)

#### Ejemplos Prácticos

**1. Cálculo de Porcentajes**
```javascript
function recalcularPorcentajes() {
    apexGridUtils.recalculateAllRows('DetallesP', {
        sourceColumns: ['TOTAL'], 
        targetColumn: 'PORCENTAJE', 
        formula: function(values) {
            const totalGlobal = apexUtils.get('P916_TOTAL_PROD');
            if (totalGlobal <= 0) {
                console.warn('apexGridUtils: Total global es 0 o negativo');
                return 0;
            }
            const porcentaje = (values.TOTAL / totalGlobal) * 100;
            console.log('Porcentaje calculado:', porcentaje);
            return porcentaje;
        },
        decimalPlaces: 3
    });
}
```

**2. Aplicación de Descuentos**
```javascript
function aplicarDescuentoGlobal(porcentajeDescuento) {
    apexGridUtils.recalculateAllRows('Productos', {
        sourceColumns: ['PRECIO_ORIGINAL'], 
        targetColumn: 'PRECIO_FINAL', 
        formula: function(values) {
            return values.PRECIO_ORIGINAL * (1 - porcentajeDescuento / 100);
        },
        decimalPlaces: 2
    });
}

// Usar: aplicarDescuentoGlobal(15); // 15% de descuento
```

**3. Cálculo de Totales con Impuestos**
```javascript
function recalcularConImpuestos() {
    apexGridUtils.recalculateAllRows('Factura', {
        sourceColumns: ['SUBTOTAL', 'IVA_PORCENTAJE'], 
        targetColumn: 'TOTAL_CON_IVA', 
        formula: function(values) {
            return values.SUBTOTAL * (1 + values.IVA_PORCENTAJE / 100);
        },
        decimalPlaces: 2
    });
}
```

**4. Normalización de Datos**
```javascript
function normalizarPrecios() {
    apexGridUtils.recalculateAllRows('Productos', {
        sourceColumns: ['PRECIO_ACTUAL'], 
        targetColumn: 'PRECIO_NORMALIZADO', 
        formula: function(values) {
            // Redondear a múltiplos de 0.50
            return Math.round(values.PRECIO_ACTUAL * 2) / 2;
        },
        decimalPlaces: 2
    });
}
```

#### Características Avanzadas

**Detección Automática de Registros Eliminados:**
```javascript
// La función automáticamente detecta y salta registros marcados para eliminación
// No necesitas hacer nada especial, simplemente funciona

apexGridUtils.recalculateAllRows('mi_grid', {
    sourceColumns: ['VALOR'], 
    targetColumn: 'CALCULADO', 
    formula: function(values) {
        return values.VALOR * 2;
    }
});
// Los registros marcados para eliminación se saltan automáticamente
```

**Manejo de Errores Robusto:**
```javascript
// Si una fila falla, la función continúa con las siguientes
apexGridUtils.recalculateAllRows('mi_grid', {
    sourceColumns: ['A', 'B'], 
    targetColumn: 'RESULTADO', 
    formula: function(values) {
        // Si hay división por cero, la función maneja el error
        return values.A / values.B;
    }
});
```

**Logging Detallado:**
```javascript
// La función proporciona logs informativos
apexGridUtils.recalculateAllRows('mi_grid', {
    sourceColumns: ['TOTAL'], 
    targetColumn: 'PORCENTAJE', 
    formula: function(values) {
        return values.TOTAL * 0.1;
    }
});

// Logs que verás en la consola:
// 🔄 apexGridUtils: Recalculando todas las filas en mi_grid -> PORCENTAJE (delay: 50ms)
// ⏭️ apexGridUtils: Saltando registro 123 - marcado para eliminación
// ✅ apexGridUtils: Recalculación completada - 5 filas procesadas, 1 filas saltadas
```

#### Casos de Uso Comunes

1. **Recálculo de Porcentajes** cuando cambia un total global
2. **Aplicación de Descuentos** masivos a productos
3. **Cálculo de Impuestos** en facturas
4. **Normalización de Datos** en lotes
5. **Recálculo de Totales** cuando cambian fórmulas de negocio
6. **Aplicación de Tarifas** o comisiones

#### Ventajas sobre Otras Soluciones

- ✅ **Más rápido** que iterar fila por fila manualmente
- ✅ **Más seguro** que modificar el modelo directamente
- ✅ **Más robusto** con detección automática de errores
- ✅ **Más flexible** con fórmulas personalizadas
- ✅ **Mejor logging** para debugging
- ✅ **Compatible** con registros marcados para eliminación

## 🎯 Sistema de Re-enfoque Automático de Celdas

### Descripción

El sistema de re-enfoque automático permite que cuando el usuario cambie entre ventanas o aplicaciones y regrese al navegador, el foco se restaure automáticamente en la última celda del Interactive Grid que tenía seleccionada. Esto mejora significativamente la experiencia del usuario al trabajar con múltiples ventanas.

### Características

- ✅ **Captura automática**: Detecta cuando el usuario hace foco en una celda del Interactive Grid
- ✅ **Restauración inteligente**: Restaura el foco cuando vuelves a la ventana del navegador
- ✅ **Manejo de errores**: Gestiona casos donde la celda ya no existe o no es válida
- ✅ **Inicialización automática**: Se activa automáticamente al cargar el módulo
- ✅ **Control manual**: Permite habilitar/deshabilitar el sistema según necesidades

### Funciones Disponibles

#### initializeFocusRestoration(enable)

Inicializa o configura el sistema de re-enfoque automático.

```javascript
// Habilitar el sistema (por defecto)
apexGridUtils.initializeFocusRestoration(true);

// Deshabilitar el sistema
apexGridUtils.initializeFocusRestoration(false);
```

**Parámetros:**
- `enable` (boolean): Si debe habilitar el sistema (default: true)

**Retorna:** `boolean` - true si se configuró correctamente

#### enableFocusRestoration()

Habilita el sistema de re-enfoque automático.

```javascript
// Habilitar el sistema
apexGridUtils.enableFocusRestoration();
```

**Retorna:** `boolean` - true si se habilitó correctamente

#### disableFocusRestoration()

Deshabilitar el sistema de re-enfoque automático.

```javascript
// Deshabilitar el sistema
apexGridUtils.disableFocusRestoration();
```

**Retorna:** `boolean` - true si se deshabilitó correctamente

#### getLastFocusedCell()

Obtiene la última celda que tuvo el foco.

```javascript
// Obtener la última celda enfocada
const lastCell = apexGridUtils.getLastFocusedCell();

if (lastCell) {
    console.log('Última celda enfocada:', lastCell);
    console.log('Contenido:', lastCell.textContent);
}
```

**Retorna:** `HTMLElement|null` - Elemento de la celda o null si no hay

#### setLastFocusedCell(cellElement)

Establece manualmente la última celda enfocada.

```javascript
// Establecer manualmente una celda específica
const cellElement = document.querySelector('.a-GV-cell[data-column="COSTO"]');
apexGridUtils.setLastFocusedCell(cellElement);
```

**Parámetros:**
- `cellElement` (HTMLElement): Elemento de la celda del Interactive Grid

**Retorna:** `boolean` - true si se estableció correctamente

#### restoreFocus(delay)

Restaura el foco manualmente en la última celda enfocada.

```javascript
// Restaurar foco con delay por defecto (50ms)
apexGridUtils.restoreFocus();

// Restaurar foco con delay personalizado
apexGridUtils.restoreFocus(100);
```

**Parámetros:**
- `delay` (number): Delay en milisegundos antes de restaurar (default: 50)

**Retorna:** `boolean` - true si se restauró correctamente

#### clearLastFocusedCell()

Limpia la referencia de la última celda enfocada.

```javascript
// Limpiar referencia de última celda
apexGridUtils.clearLastFocusedCell();
```

#### getFocusRestorationStatus()

Obtiene el estado completo del sistema de re-enfoque.

```javascript
// Obtener estado del sistema
const status = apexGridUtils.getFocusRestorationStatus();

console.log('Sistema habilitado:', status.enabled);
console.log('Hay celda enfocada:', status.hasLastFocusedCell);
console.log('Información de celda:', status.cellInfo);
```

**Retorna:** `object` - Objeto con el estado del sistema
```javascript
{
    enabled: true,
    lastFocusedCell: HTMLElement,
    hasLastFocusedCell: true,
    cellInfo: {
        tagName: 'TD',
        className: 'a-GV-cell a-GV-cell--editable',
        id: 'cell_123',
        textContent: '1.234,56'
    }
}
```

### Uso Automático

El sistema se inicializa automáticamente cuando se carga el módulo `apexGridUtils`. No necesitas hacer nada adicional:

1. **El usuario hace foco** en una celda del Interactive Grid
2. **Cambia a otra ventana** o aplicación
3. **Vuelve a la ventana** del navegador
4. **El foco se restaura automáticamente** en la última celda

### Ejemplos de Uso

#### Ejemplo Básico

```javascript
// El sistema funciona automáticamente, pero puedes verificar su estado
const status = apexGridUtils.getFocusRestorationStatus();
console.log('Sistema de re-enfoque:', status.enabled ? 'Habilitado' : 'Deshabilitado');
```

#### Ejemplo con Control Manual

```javascript
// Deshabilitar temporalmente el sistema
apexGridUtils.disableFocusRestoration();

// Realizar operaciones que no quieres que interfieran con el foco
apexGridUtils.setCellValue('mi_grid', 'COSTO', 1, 1.500,50);

// Rehabilitar el sistema
apexGridUtils.enableFocusRestoration();
```

#### Ejemplo con Restauración Manual

```javascript
// Después de una operación programática, restaurar foco manualmente
apexGridUtils.setCellValue('mi_grid', 'COSTO', 1, 1.500,50);
apexGridUtils.restoreFocus(100); // Restaurar con 100ms de delay
```

#### Ejemplo con Debug

```javascript
// Verificar qué celda tiene el foco actualmente
const lastCell = apexGridUtils.getLastFocusedCell();
if (lastCell) {
    console.log('Celda actual:', {
        contenido: lastCell.textContent,
        columna: lastCell.getAttribute('data-column'),
        fila: lastCell.getAttribute('data-row')
    });
}
```

### Casos de Uso Comunes

#### 1. Trabajo con Múltiples Ventanas

```javascript
// El usuario está editando una celda en el grid
// Cambia a Excel para copiar un valor
// Vuelve al navegador → El foco se restaura automáticamente
```

#### 2. Integración con Otras Aplicaciones

```javascript
// El usuario está en una celda del grid
// Abre una calculadora externa
// Regresa al navegador → Continúa editando donde se quedó
```

#### 3. Control Programático

```javascript
// Deshabilitar temporalmente durante operaciones masivas
apexGridUtils.disableFocusRestoration();

// Realizar múltiples cambios
for (let i = 1; i <= 10; i++) {
    apexGridUtils.setCellValue('mi_grid', 'COSTO', i, i * 100);
}

// Rehabilitar y restaurar foco
apexGridUtils.enableFocusRestoration();
apexGridUtils.restoreFocus();
```

### Configuración Avanzada

#### Personalizar el Delay de Restauración

```javascript
// Restaurar foco con delay personalizado para casos especiales
apexGridUtils.restoreFocus(200); // 200ms de delay
```

#### Verificar Estado del Sistema

```javascript
// Verificar si el sistema está funcionando correctamente
const status = apexGridUtils.getFocusRestorationStatus();

if (!status.enabled) {
    console.warn('Sistema de re-enfoque deshabilitado');
    apexGridUtils.enableFocusRestoration();
}

if (!status.hasLastFocusedCell) {
    console.log('No hay celda enfocada registrada');
}
```

### Solución de Problemas

#### El foco no se restaura

```javascript
// Verificar si el sistema está habilitado
const status = apexGridUtils.getFocusRestorationStatus();
console.log('Estado del sistema:', status);

// Rehabilitar si es necesario
if (!status.enabled) {
    apexGridUtils.enableFocusRestoration();
}
```

#### Restauración manual cuando falla la automática

```javascript
// Si la restauración automática falla, usar restauración manual
apexGridUtils.restoreFocus(100);
```

#### Limpiar referencia corrupta

```javascript
// Si hay problemas con la celda almacenada
apexGridUtils.clearLastFocusedCell();
apexGridUtils.enableFocusRestoration();
```

### Notas Técnicas

- **Namespaces únicos**: Los eventos usan `.apexGridUtils` para evitar conflictos
- **Limpieza automática**: Se remueven eventos anteriores antes de agregar nuevos
- **Manejo de errores**: Captura y maneja errores de foco inválido automáticamente
- **Delay configurable**: 50ms por defecto para evitar conflictos con otros eventos
- **Inicialización automática**: Se activa automáticamente al cargar el módulo

### Compatibilidad

- ✅ **APEX 18.1+**: Compatible con todas las versiones modernas
- ✅ **Interactive Grids**: Funciona con todos los tipos de Interactive Grids
- ✅ **Múltiples Grids**: Funciona simultáneamente con múltiples grids en la misma página
- ✅ **Navegadores**: Compatible con Chrome, Firefox, Safari, Edge

## 🔧 Utilidades Generales

### apexUtils.getNumeric(itemName, defaultValue)

Obtiene el valor numérico de un item de APEX, manejando automáticamente el formato europeo.

```javascript
// Obtener valor numérico
let total = apexUtils.getNumeric('P1_TOTAL', 0);

// Versión abreviada
let total = apexUtils.get('P1_TOTAL', 0);

// Obtener múltiples valores
let [costo1, costo2] = apexUtils.getMultipleNumeric(['P1_COSTO1', 'P1_COSTO2'], 0);
```

**Características:**
- Maneja formato europeo (1.234,56 → 1234.56)
- Convierte automáticamente strings a números
- Proporciona valor por defecto si la conversión falla

### apexUtils.get(itemName, defaultValue)

Alias abreviado de `apexUtils.getNumeric`. Obtiene el valor numérico de un item de APEX de forma más concisa.

```javascript
// Obtener valor numérico (forma abreviada)
let total = apexUtils.get('P1_TOTAL', 0);

// Obtener valor con valor por defecto personalizado
let precio = apexUtils.get('P1_PRECIO', 100);

// Obtener valor sin valor por defecto (usa 0)
let cantidad = apexUtils.get('P1_CANTIDAD');
```

**Parámetros:**
- `itemName` (string): Nombre del item de APEX
- `defaultValue` (number): Valor por defecto si no se puede convertir (default: 0)

**Retorna:** `number` - Valor numérico convertido

**Características:**
- Alias de `apexUtils.getNumeric` para mayor concisión
- Maneja formato europeo automáticamente
- Convierte strings a números de forma segura
- Proporciona valor por defecto si la conversión falla
- Ideal para uso frecuente donde se necesita obtener valores numéricos rápidamente

### apexUtils.getMultipleNumeric(itemNames, defaultValue)

Obtiene múltiples valores numéricos de items de APEX en una sola llamada.

```javascript
// Obtener múltiples valores
let [costo1, costo2, costo3] = apexUtils.getMultipleNumeric(['P1_COSTO1', 'P1_COSTO2', 'P1_COSTO3'], 0);

// Obtener valores con valor por defecto personalizado
let [precio, cantidad, descuento] = apexUtils.getMultipleNumeric(['P1_PRECIO', 'P1_CANTIDAD', 'P1_DESCUENTO'], 100);

// Usar destructuring para mayor claridad
let valores = apexUtils.getMultipleNumeric(['P1_TOTAL', 'P1_SUBTOTAL'], 0);
let total = valores[0];
let subtotal = valores[1];
```

**Parámetros:**
- `itemNames` (array): Array de nombres de items de APEX
- `defaultValue` (number): Valor por defecto para todos los items (default: 0)

**Retorna:** `array` - Array de valores numéricos en el mismo orden que los items proporcionados

**Características:**
- Obtiene múltiples valores en una sola operación
- Mantiene el orden de los items en el array de entrada
- Aplica el mismo valor por defecto a todos los items
- Útil para obtener varios valores relacionados de una vez

## 🧩 Seteo masivo de valores en Interactive Grid

### apexGridUtils.setAllRowsValue(gridStaticId, targetColumn, valueOrFormula, options)

Setea un valor o cálculo en todas las filas de la columna `targetColumn`, asegurando persistencia en APEX (patrón null → string). Útil cuando APEX solo guarda si recibe string.

Parámetros:
- `gridStaticId` (string): Static ID del IG
- `targetColumn` (string): Columna a setear
- `valueOrFormula` (any|function): Valor fijo o función `(record, index, model) => valor`
- `options` (object):
  - `decimalPlaces` (number|null): Formatea números antes de convertirlos a string
  - `commit` (boolean): Confirma cambios por registro (default: true)
  - `refresh` (boolean): Refresca la vista al finalizar (default: true)
  - `onlyEditable` (boolean): Solo filas editables (default: true)

Ejemplo (repartir precio unitario):
```javascript
const totalPrecio = parseFloat(apex.item('P1194_TOTAL_PESO_LIQUIDACION').getValue()) || 0;
const cantidadAnimales = parseFloat(apex.item('P1194_CANT_ANIMALES').getValue()) || 0;
if (cantidadAnimales === 0) { apex.message.alert('La cantidad de animales no puede ser cero'); return; }
const precioUnitario = totalPrecio / cantidadAnimales;

apexGridUtils.setAllRowsValue('IG_DETALLE', 'PESO_LIQUIDACION', () => precioUnitario, {
  decimalPlaces: null,   // o 2 si deseas redondear
  commit: true,
  refresh: true,
  onlyEditable: true
});
```

### Versión corta: apexGridUtils.setAllRowsFixed(gridStaticId, targetColumn, value, options)

Setea el mismo valor fijo en todas las filas (atajo de `setAllRowsValue`).

```javascript
// Setear el mismo valor fijo en todas las filas
apexGridUtils.setAllRowsFixed('IG_DETALLE', 'PESO_LIQUIDACION', '123.45', {
  commit: true,
  refresh: true
});
```

## 🔄 Recalculación asíncrona con procesos APEX

### apexGridUtils.recalculateAllRowsAsync(gridStaticId, config)

Recalcula todas las filas usando un proceso APEX asíncrono por fila (estructura similar a `recalculateAllRows`).

Parámetros:
- `gridStaticId` (string): Static ID del IG
- `config` (object): Configuración del proceso asíncrono
  - `sourceColumns` (array): Columnas fuente del grid (ej: ['COD_ANIMAL', 'PESO_LIQUIDACION'])
  - `targetColumn` (string): Columna donde se guarda el resultado
  - `serverProcess` (string): Nombre del proceso APEX (ej: "GET_PRECIO_ESCALA")
  - `serverProcessParams` (array): Parámetros adicionales (ej: ['P1194_COD_EMPRESA', 'P1194_FEC_MOVIMIENTO'])
  - `formula` (function): Función que procesa la respuesta: `(result, record, index, model) => valor`
  - `decimalPlaces` (number): Decimales para formatear resultado (default: 2)
  - `delay` (number): Delay entre llamadas en ms (default: 50)
  - `showSpinner` (boolean): Mostrar spinner (default: true)
  - `maxConcurrent` (number): Máximo de llamadas concurrentes (default: 5)
  - `onComplete` (function): Callback al finalizar: `(completed, errors) => void`
  - `onError` (function): Callback de error por fila: `(error, record, index) => void`
  - `onlyEditable` (boolean): Solo filas editables (default: true)

Ejemplo (repartir precio por kilo usando proceso APEX):
```javascript
apexGridUtils.recalculateAllRowsAsync('IG_DETALLE', {
  sourceColumns: ['COD_ANIMAL', 'PESO_LIQUIDACION'], // se envían como x01, x02
  targetColumn: 'PRECIO_KILO_LIQUIDACION',           // donde se guarda el resultado
  serverProcess: 'GET_PRECIO_ESCALA',                // proceso APEX
  serverProcessParams: ['P1194_COD_EMPRESA', 'P1194_FEC_MOVIMIENTO'], // se envían como x03, x04
  formula: function(result, record, index, model) {  // procesar respuesta
    const precioKilo = parseFloat(result) || 0;
    const pesoLiquidacion = parseFloat(model.getValue(record, "PESO_LIQUIDACION")) || 0;
    const tipCambio = parseFloat($v("P1194_TIP_CAMBIO")) || 1;
    return Math.round((pesoLiquidacion * precioKilo / tipCambio) * 100) / 100;
  },
  decimalPlaces: 2,
  delay: 50,
  showSpinner: true,
  maxConcurrent: 3,
  onComplete: (completed, errors) => {
    console.log(`Procesadas: ${completed}, Errores: ${errors}`);
  }
});
```

**Cómo funciona automáticamente:**
- `sourceColumns` se envían como `x01`, `x02`, etc. (valores de las columnas del grid)
- `serverProcessParams` se envían como `x03`, `x04`, etc. con nomenclatura internacional:
  - `GRID:ACTIVO` → valor de la columna ACTIVO del grid
  - `ITEM:P1194_COD_EMPRESA` → valor del item de página
  - `P1194_COD_EMPRESA` → valor del item de página (compatibilidad, patrón P + números + _)
  - `'ACTIVO'`, `123`, `true` → valores directos
- `formula` procesa la respuesta del servidor y devuelve el valor final
- El resultado se setea automáticamente en `targetColumn`

**Ejemplo de parámetros:**
```javascript
serverProcessParams: [
  'GRID:ACTIVO',           // Columna del grid
  'ITEM:P1194_COD_EMPRESA', // Item de página
  'P1194_FEC_MOVIMIENTO',   // Item de página (compatibilidad, patrón P + números + _)
  'PUNTOS',                 // Texto directo (no es item porque no sigue patrón P + números + _)
  'ACTIVO',                 // Texto directo
  123,                      // Número directo
  true                      // Booleano directo
]
```

**Detección inteligente de tipos:**
- **Items de página**: Solo si siguen el patrón `P + números + _` (ej: `P1194_COD_EMPRESA`)
- **Columnas del grid**: Con prefijo `GRID:` (ej: `GRID:PUNTOS`, `GRID:ACTIVO`)
- **Items explícitos**: Con prefijo `ITEM:` (ej: `ITEM:P1194_COD_EMPRESA`)
- **Valores directos**: Todo lo demás (ej: `PUNTOS`, `ACTIVO`, `123`, `true`)

**Casos especiales resueltos:**
- `'PUNTOS'` → Valor directo (no es item porque no sigue patrón `P + números + _`)
- `'ACTIVO'` → Valor directo
- `'P1194_COD_EMPRESA'` → Item de página (sigue patrón `P + números + _`)
- `'GRID:PUNTOS'` → Columna del grid
- `'ITEM:P1194_COD_EMPRESA'` → Item de página

Características:
- ✅ **Control de concurrencia**: Evita sobrecargar el servidor
- ✅ **Spinner automático**: Muestra progreso visual
- ✅ **Manejo de errores**: Continúa procesando aunque falle una fila
- ✅ **Callbacks personalizables**: Para completar y manejar errores
- ✅ **Filtrado inteligente**: Omite filas marcadas para eliminación

## 📝 Ejemplos de Uso Completos

### Ejemplo 1: Factura con Cálculos Automáticos

```javascript
// Configurar cálculos automáticos para factura
apexGridUtils.setupAutoCalculation('factura_grid', {
    sourceColumns: ['CANTIDAD', 'PRECIO_UNITARIO'],
    targetColumn: 'SUBTOTAL',
    formula: function(values) {
        return values.CANTIDAD * values.PRECIO_UNITARIO;
    },
    decimalPlaces: 2,
    autoTrigger: true
});

// Configurar descuento
apexGridUtils.setupAutoCalculation('factura_grid', {
    sourceColumns: ['SUBTOTAL', 'PORCENTAJE_DESCUENTO'],
    targetColumn: 'DESCUENTO',
    formula: function(values) {
        return values.SUBTOTAL * (values.PORCENTAJE_DESCUENTO / 100);
    },
    decimalPlaces: 2,
    autoTrigger: true
});

// Configurar total final
apexGridUtils.setupAutoCalculation('factura_grid', {
    sourceColumns: ['SUBTOTAL', 'DESCUENTO'],
    targetColumn: 'TOTAL',
    formula: function(values) {
        return values.SUBTOTAL - values.DESCUENTO;
    },
    decimalPlaces: 2,
    autoTrigger: true
});

// Sumar totales automáticamente
apexGridUtils.sumColumnToItem('factura_grid', 'TOTAL', 'P1_TOTAL_FACTURA', 2, true);
```

### Ejemplo 2: Inventario con Validaciones

```javascript
// Extraer datos con validaciones
extraerDatosIG({
    regionId: 'inventario_grid',
    campos: [
        { 
            nombre: 'CODIGO', 
            alias: 'codigo_producto',
            obligatorio: true 
        },
        { 
            nombre: 'STOCK', 
            alias: 'stock_actual',
            condicion: function(valor) {
                return valor >= 0; // Solo stock positivo
            }
        },
        { 
            nombre: 'PRECIO', 
            alias: 'precio_formateado',
            transformacion: function(valor) {
                return new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'EUR'
                }).format(valor);
            }
        }
    ],
    campoDestino: 'P1_DATOS_INVENTARIO',
    formatoSalida: 'array',
    callback: function(datos) {
        console.log('Datos extraídos:', datos);
        // Procesar datos adicionales
    }
});
```

### Ejemplo 3: Formulario Dinámico

```javascript
// Configurar navegación automática
function navegarSiguienteCampo() {
    let campos = ['CODIGO', 'NOMBRE', 'DESCRIPCION', 'PRECIO'];
    let campoActual = 'CODIGO'; // Campo actual
    
    let indiceActual = campos.indexOf(campoActual);
    let siguienteCampo = campos[indiceActual + 1];
    
    if (siguienteCampo) {
        apexGridUtils.gotoSelectedCell('mi_grid', siguienteCampo);
    }
}

// Configurar validación en tiempo real
apexGridUtils.setupGridListener('mi_grid', function() {
    let precio = apexGridUtils.getSelectedNumericCellValue('mi_grid', 'PRECIO');
    let stock = apexGridUtils.getSelectedNumericCellValue('mi_grid', 'STOCK');
    
    if (precio < 0) {
        apex.message.alert('El precio no puede ser negativo');
    }
    
    if (stock < 0) {
        apex.message.alert('El stock no puede ser negativo');
    }
});
```

### Ejemplo 4: Carga Masiva de Datos

```javascript
// Cargar datos desde un archivo JSON o respuesta de API
let datosProductos = [
    { codigo: 'P001', descripcion: 'Laptop HP', precio: 1200, stock: 10 },
    { codigo: 'P002', descripcion: 'Mouse Inalámbrico', precio: 25, stock: 50 },
    { codigo: 'P003', descripcion: 'Teclado Mecánico', precio: 150, stock: 15 },
    { codigo: 'P004', descripcion: 'Monitor 24"', precio: 300, stock: 8 }
];

// Configuración avanzada con mapeo y validaciones
apexGridUtils.setearDatosIG({
    regionId: 'productos_grid',
    datos: datosProductos,
    mapeo: {
        'CODIGO': 'codigo',
        'NOMBRE': 'descripcion',
        'PRECIO': 'precio',
        'STOCK': 'stock'
    },
    transformacion: function(registro, indice) {
        // Agregar campos calculados
        registro.valor_total = registro.precio * registro.stock;
        registro.fecha_carga = new Date().toISOString();
        registro.usuario_carga = 'SISTEMA';
        return registro;
    },
    filtro: function(registro, indice) {
        // Solo cargar productos con stock > 0 y precio > 0
        return registro.stock > 0 && registro.precio > 0;
    },
    limpiarAntes: true,
    refrescar: true,
    modoEdicion: true,
    callback: function(resultado) {
        console.log(`Carga completada: ${resultado.procesados} productos cargados`);
        
        if (resultado.errores > 0) {
            apex.message.alert(`Se encontraron ${resultado.errores} errores durante la carga`);
        } else {
            apex.message.showPageSuccess('Productos cargados exitosamente');
        }
        
        // Configurar cálculos automáticos después de la carga
        apexGridUtils.setupCantidadPorCosto('productos_grid', 'STOCK', 'PRECIO', 'VALOR_TOTAL', 2);
    }
});

// Cargar datos desde un campo de página (útil para datos de procesos APEX)
function cargarDesdeProceso() {
    // Ejecutar proceso APEX que retorna JSON
    apex.server.process('OBTENER_PRODUCTOS', {
        pageItems: '#P1_CATEGORIA',
        success: function(data) {
            // Guardar datos en campo oculto
            apex.item('P1_DATOS_TEMPORALES').setValue(JSON.stringify(data));
            
            // Cargar en grid
            apexGridUtils.setearDatos('productos_grid', 'P1_DATOS_TEMPORALES');
        }
    });
}

// Carga incremental (sin limpiar datos existentes)
function agregarProductos() {
    let nuevosProductos = [
        { codigo: 'P005', descripcion: 'Auriculares', precio: 80, stock: 20 }
    ];
    
    apexGridUtils.setearDatosDirectos('productos_grid', nuevosProductos, false, true, true);
}
```

## 🎯 Casos de Aplicación

### 1. Gestión de Inventarios
- Cálculo automático de valores totales
- Validación de stock mínimo
- Actualización de precios con IVA

### 2. Facturación
- Cálculo automático de subtotales
- Aplicación de descuentos
- Cálculo de impuestos

### 3. Planificación de Proyectos
- Cálculo de horas totales
- Presupuestos automáticos
- Seguimiento de recursos

### 4. Gestión de Ventas
- Cálculo de comisiones
- Análisis de rendimiento
- Reportes automáticos

## 🔍 Funciones de Utilidad

### Normalización de Números

```javascript
// Normalizar formato europeo a estándar
let numero = apexGridUtils.normalizeNumber('1.234,56'); // Retorna 1234.56
```

### Verificación de Estado

```javascript
// Verificar si el módulo está inicializado
if (apexGridUtils.isInitialized()) {
    console.log('Módulo listo para usar');
}
```

## ⚠️ Consideraciones Importantes

1. **Static ID**: Asegúrate de que los Interactive Grids tengan un Static ID configurado
2. **Nombres de Columnas**: Los nombres de columnas deben coincidir exactamente con los definidos en el grid
3. **Formato de Números**: La biblioteca maneja automáticamente el formato europeo (1.234,56)
4. **Eventos**: Los cálculos automáticos se ejecutan cuando cambian las columnas fuente
5. **Rendimiento**: Para grids grandes, considera usar `autoTrigger: false` y ejecutar cálculos manualmente

## 🐛 Solución de Problemas

### Error: "Grid no encontrado"
- Verifica que el Static ID del grid sea correcto
- Asegúrate de que el grid esté completamente cargado antes de ejecutar las funciones

### Error: "Columna no encontrada"
- Verifica que el nombre de la columna coincida exactamente
- Los nombres de columnas son sensibles a mayúsculas/minúsculas

### Cálculos no se ejecutan automáticamente
- Verifica que `autoTrigger: true` esté configurado
- Asegúrate de que las columnas fuente estén incluidas en `sourceColumns`

### Valores no se actualizan correctamente
- Usa `setNumericCellValueWithCommit` para evitar sobrescrituras
- Verifica que el grid esté en modo de edición
- Considera usar `refreshGridAndRecalculate` después de cambios masivos

## 📞 Soporte

Para reportar problemas o solicitar nuevas funcionalidades, revisa los logs de la consola del navegador para obtener información detallada sobre errores y el estado de las operaciones.

### Configuraciones Específicas

#### setupCantidadPorCosto

Configuración rápida para el caso más común: CANTIDAD × COSTO = TOTAL

```javascript
// Configuración automática con valores por defecto
apexGridUtils.setupCantidadPorCosto('mi_grid');

// Configuración personalizada
apexGridUtils.setupCantidadPorCosto('mi_grid', 'QTY', 'PRICE', 'SUBTOTAL', 2);
```

#### ensureAutoCalculation

Verifica y configura cálculos automáticos si no existen

```javascript
// Verificar si existe configuración para TOTAL
apexGridUtils.ensureAutoCalculation('mi_grid', 'TOTAL');
```

### Gestión de Configuraciones

```javascript
// Obtener configuración específica
let config = apexGridUtils.getAutoCalculationConfig('mi_grid', 'TOTAL');

// Obtener todas las configuraciones del grid
let todasConfigs = apexGridUtils.getAutoCalculationConfig('mi_grid');

// Limpiar configuración específica
apexGridUtils.clearAutoCalculationConfig('mi_grid', 'TOTAL');

// Limpiar todas las configuraciones del grid
apexGridUtils.clearAutoCalculationConfig('mi_grid');

// Obtener todas las configuraciones almacenadas
let todas = apexGridUtils.getAllAutoCalculationConfigs();
```

### Inserción de Datos

#### setearDatosIG(configuracion)

Inserta datos en un Interactive Grid con configuración avanzada.

```javascript
// Configuración básica con datos directos
apexGridUtils.setearDatosIG({
    regionId: 'mi_grid',
    datos: [
        { id: 1, nombre: 'Producto A', precio: 100 },
        { id: 2, nombre: 'Producto B', precio: 200 }
    ],
    limpiarAntes: true,
    refrescar: true,
    modoEdicion: true
});

// Configuración con mapeo de campos
apexGridUtils.setearDatosIG({
    regionId: 'mi_grid',
    datos: [
        { codigo: 'A001', descripcion: 'Producto A', valor: 100 },
        { codigo: 'A002', descripcion: 'Producto B', valor: 200 }
    ],
    mapeo: {
        'ID': 'codigo',
        'NOMBRE': 'descripcion',
        'PRECIO': 'valor'
    },
    transformacion: function(registro, indice) {
        // Agregar fecha de creación
        registro.fecha_creacion = new Date().toISOString();
        return registro;
    },
    filtro: function(registro, indice) {
        // Solo insertar productos con valor > 50
        return registro.valor > 50;
    },
    callback: function(resultado) {
        console.log('Datos insertados:', resultado.procesados);
    }
});

// Configuración con datos desde campo de página
apexGridUtils.setearDatosIG({
    regionId: 'mi_grid',
    campoOrigen: 'P1_DATOS_JSON',
    limpiarAntes: true,
    refrescar: true
});
```

## 🔄 Sincronización Grid ↔ Items

### syncGridToItem(gridStaticId, columnName, itemName, options)

Sincroniza de Grid → Item. Al seleccionar una fila o cambiar la celda en la fila seleccionada, el valor de la columna `columnName` se copia en el item `itemName`.

Opciones:
- `debug` (boolean): habilita logs en consola.

Ejemplo:
```javascript
apexGridUtils.syncGridToItem('IG_TRANSACCIONES', 'SER_COMPROBANTE', 'P1194_SER_COMPROBANTE', {
  debug: true
});
```

Notas:
- Si la columna del IG es Popup LOV y el modelo devuelve `{v, d}`, se toma automáticamente `v` para setear en el item.

### syncItemToGrid(gridStaticId, columnName, itemName, options)

Sincroniza de Item → Grid. Al cambiar el item `itemName`, se escribe el valor en la columna `columnName` de la fila seleccionada del IG.

Opciones:
- `debug` (boolean)
- `pushInitial` (boolean): si es `true`, al inicializar empuja el valor actual del item hacia la fila seleccionada.
- `asPopupLov` (boolean): si es `true`, escribe en el IG con formato `{v, d}` (útil cuando la columna del IG es Popup LOV).

Ejemplos:
```javascript
// Valor simple (columna no LOV)
apexGridUtils.syncItemToGrid('IG_TRANSACCIONES', 'SER_COMPROBANTE', 'P1194_SER_COMPROBANTE', { debug: true });

// Columna Popup LOV: enviar {v, d}
apexGridUtils.syncItemToGrid('IG_TRANSACCIONES', 'COD_CLIENTE', 'P1194_COD_CLIENTE', {
  debug: true,
  asPopupLov: true
});

// Empujar el valor inicial del item a la fila seleccionada
apexGridUtils.syncItemToGrid('IG_TRANSACCIONES', 'COD_CLIENTE', 'P1194_COD_CLIENTE', {
  debug: true,
  asPopupLov: true,
  pushInitial: true
});
```

Notas:
- Para Popup LOV se intenta obtener el display (`d`) desde el item; si no está disponible, se usa `v` como `d`.

### syncGridItemValues(gridStaticId, columnName, itemName, options)

Sincronización bidireccional Grid ↔ Item. Combina `syncGridToItem` y `syncItemToGrid` en una sola llamada.

Opciones:
- `debug` (boolean)
- `asPopupLov` (boolean): cuando el item cambia se envía `{v, d}` al IG.
- `pushInitialGridToItem` (boolean): si `true` (default), copia el valor del IG → item al iniciar.
- `pushInitialItemToGrid` (boolean): si `true`, empuja el valor del item → IG al iniciar.

Ejemplos:
```javascript
// Bidireccional, valores simples
apexGridUtils.syncGridItemValues('IG_TRANSACCIONES', 'SER_COMPROBANTE', 'P1194_SER_COMPROBANTE', { debug: true });

// Bidireccional con Popup LOV
apexGridUtils.syncGridItemValues('IG_TRANSACCIONES', 'TIP_COMPROBANTE', 'P1194_TIP_COMPROBANTE', {
  debug: true,
  asPopupLov: true,
  pushInitialGridToItem: true,
  pushInitialItemToGrid: false
});
```

Notas importantes:
- Grid → Item siempre normaliza a `v` cuando la celda del IG devuelve `{v, d}`.
- Si no hay fila seleccionada, Item → Grid no ejecuta cambios hasta que selecciones una fila.
- Las funciones limpian listeners previos para evitar duplicados si se invocan múltiples veces.

**Parámetros:**
- `configuracion.regionId` (string): ID de la región del Interactive Grid
- `configuracion.datos` (array|object): Datos a insertar (opcional si se usa campoOrigen)
- `configuracion.campoOrigen` (string): Campo de la página que contiene los datos JSON (opcional si se usa datos)
- `configuracion.mapeo` (object): Mapeo personalizado de campos {campoDestino: campoOrigen}
- `configuracion.transformacion` (function): Función para transformar cada registro antes de insertar
- `configuracion.filtro` (function): Función para filtrar registros antes de insertar
- `configuracion.limpiarAntes` (boolean): Si debe limpiar datos existentes (default: true)
- `configuracion.refrescar` (boolean): Si debe refrescar la grilla (default: true)
- `configuracion.modoEdicion` (boolean): Si debe habilitar modo edición (default: true)
- `configuracion.callback` (function): Función a ejecutar después de setear datos

**Retorna:** `object` - Objeto con resultado de la operación
```javascript
{
    success: true,
    procesados: 5,
    errores: 0,
    total: 5
}
```

#### setearDatosDirectos(regionId, datos, limpiar, refrescar, modoEdicion)

Versión simplificada para insertar datos directamente.

```javascript
// Insertar datos simples
let datos = [
    { ID: 1, NOMBRE: 'Producto A', PRECIO: 100 },
    { ID: 2, NOMBRE: 'Producto B', PRECIO: 200 }
];

apexGridUtils.setearDatosDirectos('mi_grid', datos);

// Insertar sin limpiar datos existentes
apexGridUtils.setearDatosDirectos('mi_grid', datos, false, true, true);
```

**Parámetros:**
- `regionId` (string): ID de la región del Interactive Grid
- `datos` (array|object): Datos a insertar
- `limpiar` (boolean): Si debe limpiar datos existentes (default: true)
- `refrescar` (boolean): Si debe refrescar la grilla (default: true)
- `modoEdicion` (boolean): Si debe habilitar modo edición (default: true)

#### setearDatos(regionId, campoOrigen, limpiar, refrescar, modoEdicion)

Inserta datos desde un campo de la página que contiene JSON.

```javascript
// Insertar desde campo P1_DATOS_JSON
apexGridUtils.setearDatos('mi_grid', 'P1_DATOS_JSON');

// Insertar sin limpiar y sin refrescar
apexGridUtils.setearDatos('mi_grid', 'P1_DATOS_JSON', false, false, true);
```

**Parámetros:**
- `regionId` (string): ID de la región del Interactive Grid
- `campoOrigen` (string): Campo de la página que contiene los datos JSON
- `limpiar` (boolean): Si debe limpiar datos existentes (default: true)
- `refrescar` (boolean): Si debe refrescar la grilla (default: true)
- `modoEdicion` (boolean): Si debe habilitar modo edición (default: true)

#### refreshGridSafe(gridStaticId, commitChanges, refreshRegion)

Refresca el grid de manera segura, confirmando cambios antes de refrescar para evitar pérdida de datos.

```javascript
// Refrescar de manera segura (confirma cambios + refresca región)
apexGridUtils.refreshGridSafe('mi_grid', true, true);

// Refrescar de manera segura solo vista (confirma cambios + solo vista)
apexGridUtils.refreshGridSafe('mi_grid', true, false);

// Refrescar sin confirmar cambios (equivalente a clearChanges)
apexGridUtils.refreshGridSafe('mi_grid', false, true);

// Refrescar sin confirmar cambios, solo vista
apexGridUtils.refreshGridSafe('mi_grid', false, false);
```

**Parámetros:**
- `gridStaticId` (string): Static ID del Interactive Grid
- `commitChanges` (boolean): Si debe confirmar cambios antes de refrescar (default: true)
- `refreshRegion` (boolean): Si debe refrescar también la región completa (default: false)

**Retorna:** `boolean` - true si se refrescó correctamente

**Casos de Uso:**

```javascript
// Equivalente a tu código: clearChanges() + region().refresh()
apexGridUtils.refreshGridSafe('DetallesP', false, true);
//                                    ↑        ↑
//                              NO confirma  Refresca región

// Refrescar preservando cambios (más seguro)
apexGridUtils.refreshGridSafe('DetallesP', true, true);
//                                    ↑        ↑
//                              Confirma     Refresca región

// Refrescar solo vista preservando cambios
apexGridUtils.refreshGridSafe('DetallesP', true, false);
//                                    ↑        ↑
//                              Confirma     Solo vista
```

#### refreshGridViewOnly(gridStaticId, commitChanges)

Refresca solo la vista del grid sin recargar datos del servidor, confirmando cambios si es necesario.

```javascript
// Refrescar solo vista confirmando cambios
apexGridUtils.refreshGridViewOnly('mi_grid', true);

// Refrescar solo vista sin confirmar cambios
apexGridUtils.refreshGridViewOnly('mi_grid', false);
```

**Parámetros:**
- `gridStaticId` (string): Static ID del Interactive Grid
- `commitChanges` (boolean): Si debe confirmar cambios antes de refrescar (default: true)

**Retorna:** `boolean` - true si se refrescó correctamente

**Casos de Uso:**

```javascript
// Actualización visual rápida (preserva cambios)
apexGridUtils.refreshGridViewOnly('DetallesP', true);

// Actualización visual rápida (descarta cambios)
apexGridUtils.refreshGridViewOnly('DetallesP', false);

// Después de cambios programáticos
apexGridUtils.setCellValue('DetallesP', 'COSTO', 1, 1.500,50, false);
apexGridUtils.refreshGridViewOnly('DetallesP', true); // Solo actualizar vista
```

### Comparación de Funciones de Refresh

| Función | Confirma Cambios | Refresca Región | Velocidad | Uso Recomendado |
|---------|------------------|-----------------|-----------|-----------------|
| `refreshGrid()` | ❌ No | ✅ Opcional | ⚡ Rápido | Refresh simple |
| `refreshGridSafe()` | ✅ Opcional | ✅ Opcional | 🐌 Medio | Refresh seguro |
| `refreshGridViewOnly()` | ✅ Opcional | ❌ No | ⚡ Muy rápido | Solo vista |
| `refreshGridAndRecalculateSimple()` | ❌ No | ✅ Sí | 🐌 Lento | Refresh + recálculo |

**Guía de Selección:**

```javascript
// 🚀 Para actualizaciones visuales rápidas
apexGridUtils.refreshGridViewOnly('DetallesP', true);

// 🛡️ Para refresh seguro preservando cambios
apexGridUtils.refreshGridSafe('DetallesP', true, true);

// 🔄 Para refresh simple (equivalente a tu código)
apexGridUtils.refreshGrid('DetallesP', true);

// 📊 Para refresh con recálculo automático
apexGridUtils.refreshGridAndRecalculateSimple('DetallesP', 'TOTAL', 100);
```

### Funciones de Confirmación de Cambios

```

### setItemOnRowSelect(gridStaticId, columnName, itemName)

Escucha la **selección de fila** en un Interactive Grid y setea el valor de una columna en un item de página. Útil cuando solo necesitas actualizar el item al seleccionar una fila (modo solo visualización).

```javascript
// Al seleccionar una fila, se setea el valor de la columna COD_ANIMAL en el item P1100_COD_ANIMAL_AUX
apexGridUtils.setItemOnRowSelect('IG_ANIMALES', 'COD_ANIMAL', 'P1100_COD_ANIMAL_AUX');
```

**Parámetros:**
- `gridStaticId` (string): Static ID del IG
- `columnName` (string): Nombre de la columna a extraer
- `itemName` (string): Nombre del item de página donde setear el valor

**Retorna:** `boolean` - true si se configuró correctamente

---

### setItemOnRowOrCellChange(gridStaticId, columnName, itemName)

Escucha tanto la **selección de fila** como los **cambios en una columna específica** (por edición, proceso server-side, etc) y setea el valor en un item de página. Es la opción recomendada para grids editables o cuando los valores pueden cambiar automáticamente.

```javascript
// Al seleccionar una fila o cambiar el valor de la columna COD_ANIMAL, se setea el item
apexGridUtils.setItemOnRowOrCellChange('IG_ANIMALES', 'COD_ANIMAL', 'P1100_COD_ANIMAL_AUX');
```

**Parámetros:**
- `gridStaticId` (string): Static ID del IG
- `columnName` (string): Nombre de la columna a extraer
- `itemName` (string): Nombre del item de página donde setear el valor

**Retorna:** `boolean` - true si se configuró correctamente

---

#### ¿Cuál usar?
- **Solo visualización:** Usa `setItemOnRowSelect`.
- **Edición o cambios automáticos:** Usa `setItemOnRowOrCellChange` (recomendado para la mayoría de los casos).

#### Ejemplo práctico
```javascript
// Solo necesitas una de las dos, según tu caso:
apexGridUtils.setItemOnRowOrCellChange('IG_ANIMALES', 'COD_ANIMAL', 'P1100_COD_ANIMAL_AUX');
// o
apexGridUtils.setItemOnRowSelect('IG_ANIMALES', 'COD_ANIMAL', 'P1100_COD_ANIMAL_AUX');
```

---

## 🆕 Nuevas Funciones de Asignación y Sincronización

### setValueToSelectedRow(gridStaticId, columnName, value)

Asigna un valor a una columna específica de la fila actualmente seleccionada en la grilla.

```javascript
// Asignar un valor a la fila seleccionada
apexGridUtils.setValueToSelectedRow('IG_ANIMALES', 'COD_ANIMAL', 'NUEVO_VALOR');

// Asignar valor numérico
apexGridUtils.setValueToSelectedRow('IG_ANIMALES', 'PRECIO', 1.500,50);

// Asignar desde un item de página
let valor = apex.item('P1_VALOR').getValue();
apexGridUtils.setValueToSelectedRow('IG_ANIMALES', 'COD_ANIMAL', valor);
```

**Parámetros:**
- `gridStaticId` (string): Static ID del Interactive Grid
- `columnName` (string): Nombre de la columna donde asignar el valor
- `value` (any): Valor a asignar

**Retorna:** `boolean` - true si se asignó correctamente, false en caso contrario

**Características:**
- ✅ Solo actualiza la fila seleccionada
- ✅ Manejo de errores robusto
- ✅ Logging detallado para debugging
- ✅ Verifica que haya una fila seleccionada antes de asignar

---

### selectFirstRowOnInit(gridStaticId, callback)

Selecciona automáticamente la primera fila de la grilla al inicializar. Útil para mejorar la experiencia del usuario al cargar la página.

```javascript
// Seleccionar automáticamente la primera fila al inicializar
apexGridUtils.selectFirstRowOnInit('IG_ANIMALES');

// Con callback para ejecutar código adicional
apexGridUtils.selectFirstRowOnInit('IG_ANIMALES', function(firstRecord) {
    console.log('Primera fila seleccionada:', firstRecord);
    // Aquí puedes ejecutar código adicional
    apexGridUtils.setValueToSelectedRow('IG_ANIMALES', 'ESTADO', 'SELECCIONADO');
});
```

**Parámetros:**
- `gridStaticId` (string): Static ID del Interactive Grid
- `callback` (function): Función opcional a ejecutar después de seleccionar la primera fila

**Retorna:** `boolean` - true si se configuró correctamente, false en caso contrario

**Características:**
- ✅ Selección automática al cargar datos
- ✅ Maneja casos donde los datos se cargan después
- ✅ Callback opcional para código adicional
- ✅ Funciona con datos cargados dinámicamente

**Ubicación recomendada:** En el evento "Page Load" de tu página APEX

---

### syncItemWithGridColumn(gridStaticId, columnName, itemName, options)

**Sincronización bidireccional** entre un item de página y una columna de la grilla. Cuando cambias el item, se actualiza la columna de la fila seleccionada, y viceversa.

```javascript
// Sincronización básica
apexGridUtils.syncItemWithGridColumn('IG_ANIMALES', 'COD_ANIMAL', 'P1100_COD_ANIMAL_AUX');

// Con debug para ver logs en consola
apexGridUtils.syncItemWithGridColumn('IG_ANIMALES', 'COD_ANIMAL', 'P1100_COD_ANIMAL_AUX', {
    debug: true
});

// Combinado con selección automática de primera fila
apexGridUtils.selectFirstRowOnInit('IG_ANIMALES');
apexGridUtils.syncItemWithGridColumn('IG_ANIMALES', 'COD_ANIMAL', 'P1100_COD_ANIMAL_AUX');
```

**Parámetros:**
- `gridStaticId` (string): Static ID del Interactive Grid
- `columnName` (string): Nombre de la columna a sincronizar
- `itemName` (string): Nombre del item de página a sincronizar
- `options` (object): Opciones adicionales de configuración
  - `options.debug` (boolean): Si debe mostrar logs en consola (default: false)

**Retorna:** `boolean` - true si se configuró correctamente, false en caso contrario

**Características:**
- ✅ **Bidireccional**: Item → Grilla y Grilla → Item
- ✅ **Automática**: No necesitas código adicional
- ✅ **Inteligente**: Solo actualiza cuando la fila está seleccionada
- ✅ **Sin bucles infinitos**: Evita actualizaciones circulares
- ✅ **Sincronización inicial**: Al cargar, sincroniza el item con la fila seleccionada
- ✅ **Manejo de errores**: Robusto ante fallos

**Flujo de Funcionamiento:**

1. **Item → Grilla**: 
   - Usuario cambia el valor en el item `P1100_COD_ANIMAL_AUX`
   - Se detecta el cambio con el evento `change`
   - Se obtiene la fila actualmente seleccionada en la grilla
   - Se actualiza la columna `COD_ANIMAL` de esa fila

2. **Grilla → Item**:
   - Usuario cambia el valor en la columna `COD_ANIMAL` de la grilla
   - Se detecta el cambio en el modelo de datos
   - Se actualiza el item `P1100_COD_ANIMAL_AUX`
   - También funciona cuando seleccionas otra fila (se sincroniza automáticamente)

**Ubicación recomendada:** En el evento "Page Load" de tu página APEX

---

 

## 🎯 Casos de Uso Completos

### Caso 1: Formulario con Grilla Sincronizada

```javascript
// En Page Load
// 1. Seleccionar primera fila automáticamente
apexGridUtils.selectFirstRowOnInit('IG_ANIMALES');

// 2. Configurar sincronización bidireccional
apexGridUtils.syncItemWithGridColumn('IG_ANIMALES', 'COD_ANIMAL', 'P1100_COD_ANIMAL_AUX');

// 3. Configurar sincronización para otros campos
apexGridUtils.syncItemWithGridColumn('IG_ANIMALES', 'NOMBRE', 'P1100_NOMBRE_AUX');
apexGridUtils.syncItemWithGridColumn('IG_ANIMALES', 'PRECIO', 'P1100_PRECIO_AUX');
```

### Caso 2: Asignación Programática de Valores

```javascript
// Asignar valores desde procesos APEX
function asignarValoresDesdeProceso() {
    // Obtener valores de items
    let codigo = apex.item('P1_CODIGO').getValue();
    let nombre = apex.item('P1_NOMBRE').getValue();
    let precio = apex.item('P1_PRECIO').getValue();
    
    // Asignar a la fila seleccionada
    apexGridUtils.setValueToSelectedRow('IG_ANIMALES', 'COD_ANIMAL', codigo);
    apexGridUtils.setValueToSelectedRow('IG_ANIMALES', 'NOMBRE', nombre);
    apexGridUtils.setValueToSelectedRow('IG_ANIMALES', 'PRECIO', precio);
}
```

### Caso 3: Inicialización Completa

```javascript
// En Page Load - Configuración completa
function inicializarGrilla() {
    // 1. Seleccionar primera fila
    apexGridUtils.selectFirstRowOnInit('IG_ANIMALES', function(firstRecord) {
        console.log('Primera fila seleccionada automáticamente');
        
        // 2. Configurar sincronización
        apexGridUtils.syncItemWithGridColumn('IG_ANIMALES', 'COD_ANIMAL', 'P1100_COD_ANIMAL_AUX');
        
        // 3. Configurar cálculos automáticos
        apexGridUtils.setupAutoCalculation('IG_ANIMALES', {
            sourceColumns: ['CANTIDAD', 'PRECIO'],
            targetColumn: 'TOTAL',
            formula: function(values) {
                return values.CANTIDAD * values.PRECIO;
            },
            decimalPlaces: 2
        });
    });
}

// Ejecutar inicialización
inicializarGrilla();
```

### Caso 4: Debug y Monitoreo

```javascript
// Configurar con debug para monitorear sincronización
apexGridUtils.syncItemWithGridColumn('IG_ANIMALES', 'COD_ANIMAL', 'P1100_COD_ANIMAL_AUX', {
    debug: true
});

// Los logs aparecerán en la consola del navegador:
// apexGridUtils: Sincronización bidireccional configurada: {grid: "IG_ANIMALES", column: "COD_ANIMAL", item: "P1100_COD_ANIMAL_AUX"}
// apexGridUtils: Item -> Grid sync: {item: "P1100_COD_ANIMAL_AUX", value: "NUEVO_VALOR", column: "COD_ANIMAL"}
// apexGridUtils: Grid -> Item sync (selection): {column: "COD_ANIMAL", value: "VALOR_GRID", item: "P1100_COD_ANIMAL_AUX"}
```

---

## ⚠️ Consideraciones Importantes

### Timing de Ejecución
- **Page Load**: Ubicación recomendada para todas estas funciones
- **After Refresh**: Alternativa si Page Load no funciona
- **Delay**: Las funciones incluyen delays automáticos para asegurar que el grid esté listo

### Compatibilidad
- ✅ **APEX 18.1+**: Compatible con todas las versiones modernas
- ✅ **Interactive Grids**: Funciona con todos los tipos de Interactive Grids
- ✅ **Múltiples Grids**: Funciona simultáneamente con múltiples grids
- ✅ **Navegadores**: Compatible con Chrome, Firefox, Safari, Edge

### Solución de Problemas

#### La sincronización no funciona
```javascript
// Verificar que el grid esté cargado
var region = apex.region('IG_ANIMALES');
if (!region || !region.widget) {
    console.error('Grid no encontrado');
}

// Verificar que el item exista
if (!$('#' + 'P1100_COD_ANIMAL_AUX').length) {
    console.error('Item no encontrado');
}
```

#### La primera fila no se selecciona
```javascript
// Usar callback para verificar
apexGridUtils.selectFirstRowOnInit('IG_ANIMALES', function(firstRecord) {
    if (firstRecord) {
        console.log('Primera fila seleccionada correctamente');
    } else {
        console.warn('No se pudo seleccionar la primera fila');
    }
});
```

#### Valores no se asignan correctamente
```javascript
// Verificar que haya una fila seleccionada
var region = apex.region('IG_ANIMALES');
var view = region.widget().interactiveGrid('getViews', 'grid');
var selectedRecords = view.getSelectedRecords();

if (!selectedRecords || selectedRecords.length === 0) {
    console.warn('No hay fila seleccionada');
    // Seleccionar primera fila primero
    apexGridUtils.selectFirstRowOnInit('IG_ANIMALES');
}
```

## Cálculo Asíncrono de Filas

### `recalculateAllRowsAsync(gridStaticId, config)`

Recalcula valores para todas las filas llamando un proceso de servidor APEX de forma asíncrona con control de concurrencia.

#### Parámetros

- `gridStaticId` (string): Static ID del Interactive Grid
- `config` (object): Configuración del proceso
  - `sourceColumns` (array): Columnas fuente del grid
  - `targetColumn` (string): Columna destino donde se guardará el resultado
  - `serverProcess` (string): Nombre del proceso de servidor APEX
  - `serverProcessParams` (array): Parámetros adicionales para el proceso
  - `formula` (function): Función para procesar el resultado del servidor: (result, values, record, index) => value
  - `processValue` (function): Función para procesar valores antes de enviar al servidor: (value, columnName, record, index, model) => processedValue
  - `decimalPlaces` (number): Decimales para formatear resultado (default: 2)
  - `delay` (number): Delay entre llamadas en ms (default: 50)
  - `showSpinner` (boolean): Mostrar spinner durante el proceso (default: true)
  - `maxConcurrent` (number): Máximo de llamadas concurrentes (default: 5)
  - `onComplete` (function): Callback al finalizar
  - `onError` (function): Callback de error por fila
  - `onlyEditable` (boolean): Solo filas editables (default: true)

#### Nomenclatura de Parámetros

La función soporta una nomenclatura internacional para los parámetros:

- `GRID:COLUMN_NAME`: Extrae valor de la columna del grid
- `ITEM:P_ITEM_NAME`: Extrae valor del item de página
- `P_ITEM_NAME`: Compatibilidad con items que siguen el patrón P + números + _
- Valores directos: Cualquier otro string o valor se usa directamente

#### Ejemplo Básico

```javascript
apexGridUtils.recalculateAllRowsAsync('IG_DETALLE', {
    sourceColumns: ['PESO_LIQUIDACION', 'COD_ANIMAL'],
    targetColumn: 'PRECIO_LIQUIDACION',
    serverProcess: 'GET_PRECIO_ESCALA',
    serverProcessParams: [
        'ITEM:P1194_COD_EMPRESA',
        'ITEM:P1194_FEC_MOVIMIENTO', 
        'GRID:COD_ANIMAL',
        'GRID:PESO_LIQUIDACION'
    ],
    formula: function(result, values, record, index) {
        const pesoLiquidacion = parseFloat(values.PESO_LIQUIDACION) || 0;
        const tipCambio = parseFloat($v('P1194_TIP_CAMBIO')) || 1;
        const precioKilo = parseFloat(result) || 0;
        return Math.round((pesoLiquidacion * precioKilo / tipCambio) * 100) / 100;
    }
});
```

#### Ejemplo con Procesamiento de Valores

```javascript
apexGridUtils.recalculateAllRowsAsync('IG_DETALLE', {
    sourceColumns: ['PESO_LIQUIDACION', 'COD_ANIMAL'],
    targetColumn: 'PRECIO_LIQUIDACION',
    serverProcess: 'GET_PRECIO_ESCALA',
    serverProcessParams: [
        'ITEM:P1194_COD_EMPRESA',
        'ITEM:P1194_FEC_MOVIMIENTO', 
        'GRID:COD_ANIMAL',
        'GRID:PESO_LIQUIDACION'
    ],
    formula: function(result, values, record, index) {
        const pesoLiquidacion = parseFloat(values.PESO_LIQUIDACION) || 0;
        const tipCambio = parseFloat($v('P1194_TIP_CAMBIO')) || 1;
        const precioKilo = parseFloat(result) || 0;
        return Math.round((pesoLiquidacion * precioKilo / tipCambio) * 100) / 100;
    },
    processValue: function(value, columnName, record, index, model) {
        // Aplicar el mismo procesamiento que en código original
        if (columnName === 'PESO_LIQUIDACION') {
            return parseFloat(value) || 0;
        }
        return value; // Para otros valores, pasar tal como están
    }
});
```

#### Ejemplo con Control de Errores

```javascript
apexGridUtils.recalculateAllRowsAsync('IG_DETALLE', {
    sourceColumns: ['PESO_LIQUIDACION', 'COD_ANIMAL'],
    targetColumn: 'PRECIO_LIQUIDACION',
    serverProcess: 'GET_PRECIO_ESCALA',
    serverProcessParams: [
        'ITEM:P1194_COD_EMPRESA',
        'ITEM:P1194_FEC_MOVIMIENTO', 
        'GRID:COD_ANIMAL',
        'GRID:PESO_LIQUIDACION'
    ],
    formula: function(result, values, record, index) {
        const pesoLiquidacion = parseFloat(values.PESO_LIQUIDACION) || 0;
        const tipCambio = parseFloat($v('P1194_TIP_CAMBIO')) || 1;
        const precioKilo = parseFloat(result) || 0;
        return Math.round((pesoLiquidacion * precioKilo / tipCambio) * 100) / 100;
    },
    onComplete: function(completed, errors) {
        console.log(`Proceso completado: ${completed} filas procesadas, ${errors} errores`);
        if (errors > 0) {
            apex.message.alert(`Se procesaron ${completed} filas con ${errors} errores`);
        }
    },
    onError: function(error, record, index) {
        console.error(`Error en fila ${index}:`, error);
        apex.message.alert(`Error al procesar fila ${index + 1}`);
    }
});
```

#### Ejemplo con Configuración Avanzada

```javascript
apexGridUtils.recalculateAllRowsAsync('IG_DETALLE', {
    sourceColumns: ['PESO_LIQUIDACION', 'COD_ANIMAL'],
    targetColumn: 'PRECIO_LIQUIDACION',
    serverProcess: 'GET_PRECIO_ESCALA',
    serverProcessParams: [
        'ITEM:P1194_COD_EMPRESA',
        'ITEM:P1194_FEC_MOVIMIENTO', 
        'GRID:COD_ANIMAL',
        'GRID:PESO_LIQUIDACION'
    ],
    formula: function(result, values, record, index) {
        const pesoLiquidacion = parseFloat(values.PESO_LIQUIDACION) || 0;
        const tipCambio = parseFloat($v('P1194_TIP_CAMBIO')) || 1;
        const precioKilo = parseFloat(result) || 0;
        return Math.round((pesoLiquidacion * precioKilo / tipCambio) * 100) / 100;
    },
    decimalPlaces: 2,
    delay: 100,
    showSpinner: true,
    maxConcurrent: 3,
    onlyEditable: true
});
```

### Problemas con `recalculateAllRowsAsync`

#### Error ORA-01861: Formato de fecha incorrecto
```javascript
// Usar processValue para controlar el formato de datos
apexGridUtils.recalculateAllRowsAsync('IG_DETALLE', {
    // ... configuración
    processValue: function(value, columnName, record, index, model) {
        // Aplicar el mismo procesamiento que en código original
        if (columnName === 'PESO_LIQUIDACION') {
            return parseFloat(value) || 0;
        }
        return value; // Para otros valores, pasar tal como están
    }
});
```

#### Valores no se procesan correctamente
```javascript
// Verificar que los parámetros se estén pasando correctamente
apexGridUtils.recalculateAllRowsAsync('IG_DETALLE', {
    // ... configuración
    onError: function(error, record, index) {
        console.error(`Error en fila ${index}:`, error);
        console.log('Parámetros enviados:', params);
    }
});
```