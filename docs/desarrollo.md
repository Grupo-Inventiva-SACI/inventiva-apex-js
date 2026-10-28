# Guía de desarrollo

[Inicio](../README.md) · [Desarrollo](desarrollo.md) · [Manual](manual.md) · [API](referencia-api.md) · [Migración](migracion.md)

## Cómo agregar nuevas funciones

1. Abrir [invUtils.js](../invUtils.js) y ubicar la sección de implementación correspondiente: **GENERAL**, **ITEM** o **GRID**. Las funciones que combinan una grilla con un ítem pertenecen a GRID.
2. Declarar la función **dentro del módulo**, con un nombre en español y en `camelCase`. Documentar con JSDoc qué hace, sus parámetros y su retorno. Las funciones comparten un ámbito privado y pueden llamarse directamente por su nombre.
3. Buscar **API PÚBLICA — PUBLICAR AQUÍ LAS NUEVAS FUNCIONES**, al final del archivo. Agregar el nombre al `return`: en la raíz para utilidades generales, dentro de `item` para ítems o dentro de `grid` para grillas. Si es una función auxiliar interna, no publicarla.
4. Agregar la firma y el retorno a la [referencia de API](referencia-api.md), y un ejemplo al [manual](manual.md). Si cambia un nombre público, actualizar la [guía de migración](migracion.md). Mantener en inglés los nombres de métodos, eventos y opciones de Oracle APEX; no traducir, por ejemplo, `model.setValue` o `getSelectedRecords`.
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
function leerValorItem(nombreItem) {
    return apex.item(nombreItem).getValue();
}

// En el return final, agregar una propiedad a item:
item: {
    leerNumero,
    leerValorNumerico,
    leerNumeros,
    leerValor: leerValorItem
}

// Después de publicarla, desde una Dynamic Action:
const observacion = invUtils.item.leerValor("P10_OBSERVACION");
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

### Excepciones de longitud

El límite de tres palabras es recomendado. Se conservan estas excepciones para mantener las firmas existentes sin confundir selección, posición, formato o efectos:

| Distinción necesaria | Nombres |
|---|---|
| Navegación y destino | `irAPrimeraCelda`, `irACeldaSeleccionada` |
| Posición y redondeo | `leerNumeroSeleccionadoRedondeado`, `leerPrimerNumeroRedondeado` |
| Asignación seguida de recálculo | `asignarCeldaConRecalculo`, `asignarCeldaSeleccionadaConRecalculo`, `asignarPrimeraCeldaConRecalculo` |
| Posición y marcado numérico | `asignarNumeroSeleccionadoMarcado`, `asignarPrimerNumeroMarcado` |
| Desactivación temporal del formato | `asignarNumeroSinFormato`, `asignarNumeroSeleccionadoSinFormato`, `asignarPrimerNumeroSinFormato` |
| Posición y formato europeo | `asignarNumeroSeleccionadoEuropeo`, `asignarPrimerNumeroEuropeo` |
| Posición y marcado de cambios | `asignarCeldaSeleccionadaMarcada`, `asignarPrimeraCeldaMarcada` |
| Posición y verificación | `asignarCeldaSeleccionadaVerificada`, `asignarPrimeraCeldaVerificada` |
| Posición y activación | `asignarCeldaSeleccionadaActivada`, `asignarPrimeraCeldaActivada` |
| Pausa temporal de notificaciones del modelo | `asignarCeldaPausandoEventos`, `asignarCeldaSeleccionadaPausandoEventos`, `asignarPrimeraCeldaPausandoEventos` |

Para las funciones nuevas, intentar primero una firma sencilla con parámetros explícitos. No multiplicar variantes solo para incorporar cada opción en el nombre. Las funciones matemáticas `multiplicar`, `sumar` y `promediar` omiten el objeto porque los valores y columnas se indican como argumentos dentro de `grid.formulas`.

## Mantenimiento y validación por versión

El cambio organiza y renombra la biblioteca existente; no certifica el comportamiento completo de todos sus métodos en APEX 24.1 o 26.1. Antes de publicar, validar en ambas versiones las operaciones usadas por la aplicación. Se conservan variantes históricas que intentan métodos opcionales como `markDirty`, `commitRecord`, `commit`, `record.setDirty` o la opción `disableFormatting`. Ninguno figura en la API documentada del modelo de APEX 26.2: las llamadas están protegidas con `if`, así que, si el método no existe, no tienen efecto y la función se comporta como un `setValue` normal. No deben tomarse como una garantía de API pública de Oracle.

- Para nuevas funciones, preferir las APIs documentadas: [modelo 24.1](https://docs.oracle.com/en/database/oracle/apex/24.1/aexjs/model.html), [modelo 26.1](https://docs.oracle.com/en/database/oracle/apex/26.1/aexjs/model.html), [grid 24.1](https://docs.oracle.com/en/database/oracle/apex/24.1/aexjs/grid.html), [grid 26.1](https://docs.oracle.com/en/database/oracle/apex/26.1/aexjs/grid.html).
- Los métodos `confirmarCambios` y las variantes `asignarNumeroMarcado`, `asignarNumeroSeleccionadoMarcado` y `asignarPrimerNumeroMarcado` conservan su lógica anterior. Su nombre no implica un guardado confirmado en base de datos. Probar el guardado real mediante el flujo de APEX.
- `refrescarRegion` y `refrescarConConfirmacion`, cuando se solicita refrescar la región completa, conservan una llamada a `model.clearChanges()` antes del refresco. No utilizarlos como sustituto de guardar los cambios pendientes.
- No asumir que una fila seleccionada es la fila en edición. Algunas variantes heredadas interpretan de manera diferente la selección; validarlas antes de elegirlas para una nueva página.
- Las operaciones diferidas, como `recalcularFilas`, usan temporizadores y no devuelven una promesa que permita esperar su finalización.
- Los mensajes informativos usan `apex.debug.info`: solo aparecen en la consola con la depuración de APEX activa (nivel 4 o superior, por ejemplo con `apex.debug.setLevel(4)`). Las advertencias y errores siguen en `console.warn` y `console.error`. `depurarCambios` y las opciones `debug` de las funciones de sincronización siguen escribiendo con `console.log`, porque se activan a propósito. Para mensajes nuevos, seguir el mismo criterio.
- Se conserva la activación automática de restauración de foco a los 100 ms de cargar el archivo. Para deshabilitarla, llamar `invUtils.grid.deshabilitarRestauracionFoco()` después de esa inicialización.
- Al modificar funciones, mantener juntos implementación, documentación y publicación. No añadir APIs que no están implementadas ni documentar una compatibilidad sin probarla.

## Mantener la documentación

- `README.md`: presentación, objetivo, instalación rápida y enlaces.
- `docs/desarrollo.md`: reglas, publicación de funciones y validación por versión.
- `docs/manual.md`: instalación detallada y ejemplos por tarea.
- `docs/referencia-api.md`: firmas, parámetros, retornos y efectos.
- `docs/migracion.md`: equivalencias entre nombres anteriores y actuales.

Actualizar código y documentación en el mismo cambio. Conservar el objetivo de versiones en el [README](../README.md#objetivo) como punto de referencia.
