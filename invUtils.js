/**
 * invUtils — Utilidades para Oracle APEX
 * Autor: Luis Talavera | Licencia: MIT
 * Referencias de API: Oracle APEX 24.1 hasta 26.1; versiones posteriores requieren nueva validación.
 * Inicio e instalación: README.md. Desarrollo: docs/desarrollo.md.
 * Ejemplos: docs/manual.md. Catálogo: docs/referencia-api.md.
 *
 * Único objeto global: invUtils.
 * Uso: invUtils.mostrarAlerta(...), invUtils.item.leerNumero(...),
 *      invUtils.grid.asignarCelda(...).
 * Las funciones y el estado son privados hasta publicarlos en el return final.
 * Conservar los nombres de métodos, eventos y opciones definidos por Oracle APEX.
 */

window.invUtils = (function (apex, $) {
    'use strict';

    // =============================================================================
    // ESTADO PRIVADO — no agregar propiedades a window
    // =============================================================================

    const autoCalculationConfigs = new Map();
    const debounceTimers = new Map();
    const ultimosValores = Object.create(null);
    let lastFocusedCell = null;
    let focusRestorationEnabled = true;

    // =============================================================================
    // GENERAL — utilidades compartidas
    // =============================================================================

    /**
     * Muestra una alerta según el estado HTTP: éxito para 200–299 y error para los demás.
     * @param {number} status - Código de estado.
     * @param {string} mensaje - Texto que se mostrará.
     * @returns {boolean}
     */
    function mostrarAlerta(status, mensaje){

        var v_status = status;
        var v_manesaje = mensaje;

        const success_alertOptions = {
            title: "Proceso Concluido",
            style: "success",
            iconClasses: "fa fa-info-circle",
            okLabel: "Aceptar",
        };

        const error_alertOptions = {
            title: "Error",
            style: "danger",
            iconClasses: "fa fa-warning",
            okLabel: "Aceptar",
        };

        console.log("status : " + v_status);

        if (200 <= v_status && v_status <= 299){
            console.log("Success alert!");
            apex.message.alert(v_manesaje,null,success_alertOptions);
        }else{
            console.log("Error alert!");
            apex.message.alert(v_manesaje,null,error_alertOptions);
        }
        return true;
    }

    /**
     * Ejecuta una función con posponerEjecucion para evitar múltiples ejecuciones
     * @param {string} key - Clave única para identificar el posponerEjecucion
     * @param {function} callback - Función a ejecutar
     * @param {number} delay - Delay en milisegundos (default: 300)
     * @param {boolean} immediate - Si debe ejecutar inmediatamente en la primera llamada (default: false)
     * @returns {boolean} - true si se programó la ejecución, false si se canceló
     */
    function posponerEjecucion(key, callback, delay = 300, immediate = false) {
        try {
            // Limpiar timer existente
            if (debounceTimers.has(key)) {
                clearTimeout(debounceTimers.get(key));
            }

            // Si es inmediato y no hay timer activo, ejecutar ahora
            if (immediate && !debounceTimers.has(key)) {
                if (typeof callback === 'function') {
                    callback();
                }
                return true;
            }

            // Programar nueva ejecución
            const timerId = setTimeout(() => {
                if (typeof callback === 'function') {
                    callback();
                }
                debounceTimers.delete(key);
            }, delay);

            debounceTimers.set(key, timerId);
            return true;

        } catch (error) {
            console.error('posponerEjecucion error:', error);
            return false;
        }
    }

    /**
     * Cancela un posponerEjecucion específico
     * @param {string} key - Clave del posponerEjecucion a cancelar
     * @returns {boolean} - true si se canceló, false si no existía
     */
    function cancelarEjecucionPendiente(key) {
        try {
            if (debounceTimers.has(key)) {
                clearTimeout(debounceTimers.get(key));
                debounceTimers.delete(key);
                return true;
            }
            return false;
        } catch (error) {
            console.error('cancelarEjecucionPendiente error:', error);
            return false;
        }
    }

    /**
     * Ejecuta una función solo si un valor ha cambiado
     * @param {string} key - Clave única para identificar el cambio
     * @param {any} newValue - Nuevo valor a comparar
     * @param {function} callback - Función a ejecutar si el valor cambió
     * @param {number} delay - Delay en milisegundos (default: 100)
     * @returns {boolean} - true si se ejecutó, false si no hubo cambio
     */
    function ejecutarSiCambia(key, newValue, callback, delay = 100) {
        try {
            const changeKey = `change_${key}`;
            const lastValue = ultimosValores[key];

            // Convertir valores a string para comparación
            const newValueStr = String(newValue);
            const lastValueStr = lastValue ? String(lastValue) : null;

            // Si el valor realmente cambió
            if (newValueStr !== lastValueStr) {
                // Actualizar el valor anterior
                ultimosValores[key] = newValue;

                // Ejecutar con posponerEjecucion
                return posponerEjecucion(changeKey, () => {
                    if (typeof callback === 'function') {
                        callback(newValue, lastValue);
                    }
                }, delay);
            }

            return false;

        } catch (error) {
            console.error('ejecutarSiCambia error:', error);
            return false;
        }
    }

    /**
     * Limpia todos los debounces activos
     */
    function cancelarEjecucionesPendientes() {
        try {
            debounceTimers.forEach((timerId) => {
                clearTimeout(timerId);
            });
            debounceTimers.clear();
            console.log('invUtils: Todos los debounces limpiados');
        } catch (error) {
            console.error('cancelarEjecucionesPendientes error:', error);
        }
    }

    /**
     * Normaliza números con formato europeo/latino (1.234,56) a formato estándar (1234.56)
     * @param {string|number} value - Valor a normalizar
     * @returns {number} - Número normalizado
     */
    function normalizarNumero(value) {
        if (value === null || value === undefined || value === '') {
            return 0;
        }

        // Convertir a string si es número
        let strValue = String(value).trim();

        // Si ya es un número válido, retornarlo
        if (!isNaN(parseFloat(strValue)) && strValue.indexOf(',') === -1 && strValue.indexOf('.') === -1) {
            return parseFloat(strValue);
        }

        // Detectar formato europeo/latino (1.234,56)
        if (strValue.includes('.') && strValue.includes(',')) {
            // Si hay punto y coma, asumir formato europeo: punto=miles, coma=decimal
            strValue = strValue.replace(/\./g, '').replace(',', '.');
        }
        // Detectar formato con solo coma como decimal (1,56)
        else if (strValue.includes(',') && !strValue.includes('.')) {
            // Si solo hay coma, verificar si es decimal
            const parts = strValue.split(',');
            if (parts.length === 2 && parts[1].length <= 3) {
                // Probablemente es decimal (1,56)
                strValue = strValue.replace(',', '.');
            } else {
                // Probablemente es separador de miles (1,234)
                strValue = strValue.replace(/,/g, '');
            }
        }

        const result = parseFloat(strValue);
        return isNaN(result) ? 0 : result;
    }

    /**
     * Formatea un número al formato europeo/latino (1234.56 -> 1.234,56)
     * @param {number} value - Valor numérico a formatear
     * @param {number} decimalPlaces - Número de decimales (default: 2)
     * @param {boolean} useThousandsSeparator - Si debe usar separador de miles (default: true)
     * @returns {string} - Número formateado en formato europeo
     */
    function formatearNumeroEuropeo(value, decimalPlaces = 2, useThousandsSeparator = true) {
        if (value === null || value === undefined || isNaN(value)) {
            return '0';
        }

        // Convertir a número
        const numValue = parseFloat(value);

        // Formatear con decimales
        const formatted = numValue.toFixed(decimalPlaces);

        if (!useThousandsSeparator) {
            // Solo cambiar punto por coma para decimales
            return formatted.replace('.', ',');
        }

        // Separar parte entera y decimal
        const parts = formatted.split('.');
        const integerPart = parts[0];
        const decimalPart = parts[1] || '';

        // Agregar separadores de miles a la parte entera
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

        // Combinar con coma decimal
        if (decimalPart) {
            return `${formattedInteger},${decimalPart}`;
        } else {
            return formattedInteger;
        }
    }

    /**
     * Convierte un valor al formato europeo para mostrar en la interfaz
     * @param {number|string} value - Valor a convertir
     * @param {number} decimalPlaces - Número de decimales (default: 2)
     * @returns {string} - Valor en formato europeo
     */
    function convertirNumeroEuropeo(value, decimalPlaces = 2) {
        const normalized = normalizarNumero(value);
        return formatearNumeroEuropeo(normalized, decimalPlaces, true);
    }

    // =============================================================================
    // ITEM — ítems de página
    // =============================================================================

    /**
     * Obtiene el valor numérico de un item de APEX, manejando automáticamente
     * el formato europeo (puntos como separadores de miles, coma como decimal)
     * @param {string} itemName - Nombre del item (ej: 'P1216_TOTAL_U')
     * @param {number} defaultValue - Valor por defecto si no se puede convertir (default: 0)
     * @returns {number} - Valor numérico convertido
     */
    function leerNumero(itemName, defaultValue = 0) {
        try {
            let value = $v(itemName);

            // Si está vacío o es null/undefined
            if (!value || value.trim() === '') {
                return defaultValue;
            }

            // Convertir a string por si acaso
            value = value.toString().trim();

            // Manejar formato europeo: 4.943.007,876
            // Remover todos los puntos (separadores de miles) y reemplazar coma por punto
            let cleanValue = value.replace(/\./g, '').replace(',', '.');

            let result = parseFloat(cleanValue);

            // Verificar si la conversión fue exitosa
            if (isNaN(result)) {
                console.warn(`leerNumero: No se pudo convertir '${value}' a número. Usando valor por defecto: ${defaultValue}`);
                return defaultValue;
            }

            return result;

        } catch (error) {
            console.error(`leerNumero: Error al obtener valor de '${itemName}':`, error);
            return defaultValue;
        }
    }

    /**
     * Nombre alternativo de leerNumero; conserva la misma lectura numérica.
     */
    function leerValorNumerico(itemName, defaultValue = 0) {
        return leerNumero(itemName, defaultValue);
    }

    /**
     * Obtiene múltiples valores numéricos de una vez
     * @param {string[]} itemNames - Array de nombres de items
     * @param {number} defaultValue - Valor por defecto para todos
     * @returns {number[]} - Array de valores numéricos
     */
    function leerNumeros(itemNames, defaultValue = 0) {
        return itemNames.map(itemName => leerNumero(itemName, defaultValue));
    }

    // =============================================================================
    // GRID — Edición y datos
    // =============================================================================

    /**
     * Habilita la edición del modelo y de la vista de una grilla.
     * @param {string} regionId - Static ID de la región Interactive Grid.
     * @returns {boolean} Indica si se pudo habilitar la edición.
     */
    function habilitarEdicion(regionId) {
        try {
            var region = apex.region(regionId);
            if (!region) {
                console.error("Región no encontrada: " + regionId);
                return false;
            }

            var grid = region.call("getViews").grid;
            if (!grid) {
                console.error("Grid no encontrado en la región: " + regionId);
                return false;
            }

            grid.model.setOption("editable", true);
            grid.setEditMode(true);


            if (typeof modoEdicion === 'function') {
                modoEdicion(regionId);
            }

            return true;
        } catch (error) {
            console.error("Error al habilitar edición:", error);
            return false;
        }
    }

    /**
     * Extrae campos de los registros cargados y los asigna a un ítem de página.
     * @param {object} configuracion - regionId, campos, campoDestino y opciones.
     * @returns {object} Resultado con success, data, count o error.
     */
    function extraerDatos(configuracion) {
        console.log('Ejecutando extracción de datos del IG:', configuracion.regionId);

        try {
            // Validar parámetros obligatorios
            if (!configuracion.regionId) {
                throw new Error('regionId es obligatorio');
            }
            if (!configuracion.campos || !Array.isArray(configuracion.campos)) {
                throw new Error('campos debe ser un array');
            }
            if (!configuracion.campoDestino) {
                throw new Error('campoDestino es obligatorio');
            }

            // Obtener el Interactive Grid
            var ig$ = apex.region(configuracion.regionId).widget().interactiveGrid("getViews", "grid");
            var model = ig$.model;
            var data = [];

            // Función auxiliar para normalizar nombres de campos (mayúsculas a formato correcto)
            function normalizarCampo(campo) {
                return campo.toUpperCase();
            }

            // Función auxiliar para obtener valor real (maneja poplovs)
            function leerValorReal(valorObj) {
                return valorObj?.v !== undefined ? valorObj.v : valorObj;
            }

            // Recorrer todos los registros del modelo
            model.forEach(function (record) {
                var registro = {};
                var incluirRegistro = true;

                configuracion.campos.forEach(function (configCampo) {
                    var nombreCampo = configCampo.nombre;
                    var aliasCampo = configCampo.alias || nombreCampo.toLowerCase();
                    var obligatorio = configCampo.obligatorio !== false; // Por defecto true
                    var condicion = configCampo.condicion || null;

                    var campoNormalizado = normalizarCampo(nombreCampo);

                    var valorBruto = model.getValue(record, campoNormalizado);
                    var valorFinal = leerValorReal(valorBruto);


                    if (configCampo.transformacion && typeof configCampo.transformacion === 'function') {
                        valorFinal = configCampo.transformacion(valorFinal);
                    }

                    // Verifica si la condición si existe
                    if (condicion && typeof condicion === 'function') {
                        if (!condicion(valorFinal)) {
                            incluirRegistro = false;
                            return;
                        }
                    }

                    if (obligatorio && (valorFinal === null || valorFinal === undefined || valorFinal === '')) {
                        incluirRegistro = false;
                        return;
                    }

                    registro[aliasCampo] = valorFinal;
                });

                if (incluirRegistro) {
                    data.push(registro);
                }
            });


            var valorDestino = configuracion.formatoSalida === 'array' ? data : JSON.stringify(data);
            apex.item(configuracion.campoDestino).setValue(valorDestino);

            console.log('Datos extraídos:', data);
            console.log('Total registros:', data.length);


            if (configuracion.callback && typeof configuracion.callback === 'function') {
                configuracion.callback(data);
            }

            return {
                success: true,
                data: data,
                count: data.length
            };

            /* return data; */

        } catch (error) {
            console.error('Error al extraer datos del IG:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    /**
     * Variante abreviada de extraerDatos para una lista de campos.
     * @param {string} regionId - Static ID de la región Interactive Grid.
     * @param {Array<string|object>} campos - Nombres o configuraciones de campos.
     * @param {string} campoDestino - Nombre del ítem que recibirá el JSON.
     * @returns {object} Resultado de extraerDatos.
     */
    function extraerCampos(regionId, campos, campoDestino) {
        var configuracion = {
            regionId: regionId,
            campoDestino: campoDestino,
            campos: campos.map(function (campo) {
                if (typeof campo === 'string') {
                    return {
                        nombre: campo,
                        alias: campo.toLowerCase()
                    };
                }
                return campo;
            })
        };

        return extraerDatos(configuracion);
    }

    /**
     * Setear datos en un Interactive Grid con configuración avanzada
     * @param {object} configuracion - Configuración completa para setear datos
     * @param {string} configuracion.regionId - ID de la región del Interactive Grid
     * @param {array|object} configuracion.datos - Datos a insertar (opcional si se usa campoOrigen)
     * @param {string} configuracion.campoOrigen - Campo de la página que contiene los datos JSON (opcional si se usa datos)
     * @param {object} configuracion.mapeo - Mapeo personalizado de campos {campoDestino: campoOrigen}
     * @param {function} configuracion.transformacion - Función para transformar cada registro antes de insertar
     * @param {function} configuracion.filtro - Función para filtrar registros antes de insertar
     * @param {boolean} configuracion.limpiarAntes - Si debe limpiar datos existentes (default: true)
     * @param {boolean} configuracion.refrescar - Si debe refrescar la grilla (default: true)
     * @param {boolean} configuracion.modoEdicion - Si debe habilitar modo edición (default: true)
     * @param {function} configuracion.callback - Función a ejecutar después de setear datos
     * @returns {object} - Objeto con resultado de la operación
     */
    function cargarDatos(configuracion) {
        console.log('invUtils: Seteando datos en IG:', configuracion.regionId);

        try {
            // Validar parámetros obligatorios
            if (!configuracion.regionId) {
                throw new Error('regionId es obligatorio');
            }

            // Obtener el Interactive Grid usando el método que funciona
            const grid = apex.region(configuracion.regionId).call("getViews").grid;
            const model = grid.model;

            // Habilitar modo edición si se especifica (por defecto true)
            if (configuracion.modoEdicion !== false) {
                try {
                    // Habilitar edición en el modelo
                    model.setOption("editable", true);
                    // Activar modo edición en la grilla
                    grid.setEditMode(true);
                    console.log('invUtils: Modo edición habilitado para:', configuracion.regionId);
                } catch (editError) {
                    console.warn('invUtils: No se pudo habilitar modo edición:', editError);
                }
            }

            // Obtener datos de origen
            var datos = [];

            if (configuracion.datos) {
                // Datos pasados directamente
                datos = Array.isArray(configuracion.datos) ? configuracion.datos : [configuracion.datos];
            } else if (configuracion.campoOrigen) {
                // Datos desde un campo de la página usando $v() como en tu ejemplo
                var valorCampo = $v(configuracion.campoOrigen);
                if (valorCampo) {
                    try {
                        datos = JSON.parse(valorCampo);
                        console.log(`invUtils: Datos obtenidos del item ${configuracion.campoOrigen}:`, datos);
                    } catch (e) {
                        throw new Error('Error al parsear JSON del campo: ' + configuracion.campoOrigen);
                    }
                }
            } else {
                throw new Error('Debe especificar datos o campoOrigen');
            }

            // Validar que datos sea un array
            if (!Array.isArray(datos)) {
                datos = [datos];
            }

            // Función auxiliar para normalizar nombres de campos
            function normalizarCampo(campo) {
                return campo.toUpperCase();
            }

            // Función auxiliar para mapear campos
            function mapearCampos(registro, mapeo) {
                var registroMapeado = {};

                if (mapeo && typeof mapeo === 'object') {
                    // Usar mapeo personalizado
                    Object.keys(mapeo).forEach(function (clave) {
                        var campoOrigen = mapeo[clave];
                        var campoDestino = normalizarCampo(clave);

                        if (registro.hasOwnProperty(campoOrigen)) {
                            registroMapeado[campoDestino] = registro[campoOrigen];
                        }
                    });
                } else {
                    // Mapeo automático - convertir todas las claves a mayúsculas
                    Object.keys(registro).forEach(function (clave) {
                        var campoDestino = normalizarCampo(clave);
                        registroMapeado[campoDestino] = registro[clave];
                    });
                }

                return registroMapeado;
            }

            // Limpiar datos existentes si se especifica
            if (configuracion.limpiarAntes !== false) {
                model.clearData();
            }

            // Contador de registros procesados
            var registrosProcesados = 0;
            var registrosConErrores = 0;

            // Insertar cada registro usando el método que funciona
            datos.forEach(function (registro, indice) {
                try {
                    // Aplicar transformación personalizada si existe
                    if (configuracion.transformacion && typeof configuracion.transformacion === 'function') {
                        registro = configuracion.transformacion(registro, indice);
                    }

                    // Filtrar registro si existe condición
                    if (configuracion.filtro && typeof configuracion.filtro === 'function') {
                        if (!configuracion.filtro(registro, indice)) {
                            return; // Saltar este registro
                        }
                    }

                    // Mapear campos
                    var registroMapeado = mapearCampos(registro, configuracion.mapeo);

                    // Insertar registro usando el patrón que funciona
                    try {
                        // Crear nuevo registro vacío
                        const newRecordId = model.insertNewRecord();
                        const newRecord = model.getRecord(newRecordId);

                        // Setear cada campo usando setValue (soporte para Popup LOV)
                        Object.keys(registroMapeado).forEach(columnName => {
                            try {
                                const value = registroMapeado[columnName];

                                // Detectar configuración de Popup LOV
                                const isPopupLov = Array.isArray(configuracion.popupLovColumns)
                                    ? configuracion.popupLovColumns.map(c => c.toUpperCase()).includes(columnName.toUpperCase())
                                    : false;
                                const lovDisplayMaps = configuracion.lovDisplayMaps || {};
                                const lovMapForColumn = lovDisplayMaps[columnName] || lovDisplayMaps[columnName && columnName.toUpperCase()] || null;

                                let finalValue = null;

                                if (value === null || value === undefined) {
                                    finalValue = null;
                                } else if (typeof value === 'object' && (value.hasOwnProperty('v') || value.hasOwnProperty('d'))) {
                                    // Si ya viene en formato {v, d}
                                    const v = value.v;
                                    const d = value.d != null ? value.d : value.v;
                                    finalValue = { v: v, d: d };
                                } else if (isPopupLov) {
                                    // Si es Popup LOV y solo tenemos el valor, intentar resolver display
                                    const v = value;
                                    let d = null;
                                    if (lovMapForColumn && Object.prototype.hasOwnProperty.call(lovMapForColumn, v)) {
                                        d = lovMapForColumn[v];
                                    } else {
                                        // Fallback: usar el mismo valor como display
                                        d = v;
                                    }
                                    finalValue = { v: v, d: d };
                                } else {
                                    // Comportamiento por defecto (string)
                                    finalValue = value != null ? value.toString() : null;
                                }

                                model.setValue(newRecord, columnName, finalValue);
                            } catch (setValueError) {
                                console.warn(`invUtils: Error al setear campo ${columnName}:`, setValueError);
                            }
                        });

                    } catch (insertError) {
                        console.error(`invUtils: Error al insertar registro:`, insertError);
                        throw insertError;
                    }

                    registrosProcesados++;

                } catch (error) {
                    console.error('invUtils: Error al procesar registro', indice, ':', error);
                    registrosConErrores++;
                }
            });

            console.log('invUtils: Registros procesados:', registrosProcesados);
            if (registrosConErrores > 0) {
                console.warn('invUtils: Registros con errores:', registrosConErrores);
            }

            // Refrescar la grilla si se especifica (por defecto true)
            if (configuracion.refrescar !== false) {
                try {
                    // Usar el método que funciona para refrescar
                    grid.view$.trigger('refresh');
                    console.log('invUtils: Grilla refrescada correctamente');
                } catch (refreshError) {
                    console.warn('invUtils: No se pudo refrescar la grilla:', refreshError);
                    // Intentar refresh de la región completa como alternativa
                    try {
                        apex.region(configuracion.regionId).refresh();
                    } catch (regionRefreshError) {
                        console.warn('invUtils: No se pudo refrescar la región:', regionRefreshError);
                    }
                }
            }

            // Ejecutar callback si existe
            if (configuracion.callback && typeof configuracion.callback === 'function') {
                configuracion.callback({
                    procesados: registrosProcesados,
                    errores: registrosConErrores,
                    total: datos.length
                });
            }

            return {
                success: true,
                procesados: registrosProcesados,
                errores: registrosConErrores,
                total: datos.length
            };

        } catch (error) {
            console.error('invUtils: Error al setear datos en IG:', error);
            return {
                success: false,
                error: error.message,
                procesados: 0,
                errores: 0,
                total: 0
            };
        }
    }

    /**
     * Setear datos directamente en un Interactive Grid
     * @param {string} regionId - ID de la región del Interactive Grid
     * @param {array|object} datos - Datos a insertar
     * @param {boolean} limpiar - Si debe limpiar datos existentes (default: true)
     * @param {boolean} refrescar - Si debe refrescar la grilla (default: true)
     * @param {boolean} modoEdicion - Si debe habilitar modo edición (default: true)
     * @returns {object} - Objeto con resultado de la operación
     */
    function cargarDatosDirectos(regionId, datos, limpiar = true, refrescar = true, modoEdicion = true) {
        return cargarDatos({
            regionId: regionId,
            datos: datos,
            limpiarAntes: limpiar,
            refrescar: refrescar,
            modoEdicion: modoEdicion
        });
    }

    /**
     * Setear datos desde un campo de la página en un Interactive Grid
     * @param {string} regionId - ID de la región del Interactive Grid
     * @param {string} campoOrigen - Campo de la página que contiene los datos JSON
     * @param {boolean} limpiar - Si debe limpiar datos existentes (default: true)
     * @param {boolean} refrescar - Si debe refrescar la grilla (default: true)
     * @param {boolean} modoEdicion - Si debe habilitar modo edición (default: true)
     * @returns {object} - Objeto con resultado de la operación
     */
    function cargarDesdeItem(regionId, campoOrigen, limpiar = true, refrescar = true, modoEdicion = true) {
        return cargarDatos({
            regionId: regionId,
            campoOrigen: campoOrigen,
            limpiarAntes: limpiar,
            refrescar: refrescar,
            modoEdicion: modoEdicion
        });
    }

    // =============================================================================
    // GRID — Cálculos y configuración
    // =============================================================================

    /**
     * Configuración de cálculo automático para Interactive Grid
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {object} config - Configuración del cálculo
     * @param {array} config.sourceColumns - Columnas que disparan el cálculo
     * @param {string} config.targetColumn - Columna donde se guarda el resultado
     * @param {function} config.formula - Función que realiza el cálculo
     * @param {number} config.decimalPlaces - Número de decimales (default: 2)
     * @param {boolean} config.autoTrigger - Si debe configurar eventos automáticos (default: true)
     * @returns {string} - ID único de la configuración creada
     */
    function configurarCalculoAutomatico(gridStaticId, config) {
        try {
            // Validar parámetros requeridos
            if (!gridStaticId || !config.sourceColumns || !config.targetColumn || !config.formula) {
                console.error('invUtils: Faltan parámetros requeridos');
                return null;
            }

            // Configuración por defecto
            const settings = {
                decimalPlaces: 2,
                autoTrigger: true,
                triggerOnLoad: false,
                ...config
            };

            // Generar ID único para esta configuración
            const configId = generarIdConfiguracion(gridStaticId, config.targetColumn);

            // Almacenar la configuración para uso posterior
            autoCalculationConfigs.set(configId, {
                gridStaticId: gridStaticId,
                configId: configId,
                ...settings
            });

            // Función para ejecutar el cálculo
            const ejecutarCalculo = function () {
                return calcularFormula(gridStaticId, settings);
            };

            // Configurar eventos automáticos si está habilitado
            if (settings.autoTrigger) {
                configurarEventosCalculo(gridStaticId, settings.sourceColumns, ejecutarCalculo);
            }

            // Ejecutar cálculo inicial si está configurado
            if (settings.triggerOnLoad) {
                setTimeout(ejecutarCalculo, 100);
            }

            console.log(`invUtils: Configurado cálculo automático para ${gridStaticId} -> ${config.targetColumn} (ID: ${configId})`);
            return configId;

        } catch (error) {
            console.error('invUtils configurarCalculoAutomatico error:', error);
            return null;
        }
    }

    /**
     * Ejecutar cálculo manual
     * @param {string} gridStaticId - Static ID del grid
     * @param {object} config - Configuración del cálculo
     */
    function calcularColumnas(gridStaticId, config) {
        const settings = {
            decimalPlaces: 2,
            ...config
        };

        return calcularFormula(gridStaticId, settings);
    }

    // Ejemplo de uso:
    // let valor = invUtils.item.leerNumero('P1216_TOTAL_U');
    // let [costo1, costo2] = invUtils.item.leerNumeros(['P1216_TOTAL_U', 'P1216_TOTAL_PROD']);

    /**
     * Configurar cálculo automático para multiplicación (CANTIDAD × COSTO = TOTAL)
     * Función helper específica para el caso más común
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} cantidadColumn - Nombre de la columna cantidad (default: 'CANTIDAD')
     * @param {string} costoColumn - Nombre de la columna costo (default: 'COSTO')
     * @param {string} totalColumn - Nombre de la columna total (default: 'TOTAL')
     * @param {number} decimalPlaces - Número de decimales (default: 3)
     * @returns {string} - ID de la configuración creada
     */
    function configurarMultiplicacion(gridStaticId, cantidadColumn = 'CANTIDAD', costoColumn = 'COSTO', totalColumn = 'TOTAL', decimalPlaces = 3) {
        try {
            console.log(`invUtils: Configurando cálculo automático ${cantidadColumn} × ${costoColumn} = ${totalColumn} para ${gridStaticId}`);

            const configId = configurarCalculoAutomatico(gridStaticId, {
                sourceColumns: [cantidadColumn, costoColumn],
                targetColumn: totalColumn,
                formula: function (values) {
                    const cantidad = values[cantidadColumn] || 0;
                    const costo = values[costoColumn] || 0;
                    const resultado = cantidad * costo;

                    console.log(`invUtils: Fórmula ejecutada: ${cantidad} × ${costo} = ${resultado}`);
                    return resultado;
                },
                decimalPlaces: decimalPlaces,
                autoTrigger: true,
                triggerOnLoad: true
            });

            if (configId) {
                console.log(`invUtils: Cálculo automático configurado exitosamente con ID: ${configId}`);

                // Ejecutar cálculo inicial después de un pequeño delay
                setTimeout(() => {
                    console.log(`invUtils: Ejecutando cálculo inicial para ${configId}`);
                    actualizarCalculoAutomatico(gridStaticId, totalColumn, 100);
                }, 200);
            } else {
                console.error(`invUtils: Error al configurar cálculo automático para ${gridStaticId}`);
            }

            return configId;

        } catch (error) {
            console.error('invUtils configurarMultiplicacion error:', error);
            return null;
        }
    }

    /**
     * Verificar y configurar cálculos automáticos si no existen
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} targetColumn - Columna a verificar (default: 'TOTAL')
     * @returns {boolean} - true si la configuración existe o se creó exitosamente
     */
    function asegurarCalculoAutomatico(gridStaticId, targetColumn = 'TOTAL') {
        try {
            const config = leerConfiguracionCalculo(gridStaticId, targetColumn);

            if (config) {
                console.log(`invUtils: Configuración existente encontrada para ${gridStaticId} -> ${targetColumn}`);
                return true;
            } else {
                console.log(`invUtils: No se encontró configuración para ${gridStaticId} -> ${targetColumn}, configurando automáticamente...`);

                // Configurar automáticamente el cálculo más común
                const configId = configurarMultiplicacion(gridStaticId);
                return configId !== null;
            }

        } catch (error) {
            console.error('invUtils asegurarCalculoAutomatico error:', error);
            return false;
        }
    }

    /**
     * Verificar y corregir formato de números en el grid
     * @param {string} gridStaticId - Static ID del grid
     * @param {string} columnName - Nombre de la columna
     * @param {number} decimalPlaces - Número de decimales esperados
     */
    function asegurarFormatoDecimal(gridStaticId, columnName, decimalPlaces = 2) {
        try {
            const gridData = leerContextoRegistro(gridStaticId);
            if (!gridData.success) {
                return false;
            }

            const { model, record } = gridData;
            const currentValue = model.getValue(record, columnName);

            // Si el valor es un número, asegurar que tenga los decimales correctos
            if (typeof currentValue === 'number') {
                const formattedValue = parseFloat(currentValue.toFixed(decimalPlaces));
                model.setValue(record, columnName, formattedValue);

                //console.log(`invUtils: Formato corregido para ${columnName}: ${currentValue} -> ${formattedValue}`);
                return true;
            }

            return false;
        } catch (error) {
            console.error('invUtils asegurarFormatoDecimal error:', error);
            return false;
        }
    }

    /**
     * Sumar todos los valores de una columna del Interactive Grid y colocarlos en un item
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna a sumar
     * @param {string} targetItem - ID del item donde colocar el total
     * @param {number} decimalPlaces - Número de decimales para el resultado (default: 2)
     * @param {boolean} autoUpdate - Si debe actualizarse automáticamente cuando cambie el grid (default: true)
     * @returns {object} - Objeto con la suma calculada y la función calcularSuma para uso externo
     */
    function sumarColumna(gridStaticId, columnName, targetItem, decimalPlaces = 2, autoUpdate = true) {
        try {
            const ig$ = apex.region(gridStaticId).widget().interactiveGrid("getViews", "grid");
            const model = ig$.model;

            // Función para calcular la suma
            const calcularSuma = function () {
                let total = 0;

                model.forEach(function (record, index, id) {
                    // ✅ ¡PUNTO CLAVE!
                    // Ignorar los registros marcados para eliminación en la suma.
                    if (esRegistroEliminado(record, model)) {
                        return; // Siguiente registro
                    }

                    const value = model.getValue(record, columnName);
                    if (value !== null && value !== undefined && value !== '') {
                        total += normalizarNumero(value);
                    }
                });

                const formattedTotal = parseFloat(total.toFixed(decimalPlaces));
                apex.item(targetItem).setValue(formattedTotal);
                return formattedTotal;
            };

            // Calcular suma inicial
            const initialSum = calcularSuma();

            // Configurar actualización automática si está habilitada
            if (autoUpdate) {
                // Suscribirse a cambios en el modelo
                model.subscribe({
                    onChange: function (type, change) {
                        if (['set', 'add', 'delete', 'reset'].includes(type)) {
                            // Un pequeño delay puede ayudar a que el modelo se estabilice antes de calcular
                            setTimeout(calcularSuma, 50);
                        }
                    }
                });

                // También escuchar cambios en la estructura del grid (nuevas filas, eliminaciones)
                model.subscribe({
                    onChange: function (type) {
                        if (type === 'add' || type === 'delete' || type === 'reset' || type === 'add') {
                            setTimeout(calcularSuma, 100);
                        }
                    }
                });

                //console.log(`invUtils: Configurada actualización automática para suma de ${columnName} -> ${targetItem}`);
            }

            // Retornar objeto con la suma y la función para uso externo
            return {
                sum: initialSum,
                calcularSuma: calcularSuma,
                gridStaticId: gridStaticId,
                columnName: columnName,
                targetItem: targetItem
            };

        } catch (error) {
            console.error('invUtils sumarColumna error:', error);
            return {
                sum: 0,
                calcularSuma: function () { return 0; },
                gridStaticId: gridStaticId,
                columnName: columnName,
                targetItem: targetItem
            };
        }
    }

    /**
     * Función rápida para sumar columna TOTAL a un item específico
     * @param {string} gridStaticId - Static ID del grid
     * @param {string} targetItem - ID del item donde colocar el total
     * @param {number} decimalPlaces - Número de decimales (default: 2)
     */
    function sumarTotal(gridStaticId, targetItem, decimalPlaces = 2) {
        return sumarColumna(gridStaticId, 'TOTAL', targetItem, decimalPlaces, true);
    }

    /**
     * Configurar listener externo para recalcular suma cuando cambie el grid
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {function} callback - Función a ejecutar cuando cambie el grid
     * @param {array} eventTypes - Tipos de eventos a escuchar (default: ['set', 'add', 'delete', 'reset'])
     */
    function escucharCambios(gridStaticId, callback, eventTypes = ['set', 'add', 'delete', 'reset']) {
        try {
            const ig$ = apex.region(gridStaticId).widget().interactiveGrid("getViews", "grid");
            const model = ig$.model;

            model.subscribe({
                onChange: function (type, change) {
                    if (eventTypes.includes(type)) {
                        // Pequeño delay para asegurar que el cambio se haya aplicado
                        setTimeout(callback, 50);
                    }
                }
            });

            //console.log(`invUtils: Configurado listener externo para ${gridStaticId} con eventos: ${eventTypes.join(', ')}`);
            return true;

        } catch (error) {
            console.error('invUtils escucharCambios error:', error);
            return false;
        }
    }

    /**
     * Forzar recálculo de una fórmula específica
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {object} config - Configuración del cálculo
     * @param {array} config.sourceColumns - Columnas fuente
     * @param {string} config.targetColumn - Columna destino
     * @param {function} config.formula - Función de cálculo
     * @param {number} config.decimalPlaces - Número de decimales (default: 2)
     * @returns {number} - Resultado del cálculo
     */
    function forzarRecalculo(gridStaticId, config) {
        try {
            console.log(`invUtils: Forzando recálculo en ${gridStaticId}...`);

            const result = calcularFormula(gridStaticId, config);

            console.log(`invUtils: Recálculo forzado completado. Resultado: ${result}`);
            return result;

        } catch (error) {
            console.error('invUtils forzarRecalculo error:', error);
            return 0;
        }
    }

    /**
     * Refrescar todos los cálculos automáticos configurados en un grid
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} targetColumn - Columna específica a refrescar (opcional, si no se especifica refresca todas)
     * @param {number} delay - Delay en milisegundos antes de ejecutar (default: 50)
     * @returns {boolean} - true si se refrescó correctamente
     */
    function actualizarCalculoAutomatico(gridStaticId, targetColumn = null, delay = 50) {
        try {
            // Verificación de seguridad
            if (typeof autoCalculationConfigs === 'undefined') {
                console.error('invUtils: autoCalculationConfigs no está definido. El módulo no se ha inicializado correctamente.');
                return false;
            }

            console.log(`invUtils: Refrescando cálculos automáticos para ${gridStaticId}${targetColumn ? ` -> ${targetColumn}` : ''}`);
            console.log(`invUtils: Total configuraciones almacenadas: ${autoCalculationConfigs.size}`);

            let configsToRefresh = [];

            if (targetColumn) {
                // Refrescar configuración específica
                const configId = generarIdConfiguracion(gridStaticId, targetColumn);
                const config = autoCalculationConfigs.get(configId);
                if (config) {
                    configsToRefresh.push(config);
                    console.log(`invUtils: Configuración encontrada para ${configId}:`, config);
                } else {
                    console.warn(`invUtils: No se encontró configuración para ${gridStaticId} -> ${targetColumn} (ID: ${configId})`);
                    return false;
                }
            } else {
                // Refrescar todas las configuraciones del grid
                autoCalculationConfigs.forEach((config, configId) => {
                    if (config.gridStaticId === gridStaticId) {
                        configsToRefresh.push(config);
                        console.log(`invUtils: Configuración encontrada: ${configId}`, config);
                    }
                });

                if (configsToRefresh.length === 0) {
                    console.warn(`invUtils: No se encontraron configuraciones para ${gridStaticId}`);
                    console.log(`invUtils: Configuraciones disponibles:`, Array.from(autoCalculationConfigs.keys()));
                    return false;
                }
            }

            console.log(`invUtils: ${configsToRefresh.length} configuraciones a refrescar`);

            // Ejecutar el recálculo con delay
            setTimeout(function () {
                try {
                    let totalResults = 0;

                    // Ejecutar cada configuración
                    configsToRefresh.forEach(config => {
                        try {
                            console.log(`invUtils: Ejecutando recálculo para configuración:`, config);

                            // Verificar que el grid existe antes de recalcular
                            const gridData = leerContextoRegistro(gridStaticId);
                            if (!gridData.success) {
                                console.error(`invUtils: No se pudo obtener registro activo para ${gridStaticId}:`, gridData.error);
                                return;
                            }

                            // Verificar que las columnas fuente existen y tienen valores
                            const { model, record } = gridData;
                            const sourceValues = {};
                            let hasValidValues = true;

                            config.sourceColumns.forEach(column => {
                                const rawValue = model.getValue(record, column);
                                const normalizedValue = normalizarNumero(rawValue);
                                sourceValues[column] = normalizedValue;

                                console.log(`invUtils: Columna fuente ${column}: valor original="${rawValue}", normalizado=${normalizedValue}`);

                                if (normalizedValue === 0 && rawValue !== 0) {
                                    console.warn(`invUtils: Columna ${column} tiene valor 0, verificar si es correcto`);
                                }
                            });

                            if (!hasValidValues) {
                                console.warn(`invUtils: Algunas columnas fuente no tienen valores válidos`);
                            }

                            const result = forzarRecalculo(gridStaticId, config);
                            totalResults += result;
                            console.log(`invUtils: Recálculo completado para ${config.targetColumn}, resultado: ${result}`);

                        } catch (error) {
                            console.error(`invUtils: Error durante el recálculo de ${config.targetColumn}:`, error);
                        }
                    });

                    // Refrescar la vista del grid para asegurar que los cambios se muestren
                    try {
                        const grid = apex.region(gridStaticId).call("getViews").grid;
                        // Método correcto para Interactive Grids de APEX
                        grid.view$.trigger('refresh');
                        console.log(`invUtils: Grid ${gridStaticId} refrescado después del recálculo`);
                    } catch (e) {
                        console.warn(`invUtils: No se pudo refrescar grid ${gridStaticId}:`, e);
                    }

                    console.log(`invUtils: Recálculo completado para ${gridStaticId}, ${configsToRefresh.length} configuraciones procesadas, total: ${totalResults}`);

                } catch (error) {
                    console.error(`invUtils: Error durante el recálculo de ${gridStaticId}:`, error);
                }
            }, delay);

            return true;

        } catch (error) {
            console.error('invUtils actualizarCalculoAutomatico error:', error);
            return false;
        }
    }

    /**
     * Obtener la configuración almacenada de un grid
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} targetColumn - Columna específica (opcional)
     * @returns {object|null} - Configuración almacenada o null si no existe
     */
    function leerConfiguracionCalculo(gridStaticId, targetColumn = null) {
        try {
            // Verificación de seguridad
            if (typeof autoCalculationConfigs === 'undefined') {
                console.error('invUtils: autoCalculationConfigs no está definido. El módulo no se ha inicializado correctamente.');
                return null;
            }

            if (targetColumn) {
                const configId = generarIdConfiguracion(gridStaticId, targetColumn);
                return autoCalculationConfigs.get(configId) || null;
            } else {
                // Retornar todas las configuraciones del grid
                const configs = [];
                autoCalculationConfigs.forEach((config, configId) => {
                    if (config.gridStaticId === gridStaticId) {
                        configs.push(config);
                    }
                });
                return configs.length > 0 ? configs : null;
            }
        } catch (error) {
            console.error('invUtils leerConfiguracionCalculo error:', error);
            return null;
        }
    }

    /**
     * Limpiar la configuración almacenada de un grid
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} targetColumn - Columna específica a limpiar (opcional, si no se especifica limpia todas)
     * @returns {boolean} - true si se limpió correctamente
     */
    function eliminarConfiguracionCalculo(gridStaticId, targetColumn = null) {
        try {
            // Verificación de seguridad
            if (typeof autoCalculationConfigs === 'undefined') {
                console.error('invUtils: autoCalculationConfigs no está definido. El módulo no se ha inicializado correctamente.');
                return false;
            }

            let deleted = false;

            if (targetColumn) {
                // Limpiar configuración específica
                const configId = generarIdConfiguracion(gridStaticId, targetColumn);
                deleted = autoCalculationConfigs.delete(configId);
                if (deleted) {
                    console.log(`invUtils: Configuración limpiada para ${gridStaticId} -> ${targetColumn}`);
                } else {
                    console.warn(`invUtils: No se encontró configuración para limpiar en ${gridStaticId} -> ${targetColumn}`);
                }
            } else {
                // Limpiar todas las configuraciones del grid
                const configsToDelete = [];
                autoCalculationConfigs.forEach((config, configId) => {
                    if (config.gridStaticId === gridStaticId) {
                        configsToDelete.push(configId);
                    }
                });

                configsToDelete.forEach(configId => {
                    autoCalculationConfigs.delete(configId);
                    deleted = true;
                });

                if (deleted) {
                    console.log(`invUtils: ${configsToDelete.length} configuraciones limpiadas para ${gridStaticId}`);
                } else {
                    console.warn(`invUtils: No se encontraron configuraciones para limpiar en ${gridStaticId}`);
                }
            }

            return deleted;
        } catch (error) {
            console.error('invUtils eliminarConfiguracionCalculo error:', error);
            return false;
        }
    }

    /**
     * Obtener todas las configuraciones almacenadas
     * @param {string} gridStaticId - Static ID del Interactive Grid (opcional, si no se especifica retorna todas)
     * @returns {object} - Objeto con todas las configuraciones
     */
    function leerConfiguracionesCalculo(gridStaticId = null) {
        try {
            // Verificación de seguridad
            if (typeof autoCalculationConfigs === 'undefined') {
                console.error('invUtils: autoCalculationConfigs no está definido. El módulo no se ha inicializado correctamente.');
                return {};
            }

            const configs = {};
            autoCalculationConfigs.forEach((config, configId) => {
                if (!gridStaticId || config.gridStaticId === gridStaticId) {
                    configs[configId] = config;
                }
            });
            return configs;
        } catch (error) {
            console.error('invUtils leerConfiguracionesCalculo error:', error);
            return {};
        }
    }

    /**
     * Verificar si el módulo está inicializado correctamente
     * @returns {boolean} - true si el módulo está listo para usar
     */
    function estaInicializado() {
        return typeof autoCalculationConfigs !== 'undefined' && autoCalculationConfigs instanceof Map;
    }

    /**
     * Inicializar el módulo (llamado automáticamente)
     */
    function inicializarModulo() {
        try {
            if (!estaInicializado()) {
                console.error('invUtils: Error al inicializar el módulo');
                return false;
            }
            console.log('invUtils: Módulo inicializado correctamente');
            return true;
        } catch (error) {
            console.error('invUtils: Error durante la inicialización:', error);
            return false;
        }
    }

    /**
     * Recalcula y setea valores en una columna de todas las filas del Interactive Grid.
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string[]|object} sourceColumnsOrConfig - Array de nombres de columnas fuente O objeto de configuración
     * @param {string} targetColumn - Columna donde se seteará el resultado (solo si se usa formato antiguo)
     * @param {function} formula - Función que recibe (values, record, index) y retorna el valor a setear (solo si se usa formato antiguo)
     * @param {number} decimalPlaces - Cantidad de decimales a redondear (default: 2, solo si se usa formato antiguo)
     * @param {number} delay - Delay en milisegundos entre operaciones (default: 50)
     */
    function recalcularFilas(gridStaticId, sourceColumnsOrConfig, targetColumn, formula, decimalPlaces = 2, delay = 50) {

        setTimeout(() => {

            try {
                // Detectar si se está usando el nuevo formato (objeto de configuración)
                let config;
                if (typeof sourceColumnsOrConfig === 'object' && !Array.isArray(sourceColumnsOrConfig)) {
                    // Nuevo formato: objeto de configuración
                    config = sourceColumnsOrConfig;

                    // Validar parámetros requeridos
                    if (!config.sourceColumns || !config.targetColumn || !config.formula) {
                        console.error('invUtils: Faltan parámetros requeridos en configuración');
                        return false;
                    }

                    // Agregar delay al config si no está definido
                    if (config.delay === undefined) {
                        config.delay = delay;
                    }
                } else {
                    // Formato antiguo: parámetros separados (mantener compatibilidad)
                    config = {
                        sourceColumns: sourceColumnsOrConfig,
                        targetColumn: targetColumn,
                        formula: formula,
                        decimalPlaces: decimalPlaces,
                        delay: delay
                    };
                }

                const grid = apex.region(gridStaticId).call("getViews").grid;
                const model = grid.model;

                console.log(`🔄 invUtils: Recalculando todas las filas en ${gridStaticId} -> ${config.targetColumn} (delay: ${config.delay}ms)`);

                let processedRows = 0;
                let skippedRows = 0;

                // Procesar registros de forma síncrona
                model.forEach(function (record, index, id) {
                    try {
                        // Verificar si el registro está marcado para eliminación
                        if (esRegistroEliminado(record, model)) {
                            console.log(`⏭️ invUtils: Saltando registro ${id} - marcado para eliminación`);
                            skippedRows++;
                            return; // Continuar con el siguiente registro
                        }

                        // Construir objeto de valores fuente
                        const values = {};
                        config.sourceColumns.forEach(col => {
                            values[col] = normalizarNumero(model.getValue(record, col));
                        });

                        // Calcular el nuevo valor usando la fórmula
                        let result = config.formula(values, record, index);

                        // Redondear a los decimales indicados
                        const decimalPlaces = config.decimalPlaces || 2;
                        result = parseFloat(Number(result).toFixed(decimalPlaces));

                        // Setear el valor en la columna destino
                        model.setValue(record, config.targetColumn, result);

                        // Marcar como dirty si corresponde
                        if (model.markDirty) model.markDirty(record);

                        processedRows++;

                    } catch (recordError) {
                        console.warn(`invUtils: Error al procesar registro ${id}:`, recordError);
                        skippedRows++;
                    }
                });

                // Refrescar la vista del grid
                grid.view$.trigger('refresh');

                console.log(`✅ invUtils: Recalculación completada - ${processedRows} filas procesadas, ${skippedRows} filas saltadas`);
                return true;

            } catch (error) {
                console.error('recalcularFilas error:', error);
                return false;
            }

        }, delay);

    }

    // =============================================================================
    // GRID — Lectura de valores
    // =============================================================================

    /**
     * Obtener valor de una columna del registro activo
     */
    function leerColumna(gridStaticId, columnName) {
        const gridData = leerContextoRegistro(gridStaticId);
        if (!gridData.success) {
            return null;
        }

        return gridData.model.getValue(gridData.record, columnName);
    }

    /**
     * Obtener el valor de una celda específica del Interactive Grid (Versión Mejorada)
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {number} rowIndex - Índice de la fila (1 = primera fila, -1 = fila seleccionada)
     * @returns {any} - Valor de la celda o null si no se encuentra
     */
    function leerCelda(gridStaticId, columnName, rowIndex = -1) {
        try {
            // Obtener el modelo usando el método que funciona
            const model = apex.region(gridStaticId).widget().interactiveGrid("getCurrentView").model;

            let targetRecord = null;

            // Obtener registro objetivo
            if (rowIndex === -1) {
                // Usar el registro seleccionado
                const selectedRecords = apex.region(gridStaticId).widget().interactiveGrid("getCurrentView").getSelectedRecords();
                if (selectedRecords && selectedRecords.length > 0) {
                    targetRecord = selectedRecords[0];
                } else {
                    console.warn(`invUtils: No hay registro seleccionado en ${gridStaticId}`);
                    return null;
                }
            } else {
                // Obtener registro por índice usando un enfoque más directo
                console.log(`🔍 invUtils DEBUG: Buscando fila ${rowIndex}, rowIndex-1 = ${rowIndex - 1}`);

                // Usar un array para almacenar todos los registros y acceder por índice
                const allRecords = [];
                model.forEach(function (record, index, id) {
                    allRecords.push(record);
                });

                const targetIndex = rowIndex - 1; // rowIndex 1 = primera fila (índice 0)

                if (targetIndex >= 0 && targetIndex < allRecords.length) {
                    targetRecord = allRecords[targetIndex];
                    console.log(`✅ invUtils DEBUG: Encontrado registro objetivo en índice ${targetIndex} (ID: ${targetRecord.id})`);
                } else {
                    console.warn(`invUtils: Fila ${rowIndex} fuera de rango en ${gridStaticId} (total filas: ${allRecords.length})`);
                    return null;
                }
            }

            if (!targetRecord) {
                console.error(`invUtils: No se pudo obtener registro objetivo`);
                return null;
            }

            const rawValue = model.getValue(targetRecord, columnName);

            // Convertir a número si es posible, preservando decimales exactos
            let finalValue = rawValue;
            if (rawValue !== null && rawValue !== undefined && rawValue !== '') {
                // Si ya es un número, usarlo tal como está
                if (typeof rawValue === 'number') {
                    finalValue = rawValue;
                } else {
                    // Si es string, intentar convertir preservando decimales
                    const strValue = String(rawValue).trim();

                    // Verificar si es un número válido (incluyendo decimales)
                    if (/^-?\d*\.?\d+$/.test(strValue)) {
                        // Usar Number() en lugar de parseFloat() para mayor precisión
                        const numericValue = Number(strValue);
                        if (!isNaN(numericValue)) {
                            finalValue = numericValue;
                        }
                    }
                }
            }

            console.log(`📊 invUtils: Valor obtenido de ${columnName}, fila ${rowIndex === -1 ? 'seleccionada' : rowIndex}: ${finalValue} (tipo: ${typeof finalValue})`);
            return finalValue;

        } catch (error) {
            console.error('invUtils leerCelda error:', error);
            return null;
        }
    }

    /**
     * Obtener valor de la celda seleccionada (Versión Mejorada)
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @returns {any} - Valor de la celda o null si no se encuentra
     */
    function leerCeldaSeleccionada(gridStaticId, columnName) {
        return leerCelda(gridStaticId, columnName, -1);
    }

    /**
     * Obtener valor de la primera fila (Versión Mejorada)
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @returns {any} - Valor de la celda o null si no se encuentra
     */
    function leerPrimeraCelda(gridStaticId, columnName) {
        return leerCelda(gridStaticId, columnName, 1);
    }

    /**
     * Obtener todos los campos de la última fila seleccionada como un objeto
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {array} columns - Nombres de columnas a obtener; se requiere una lista no vacía.
     * @returns {object|null} - Objeto con todos los campos de la fila o null si no hay fila seleccionada
     */
    function leerFilaActual(gridStaticId, columns = null) {
        try {
            console.log(`📊 invUtils: Obteniendo fila actual de ${gridStaticId}`);

            // Usar exactamente tu método que funciona
            const row = apex.region(gridStaticId).call("getCurrentView");
            const record = row.getContextRecord(document.activeElement);

            if (!record || !record[0]) {
                console.warn(`invUtils: No se pudo obtener el registro de la fila seleccionada`);
                return null;
            }

            console.log(`📊 invUtils: Registro obtenido exitosamente`);

            // Obtener columnas especificadas por el usuario
            let columnsToGet = columns;
            if (!columnsToGet || columnsToGet.length === 0) {
                console.error(`invUtils: Debes especificar las columnas que necesitas obtener del grid ${gridStaticId}`);
                return null;
            }

            console.log(`📊 invUtils: Columnas a obtener: ${columnsToGet.join(', ')}`);

            // Crear objeto con todos los campos de la fila
            const rowData = {};

            // Obtener las columnas del grid para mapear nombres a índices
            const gridColumns = [];
            try {
                if (row.getColumns) {
                    const columns = row.getColumns();
                    columns.forEach((col, index) => {
                        // Usar col.property que es el nombre real de la columna
                        if (col.property) {
                            gridColumns.push({ name: col.property, index: col.index });
                        }
                    });
                }
            } catch (e) {
                console.warn(`invUtils: Error al obtener columnas del grid:`, e);
            }

            columnsToGet.forEach(columnName => {
                try {
                    let value = null;

                    // Buscar el índice de la columna por nombre
                    const columnInfo = gridColumns.find(col => col.name === columnName);
                    if (columnInfo) {
                        value = record[0][columnInfo.index];
                        console.log(`📊 invUtils: ${columnName} (índice ${columnInfo.index}) = ${value}`);
                    } else {
                        console.warn(`invUtils: No se encontró la columna ${columnName} en el grid`);
                        value = null;
                    }

                    rowData[columnName] = value;
                } catch (error) {
                    console.warn(`invUtils: Error al obtener valor de columna ${columnName}:`, error);
                    rowData[columnName] = null;
                }
            });

            console.log(`✅ invUtils: Fila actual obtenida con ${Object.keys(rowData).length} campos:`, rowData);
            return rowData;

        } catch (error) {
            console.error('invUtils leerFilaActual error:', error);
            return null;
        }
    }

    /**
     * Obtener valor numérico de una celda específica (con normalización de formato europeo)
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {number} rowIndex - Índice de la fila (1 = primera fila, -1 = fila seleccionada)
     * @param {number} defaultValue - Valor por defecto si no se puede convertir (default: 0)
     * @returns {number} - Valor numérico normalizado
     */
    function leerNumeroCelda(gridStaticId, columnName, rowIndex = -1, defaultValue = 0) {
        try {
            const rawValue = leerCelda(gridStaticId, columnName, rowIndex);

            if (rawValue === null || rawValue === undefined || rawValue === '') {
                return defaultValue;
            }

            // Si ya es un número, retornarlo directamente
            if (typeof rawValue === 'number') {
                //console.log(`invUtils: Valor numérico directo de ${columnName}, fila ${rowIndex === -1 ? 'seleccionada' : rowIndex}: ${rawValue}`);
                return rawValue;
            }

            // Usar la función normalizarNumero existente para manejar formato europeo
            const normalizedValue = normalizarNumero(rawValue);

            //console.log(`invUtils: Valor numérico normalizado de ${columnName}, fila ${rowIndex === -1 ? 'seleccionada' : rowIndex}: ${normalizedValue}`);
            return normalizedValue;

        } catch (error) {
            console.error('invUtils leerNumeroCelda error:', error);
            return defaultValue;
        }
    }

    /**
     * Obtener valor numérico de la celda seleccionada
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {number} defaultValue - Valor por defecto si no se puede convertir (default: 0)
     * @returns {number} - Valor numérico normalizado
     */
    function leerNumeroSeleccionado(gridStaticId, columnName, defaultValue = 0) {
        return leerNumeroCelda(gridStaticId, columnName, -1, defaultValue);
    }

    /**
     * Obtener valor numérico de la primera fila
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {number} defaultValue - Valor por defecto si no se puede convertir (default: 0)
     * @returns {number} - Valor numérico normalizado
     */
    function leerPrimerNumero(gridStaticId, columnName, defaultValue = 0) {
        return leerNumeroCelda(gridStaticId, columnName, 1, defaultValue);
    }

    /**
     * Obtener valor numérico con decimales específicos
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {number} rowIndex - Índice de la fila (1 = primera fila, -1 = fila seleccionada)
     * @param {number} decimalPlaces - Número de decimales (default: 2)
     * @param {number} defaultValue - Valor por defecto si no se puede convertir (default: 0)
     * @returns {number} - Valor numérico con decimales especificados
     */
    function leerNumeroRedondeado(gridStaticId, columnName, rowIndex = -1, decimalPlaces = 2, defaultValue = 0) {
        try {
            const rawValue = leerNumeroCelda(gridStaticId, columnName, rowIndex, defaultValue);

            if (rawValue === defaultValue && rawValue !== 0) {
                return defaultValue;
            }

            // Aplicar formato de decimales
            const formattedValue = parseFloat(rawValue.toFixed(decimalPlaces));

            //console.log(`invUtils: Valor con ${decimalPlaces} decimales de ${columnName}, fila ${rowIndex === -1 ? 'seleccionada' : rowIndex}: ${formattedValue}`);
            return formattedValue;

        } catch (error) {
            console.error('invUtils leerNumeroRedondeado error:', error);
            return defaultValue;
        }
    }

    /**
     * Obtener valor con decimales específicos de la fila seleccionada
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {number} decimalPlaces - Número de decimales (default: 2)
     * @param {number} defaultValue - Valor por defecto si no se puede convertir (default: 0)
     * @returns {number} - Valor con decimales especificados
     */
    function leerNumeroSeleccionadoRedondeado(gridStaticId, columnName, decimalPlaces = 2, defaultValue = 0) {
        return leerNumeroRedondeado(gridStaticId, columnName, -1, decimalPlaces, defaultValue);
    }

    /**
     * Obtener valor con decimales específicos de la primera fila
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {number} decimalPlaces - Número de decimales (default: 2)
     * @param {number} defaultValue - Valor por defecto si no se puede convertir (default: 0)
     * @returns {number} - Valor con decimales especificados
     */
    function leerPrimerNumeroRedondeado(gridStaticId, columnName, decimalPlaces = 2, defaultValue = 0) {
        return leerNumeroRedondeado(gridStaticId, columnName, 1, decimalPlaces, defaultValue);
    }

    /**
     * Obtener valor entero (sin decimales)
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {number} rowIndex - Índice de la fila (1 = primera fila, -1 = fila seleccionada)
     * @param {number} defaultValue - Valor por defecto si no se puede convertir (default: 0)
     * @returns {number} - Valor entero
     */
    function leerEnteroCelda(gridStaticId, columnName, rowIndex = -1, defaultValue = 0) {
        try {
            const rawValue = leerNumeroCelda(gridStaticId, columnName, rowIndex, defaultValue);

            if (rawValue === defaultValue && rawValue !== 0) {
                return defaultValue;
            }

            // Convertir a entero
            const integerValue = Math.round(rawValue);

            //console.log(`invUtils: Valor entero de ${columnName}, fila ${rowIndex === -1 ? 'seleccionada' : rowIndex}: ${integerValue}`);
            return integerValue;

        } catch (error) {
            console.error('invUtils leerEnteroCelda error:', error);
            return defaultValue;
        }
    }

    /**
     * Obtener valor entero de la fila seleccionada
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {number} defaultValue - Valor por defecto si no se puede convertir (default: 0)
     * @returns {number} - Valor entero
     */
    function leerEnteroSeleccionado(gridStaticId, columnName, defaultValue = 0) {
        return leerEnteroCelda(gridStaticId, columnName, -1, defaultValue);
    }

    /**
     * Obtener valor entero de la primera fila
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {number} defaultValue - Valor por defecto si no se puede convertir (default: 0)
     * @returns {number} - Valor entero
     */
    function leerPrimerEntero(gridStaticId, columnName, defaultValue = 0) {
        return leerEnteroCelda(gridStaticId, columnName, 1, defaultValue);
    }

    // =============================================================================
    // GRID — Asignación de valores
    // =============================================================================

    /**
     * Establecer valor en una columna del registro activo
     */
    function asignarColumna(gridStaticId, columnName, value) {
        const gridData = leerContextoRegistro(gridStaticId);
        if (!gridData.success) {
            return false;
        }

        gridData.model.setValue(gridData.record, columnName, value);
        return true;
    }

    /**
     * Setear un valor específico en una celda del Interactive Grid (Versión Mejorada)
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {number} rowIndex - Índice de la fila (1 = primera fila, -1 = fila seleccionada)
     * @param {any} value - Valor a establecer
     * @param {boolean} refresh - Si debe refrescar la vista (default: true)
     * @returns {boolean} - true si se estableció correctamente
     */
    function asignarCelda(gridStaticId, columnName, rowIndex, value, refresh = true) {
        try {
            console.log(`🔧 invUtils: Seteando valor ${value} en ${columnName}, fila ${rowIndex}`);

            // Validaciones robustas de parámetros
            if (!gridStaticId || typeof gridStaticId !== 'string') {
                console.error('invUtils: gridStaticId debe ser un string válido');
                return false;
            }

            if (!columnName || typeof columnName !== 'string') {
                console.error('invUtils: columnName debe ser un string válido');
                return false;
            }

            if (rowIndex === undefined || rowIndex === null) {
                console.error('invUtils: rowIndex no puede ser undefined o null');
                return false;
            }

            // Validar el valor - permitir 0, false, string vacío, pero no undefined/null
            if (value === undefined || value === null) {
                console.error('invUtils: value no puede ser undefined o null');
                return false;
            }

            // Obtener el modelo usando el método que funciona
            const model = apex.region(gridStaticId).widget().interactiveGrid("getCurrentView").model;

            if (!model) {
                console.error('invUtils: No se pudo obtener el modelo del grid');
                return false;
            }

            console.log(`✅ invUtils: Modelo obtenido correctamente`);

            let targetRecord = null;

            // Obtener registro objetivo
            if (rowIndex === -1) {
                // Usar el registro seleccionado
                const selectedRecords = apex.region(gridStaticId).widget().interactiveGrid("getCurrentView").getSelectedRecords();
                if (selectedRecords && selectedRecords.length > 0) {
                    targetRecord = selectedRecords[0];
                } else {
                    console.warn(`invUtils: No hay registro seleccionado en ${gridStaticId}`);
                    return false;
                }
            } else {
                // Obtener registro por índice usando un enfoque más directo
                console.log(`🔍 invUtils DEBUG: Buscando fila ${rowIndex}, rowIndex-1 = ${rowIndex - 1}`);

                // Usar un array para almacenar todos los registros y acceder por índice
                const allRecords = [];

                try {
                    model.forEach(function (record, index, id) {
                        console.log(`🔍 invUtils DEBUG: Procesando registro - index: ${index}, id: ${id}`);
                        if (record && typeof record === 'object') {
                            allRecords.push(record);
                        } else {
                            console.warn(`invUtils: Registro inválido encontrado en índice ${index}`);
                        }
                    });
                } catch (forEachError) {
                    console.error('invUtils: Error en model.forEach:', forEachError);
                    return false;
                }

                console.log(`📊 invUtils: Total registros encontrados: ${allRecords.length}`);

                const targetIndex = rowIndex - 1; // rowIndex 1 = primera fila (índice 0)

                if (targetIndex >= 0 && targetIndex < allRecords.length) {
                    targetRecord = allRecords[targetIndex];
                    console.log(`✅ invUtils DEBUG: Encontrado registro objetivo en índice ${targetIndex} (ID: ${targetRecord.id})`);
                } else {
                    console.warn(`invUtils: Fila ${rowIndex} fuera de rango en ${gridStaticId} (total filas: ${allRecords.length})`);
                    return false;
                }
            }

            if (!targetRecord) {
                console.error(`invUtils: No se pudo obtener registro objetivo`);
                return false;
            }

            console.log(`✅ invUtils: Registro objetivo obtenido - ID: ${targetRecord.id}`);

            // Obtener valor actual para comparar
            let currentValue;
            try {
                currentValue = model.getValue(targetRecord, columnName);
                console.log(`📊 invUtils: Valor actual en ${columnName}: ${currentValue}`);
            } catch (getValueError) {
                console.error('invUtils: Error al obtener valor actual:', getValueError);
                return false;
            }

            // Verificar que el registro no esté eliminado
            let metadata = null;
            try {
                const recordId = targetRecord.id;
                // Solo intentar obtener metadata si el recordId existe y el método está disponible
                if (recordId && model.getRecordMetadata && typeof model.getRecordMetadata === 'function') {
                    metadata = model.getRecordMetadata(recordId);

                    if (metadata && metadata.deleted) {
                        console.warn(`invUtils: Registro ${recordId} está eliminado, no se puede modificar`);
                        return false;
                    }
                } else {
                    console.log(`invUtils: Metadata no disponible o recordId no encontrado, continuando...`);
                }
            } catch (metadataError) {
                console.warn('invUtils: Error al obtener metadata del registro:', metadataError);
                // Continuar sin metadata si no está disponible
            }

            // Preparar el valor final - manejar formato europeo si es necesario
            let finalValue = value;

            // Si el valor es numérico y la columna parece ser numérica, formatear al formato europeo
            if (typeof value === 'number' && !isNaN(value)) {
                // Detectar si la columna es numérica basándose en el nombre
                const numericColumns = ['COSTO', 'CANTIDAD', 'TOTAL', 'PRECIO', 'IMPORTE', 'SUBTOTAL', 'IVA', 'DESCUENTO'];
                const isNumericColumn = numericColumns.some(col => columnName.toUpperCase().includes(col));

                if (isNumericColumn) {
                    try {
                        // Formatear al formato europeo (punto como separador de miles, coma como decimal)
                        finalValue = value.toFixed(3).replace('.', ',');
                        console.log(`📊 invUtils: Valor formateado al formato europeo: ${finalValue}`);
                    } catch (formatError) {
                        console.error('invUtils: Error al formatear valor:', formatError);
                        finalValue = value; // Usar valor original si falla el formateo
                    }
                }
            }

            // Establecer el valor usando el método directo que funciona
            try {
                model.setValue(targetRecord, columnName, finalValue);
                console.log(`📊 invUtils: Valor establecido: ${finalValue}`);
            } catch (setValueError) {
                console.error('invUtils: Error al establecer valor:', setValueError);
                return false;
            }

            // Verificar que se estableció correctamente
            let verifyValue;
            try {
                verifyValue = model.getValue(targetRecord, columnName);
                console.log(`📊 invUtils: Valor después de seteo: ${verifyValue}`);
            } catch (verifyError) {
                console.error('invUtils: Error al verificar valor:', verifyError);
                return false;
            }

            // Forzar el estado "dirty" del registro para que APEX lo reconozca como modificado
            try {
                if (model.markDirty) {
                    model.markDirty(targetRecord);
                    console.log(`✅ invUtils: Registro marcado como dirty`);
                }

                // Commit del registro individual
                if (model.commitRecord) {
                    model.commitRecord(targetRecord);
                    console.log(`✅ invUtils: Registro confirmado`);
                }
            } catch (commitError) {
                console.warn('invUtils: Error al confirmar registro:', commitError);
            }

            // Refrescar la vista si está habilitado
            if (refresh) {
                try {
                    const grid = apex.region(gridStaticId).call("getViews").grid;
                    if (grid.view$ && grid.view$.trigger) {
                        grid.view$.trigger('refresh');
                        console.log(`✅ invUtils: Vista refrescada`);
                    }
                } catch (e) {
                    console.warn('invUtils: No se pudo refrescar la vista:', e);
                }
            }

            // Verificación final con retry si es necesario
            setTimeout(() => {
                const finalCheckValue = model.getValue(targetRecord, columnName);
                console.log(`📊 invUtils: Verificación final - ${columnName}: ${finalCheckValue}`);

                // Si el valor cambió inesperadamente, intentar re-establecerlo
                if (finalCheckValue !== finalValue && finalCheckValue !== value) {
                    console.warn(`⚠️ invUtils: Valor cambió inesperadamente, re-estableciendo...`);

                    // Re-establecer el valor
                    model.setValue(targetRecord, columnName, finalValue);

                    // Forzar dirty state nuevamente
                    if (model.markDirty) {
                        model.markDirty(targetRecord);
                    }

                    // Verificación final después del retry
                    setTimeout(() => {
                        const retryValue = model.getValue(targetRecord, columnName);
                        if (retryValue === finalValue || retryValue === value) {
                            console.log(`✅ invUtils: Valor re-establecido correctamente`);
                        } else {
                            console.warn(`⚠️ invUtils: Valor no se pudo mantener estable: ${retryValue}`);
                        }
                    }, 100);
                } else {
                    console.log(`✅ invUtils: Valor se mantuvo correctamente`);
                }
            }, 100);

            return true;

        } catch (error) {
            console.error('invUtils asignarCelda error:', error);
            console.error('invUtils asignarCelda - Parámetros recibidos:', {
                gridStaticId: gridStaticId,
                columnName: columnName,
                rowIndex: rowIndex,
                value: value,
                valueType: typeof value,
                refresh: refresh
            });
            return false;
        }
    }

    /**
     * Setear valor en la fila seleccionada (Versión Mejorada)
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {any} value - Valor a establecer
     * @param {boolean} refresh - Si debe refrescar la vista (default: true)
     */
    function asignarCeldaSeleccionada(gridStaticId, columnName, value, refresh = true) {
        return asignarCelda(gridStaticId, columnName, -1, value, refresh);
    }

    /**
     * Setear valor en la primera fila (Versión Mejorada)
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {any} value - Valor a establecer
     * @param {boolean} refresh - Si debe refrescar la vista (default: true)
     */
    function asignarPrimeraCelda(gridStaticId, columnName, value, refresh = true) {
        return asignarCelda(gridStaticId, columnName, 1, value, refresh);
    }

    /**
     * Limpiar múltiples celdas seleccionadas estableciendo valores vacíos
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string[]} columnNames - Array de nombres de columnas a limpiar
     * @param {any} value - Valor a establecer (default: '')
     * @param {boolean} refresh - Si debe refrescar la vista (default: true)
     * @returns {boolean} - true si todas las celdas se limpiaron correctamente
     */
    function limpiarCeldasSeleccionadas(gridStaticId, columnNames, value = '', refresh = true) {
        if (!Array.isArray(columnNames) || columnNames.length === 0) {
            console.warn('invUtils: limpiarCeldasSeleccionadas - columnNames debe ser un array no vacío');
            return false;
        }

        let allSuccess = true;

        try {
            columnNames.forEach(columnName => {
                const success = asignarCelda(gridStaticId, columnName, -1, value, false);
                if (!success) {
                    allSuccess = false;
                    console.warn(`invUtils: Error limpiando columna ${columnName}`);
                }
            });

            // Refrescar solo una vez al final si se solicitó
            if (refresh && allSuccess) {
                refrescarVista(gridStaticId);
            }

            return allSuccess;
        } catch (error) {
            console.error('invUtils: Error en limpiarCeldasSeleccionadas:', error);
            return false;
        }
    }

    /**
     * Setear valor numérico con control de decimales
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {number} rowIndex - Índice de la fila (1 = primera fila, -1 = fila seleccionada)
     * @param {number} value - Valor a establecer
     * @param {number} decimalPlaces - Número de decimales para formatear (default: null = sin formatear)
     * @param {boolean} refresh - Si debe refrescar la vista (default: true)
     * @returns {boolean} - true si se estableció correctamente
     */
    function asignarNumeroCelda(gridStaticId, columnName, rowIndex, value, decimalPlaces = null, refresh = true) {
        try {
            let finalValue = value;

            // Formatear decimales si se especifica
            if (decimalPlaces !== null && typeof value === 'number') {
                finalValue = parseFloat(value.toFixed(decimalPlaces));
            }

            // Usar la función asignarCelda existente
            const result = asignarCelda(gridStaticId, columnName, rowIndex, finalValue, refresh);

            if (result) {
                //console.log(`invUtils: Valor numérico ${finalValue} establecido en ${columnName}, fila ${rowIndex === -1 ? 'seleccionada' : rowIndex}${decimalPlaces !== null ? ` (con ${decimalPlaces} decimales)` : ''}`);
            }

            return result;

        } catch (error) {
            console.error('invUtils asignarNumeroCelda error:', error);
            return false;
        }
    }

    /**
     * Setear valor numérico en la fila seleccionada
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {number} value - Valor a establecer
     * @param {number} decimalPlaces - Número de decimales para formatear (default: null = sin formatear)
     * @param {boolean} refresh - Si debe refrescar la vista (default: true)
     * @returns {boolean} - true si se estableció correctamente
     */
    function asignarNumeroSeleccionado(gridStaticId, columnName, value, decimalPlaces = null, refresh = true) {
        return asignarNumeroCelda(gridStaticId, columnName, -1, value, decimalPlaces, refresh);
    }

    /**
     * Setear valor numérico en la primera fila
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {number} value - Valor a establecer
     * @param {number} decimalPlaces - Número de decimales para formatear (default: null = sin formatear)
     * @param {boolean} refresh - Si debe refrescar la vista (default: true)
     * @returns {boolean} - true si se estableció correctamente
     */
    function asignarPrimerNumero(gridStaticId, columnName, value, decimalPlaces = null, refresh = true) {
        return asignarNumeroCelda(gridStaticId, columnName, 1, value, decimalPlaces, refresh);
    }

    /**
     * Setear valor entero (sin decimales)
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {number} rowIndex - Índice de la fila (1 = primera fila, -1 = fila seleccionada)
     * @param {number} value - Valor a establecer
     * @param {boolean} refresh - Si debe refrescar la vista (default: true)
     * @returns {boolean} - true si se estableció correctamente
     */
    function asignarEnteroCelda(gridStaticId, columnName, rowIndex, value, refresh = true) {
        const integerValue = Math.round(value);
        return asignarCelda(gridStaticId, columnName, rowIndex, integerValue, refresh);
    }

    /**
     * Setear valor entero en la fila seleccionada
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {number} value - Valor a establecer
     * @param {boolean} refresh - Si debe refrescar la vista (default: true)
     * @returns {boolean} - true si se estableció correctamente
     */
    function asignarEnteroSeleccionado(gridStaticId, columnName, value, refresh = true) {
        return asignarEnteroCelda(gridStaticId, columnName, -1, value, refresh);
    }

    /**
     * Setear valor entero en la primera fila
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {number} value - Valor a establecer
     * @param {boolean} refresh - Si debe refrescar la vista (default: true)
     * @returns {boolean} - true si se estableció correctamente
     */
    function asignarPrimerEntero(gridStaticId, columnName, value, refresh = true) {
        return asignarEnteroCelda(gridStaticId, columnName, 1, value, refresh);
    }

    /**
     * Setear valor y recalcular automáticamente
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna a modificar
     * @param {number} rowIndex - Índice de la fila (1 = primera fila, -1 = fila seleccionada)
     * @param {number} value - Valor a establecer
     * @param {object} recalculoConfig - Configuración para el recálculo automático
     * @param {array} recalculoConfig.sourceColumns - Columnas que disparan el recálculo
     * @param {string} recalculoConfig.targetColumn - Columna donde se guarda el resultado
     * @param {function} recalculoConfig.formula - Función que realiza el cálculo
     * @param {number} recalculoConfig.decimalPlaces - Número de decimales (default: 2)
     * @param {boolean} refresh - Si debe refrescar la vista (default: true)
     * @returns {boolean} - true si se estableció correctamente
     */
    function asignarCeldaConRecalculo(gridStaticId, columnName, rowIndex, value, recalculoConfig, refresh = true) {
        try {
            console.log(`invUtils: Estableciendo valor ${value} en ${columnName}, fila ${rowIndex === -1 ? 'seleccionada' : rowIndex}`);

            // Establecer el valor
            const result = asignarNumeroCelda(gridStaticId, columnName, rowIndex, value, null, refresh);

            if (result && recalculoConfig) {
                // Esperar un poco para que el valor se guarde
                setTimeout(function () {
                    console.log(`invUtils: Ejecutando recálculo automático...`);

                    // Ejecutar el recálculo
                    const recalculatedValue = calcularFormula(gridStaticId, recalculoConfig);

                    console.log(`invUtils: Recálculo completado. Nuevo valor en ${recalculoConfig.targetColumn}: ${recalculatedValue}`);
                }, 50);
            }

            return result;

        } catch (error) {
            console.error('invUtils asignarCeldaConRecalculo error:', error);
            return false;
        }
    }

    /**
     * Setear valor en fila seleccionada y recalcular automáticamente
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {number} value - Valor a establecer
     * @param {object} recalculoConfig - Configuración para el recálculo automático
     * @param {boolean} refresh - Si debe refrescar la vista (default: true)
     */
    function asignarCeldaSeleccionadaConRecalculo(gridStaticId, columnName, value, recalculoConfig, refresh = true) {
        return asignarCeldaConRecalculo(gridStaticId, columnName, -1, value, recalculoConfig, refresh);
    }

    /**
     * Setear valor en primera fila y recalcular automáticamente
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {number} value - Valor a establecer
     * @param {object} recalculoConfig - Configuración para el recálculo automático
     * @param {boolean} refresh - Si debe refrescar la vista (default: true)
     */
    function asignarPrimeraCeldaConRecalculo(gridStaticId, columnName, value, recalculoConfig, refresh = true) {
        return asignarCeldaConRecalculo(gridStaticId, columnName, 1, value, recalculoConfig, refresh);
    }

    /**
     * Setear un valor o cálculo en todas las filas del IG, usando seteo como string
     * y un seteo "dummy" previo (null) para asegurar que APEX persista el cambio.
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} targetColumn - Columna destino a setear
     * @param {any|function} valueOrFormula - Valor fijo o función (record, index, model) => valor
     * @param {object} options - Opciones
     * @param {number|null} options.decimalPlaces - Si es número, formatea con decimales antes de toString (default: null)
     * @param {boolean} options.commit - Confirmar cambios por registro (default: true)
     * @param {boolean} options.refresh - Refrescar vista al final (default: true)
     * @param {boolean} options.onlyEditable - Solo filas editables (default: true)
     * @returns {boolean} - true si se procesó sin errores graves
     */
    function asignarFilas(gridStaticId, targetColumn, valueOrFormula, options) {
        try {
            options = options || {};
            const decimalPlaces = (typeof options.decimalPlaces === 'number') ? options.decimalPlaces : null;
            const doCommit = options.commit !== false; // default true
            const doRefresh = options.refresh !== false; // default true
            const onlyEditable = options.onlyEditable !== false; // default true

            const region = apex.region(gridStaticId);
            const $ig = region && region.widget ? region.widget() : null;
            if (!$ig) {
                console.error('invUtils: No se encontró la región IG con Static ID:', gridStaticId);
                return false;
            }
            const grid = $ig.interactiveGrid('getViews', 'grid');
            const model = grid && grid.model ? grid.model : null;
            if (!model) {
                console.error('invUtils: No se pudo obtener el modelo del IG:', gridStaticId);
                return false;
            }

            let processed = 0;
            let skipped = 0;

            model.forEach(function (record, index, id) {
                try {
                    // Omitir registros marcados para eliminación
                    if (esRegistroEliminado(record, model)) {
                        skipped++; return;
                    }
                    if (onlyEditable && model.allowEdit && !model.allowEdit(record)) {
                        skipped++; return;
                    }

                    // Obtener valor final: fijo o fórmula
                    let rawValue = (typeof valueOrFormula === 'function')
                        ? valueOrFormula(record, index, model)
                        : valueOrFormula;

                    // Formateo opcional con decimales si es número
                    if (rawValue !== null && rawValue !== undefined && typeof rawValue === 'number' && decimalPlaces !== null) {
                        try { rawValue = parseFloat(Number(rawValue).toFixed(decimalPlaces)); } catch (e) { /* noop */ }
                    }

                    // Convertir a string para garantizar persistencia en IG
                    let stringValue = (rawValue === null || rawValue === undefined) ? '' : String(rawValue);

                    // Seteo dummy (null) y luego el valor string para que APEX detecte y guarde
                    try { model.setValue(record, targetColumn, null); } catch (e) { /* noop */ }
                    model.setValue(record, targetColumn, stringValue);

                    if (doCommit) {
                        try { if (model.markDirty) { model.markDirty(record); } } catch (e) { /* noop */ }
                        try { if (model.commitRecord) { model.commitRecord(record); } } catch (e) { /* noop */ }
                    }

                    processed++;
                } catch (rowErr) {
                    console.warn('invUtils: Error en asignarFilas para registro', id, rowErr);
                    skipped++;
                }
            });

            if (doRefresh) {
                try { if (grid.view$ && grid.view$.trigger) { grid.view$.trigger('refresh'); } } catch (e) { /* noop */ }
            }

            console.log(`invUtils: asignarFilas completado. Procesados=${processed}, Omitidos=${skipped}`);
            return true;

        } catch (error) {
            console.error('invUtils asignarFilas error:', error);
            return false;
        }
    }

    /**
     * Versión corta: setea un valor fijo en todas las filas de una columna
     * @param {string} gridStaticId
     * @param {string} targetColumn
     * @param {any} value
     * @param {object} options - mismas opciones que asignarFilas (opcional)
     */
    function asignarValorFilas(gridStaticId, targetColumn, value, options) {
        return asignarFilas(gridStaticId, targetColumn, value, options || {});
    }

    // =============================================================================
    // GRID — Navegación y foco
    // =============================================================================

    /**
     * Navegar a una celda específica en el Interactive Grid (Versión Mejorada)
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna a la que navegar
     * @param {number} rowIndex - Índice de la fila (0 = primera fila, -1 = fila seleccionada)
     * @param {boolean} focus - Si debe hacer focus en la celda (default: true)
     */
    function irACelda(gridStaticId, columnName, rowIndex = -1, focus = true) {
        try {
            console.log(`🎯 invUtils: Navegando a celda ${columnName} en fila ${rowIndex === -1 ? 'seleccionada' : rowIndex}`);

            // Obtener el grid usando el método que funciona
            const grid = apex.region(gridStaticId).call("getViews").grid;
            const model = apex.region(gridStaticId).widget().interactiveGrid("getCurrentView").model;

            let targetRecord = null;

            // Obtener registro objetivo
            if (rowIndex === -1) {
                // Usar el registro seleccionado
                const selectedRecords = apex.region(gridStaticId).widget().interactiveGrid("getCurrentView").getSelectedRecords();
                if (selectedRecords && selectedRecords.length > 0) {
                    targetRecord = selectedRecords[0];
                } else {
                    console.warn(`invUtils: No hay registro seleccionado en ${gridStaticId}`);
                    return false;
                }
            } else {
                // Obtener registro por índice
                let recordIndex = 0;
                console.log(`🔍 invUtils DEBUG: Buscando fila ${rowIndex}, rowIndex-1 = ${rowIndex - 1}`);
                model.forEach(function (record, index, id) {
                    console.log(`🔍 invUtils DEBUG: recordIndex = ${recordIndex}, index = ${index}, id = ${id}`);
                    if (recordIndex === rowIndex - 1) {  // rowIndex 1 = primera fila (índice 0)
                        targetRecord = record;
                        console.log(`✅ invUtils DEBUG: Encontrado registro objetivo en recordIndex = ${recordIndex}`);
                        return false; // Salir del forEach
                    }
                    recordIndex++;
                });

                if (!targetRecord) {
                    console.warn(`invUtils: Fila ${rowIndex} fuera de rango en ${gridStaticId}`);
                    return false;
                }
            }

            if (targetRecord) {
                // Navegar a la celda usando el método que funciona
                grid.gotoCell(targetRecord, columnName);
                console.log(`✅ invUtils: Navegación a celda ${columnName} completada`);

                // Hacer focus si está habilitado
                if (focus) {
                    setTimeout(() => {
                        try {
                            // Intentar hacer focus en la celda
                            const cellElement = grid.getCellElement ? grid.getCellElement(targetRecord, columnName) : null;
                            if (cellElement && cellElement.length > 0) {
                                cellElement.focus();
                                console.log(`✅ invUtils: Focus en celda aplicado`);
                            }
                        } catch (e) {
                            console.warn(`invUtils: No se pudo aplicar focus:`, e);
                        }
                    }, 100);
                }

                return true;
            }

            return false;

        } catch (error) {
            console.error('invUtils irACelda error:', error);
            return false;
        }
    }

    /**
     * Navegar a la primera celda de una columna específica (Versión Mejorada)
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     */
    function irAPrimeraCelda(gridStaticId, columnName) {
        return irACelda(gridStaticId, columnName, 0, true);
    }

    /**
     * Navegar a la celda de la fila seleccionada (Versión Simplificada)
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @returns {boolean} - true si se navegó correctamente
     */
    function irACeldaSeleccionada(gridStaticId, columnName) {
        try {
            console.log(`🎯 invUtils: Navegando a celda seleccionada ${columnName} en ${gridStaticId}`);

            // Obtener el grid usando el método directo
            var grid = apex.region(gridStaticId).call("getViews").grid;

            // Obtener registros seleccionados
            var array = grid.getSelectedRecords();

            // Verificar que hay registros seleccionados
            if (!array || array.length === 0) {
                console.warn(`invUtils: No hay registros seleccionados en ${gridStaticId}`);
                return false;
            }

            // Navegar a la celda usando el método directo
            grid.gotoCell(array[0][1], columnName);

            console.log(`✅ invUtils: Navegación a celda ${columnName} completada`);
            return true;

        } catch (error) {
            console.error('invUtils irACeldaSeleccionada error:', error);
            return false;
        }
    }

    /**
     * Inicializar el sistema de re-enfoque automático
     * @param {boolean} enable - Si debe habilitar el sistema (default: true)
     */
    function configurarRestauracionFoco(enable = true) {
        try {
            focusRestorationEnabled = enable;

            if (enable) {
                /* console.log('invUtils: Sistema de re-enfoque automático inicializado'); */

                // Captura el foco cuando el usuario está dentro del IG
                $(document).off('focusin.invUtils').on('focusin.invUtils', '.a-GV-cell', function () {
                    lastFocusedCell = this;
                    /* console.log('invUtils: Celda enfocada capturada:', this); */
                });

                // Cuando vuelve el foco al navegador, intenta restaurar el enfoque
                $(window).off('focus.invUtils').on('focus.invUtils', function () {
                    if (lastFocusedCell && focusRestorationEnabled) {
                        setTimeout(() => {
                            try {
                                lastFocusedCell.focus();
                                /* console.log('invUtils: Foco restaurado en celda'); */
                            } catch (error) {
                                console.warn('invUtils: Error al restaurar foco:', error);
                                lastFocusedCell = null; // Limpiar referencia inválida
                            }
                        }, 50); // pequeño retraso para evitar conflictos
                    }
                });

                console.log('invUtils: Eventos de re-enfoque configurados');
            } else {
                // Deshabilitar el sistema
                $(document).off('focusin.invUtils');
                $(window).off('focus.invUtils');
                lastFocusedCell = null;
                /* console.log('invUtils: Sistema de re-enfoque automático deshabilitado'); */
            }

            return true;

        } catch (error) {
            console.error('invUtils configurarRestauracionFoco error:', error);
            return false;
        }
    }

    /**
     * Habilitar el sistema de re-enfoque automático
     */
    function habilitarRestauracionFoco() {
        return configurarRestauracionFoco(true);
    }

    /**
     * Deshabilitar el sistema de re-enfoque automático
     */
    function deshabilitarRestauracionFoco() {
        return configurarRestauracionFoco(false);
    }

    /**
     * Obtener la última celda enfocada
     * @returns {HTMLElement|null} - Elemento de la celda o null si no hay
     */
    function leerUltimoFoco() {
        return lastFocusedCell;
    }

    /**
     * Establecer manualmente la última celda enfocada
     * @param {HTMLElement} cellElement - Elemento de la celda
     */
    function asignarUltimoFoco(cellElement) {
        if (cellElement && cellElement.classList && cellElement.classList.contains('a-GV-cell')) {
            lastFocusedCell = cellElement;
            /* console.log('invUtils: Última celda enfocada establecida manualmente'); */
            return true;
        } else {
            console.warn('invUtils: Elemento no es una celda válida del Interactive Grid');
            return false;
        }
    }

    /**
     * Restaurar el foco manualmente
     * @param {number} delay - Delay en milisegundos antes de restaurar (default: 50)
     * @returns {boolean} - true si se restauró correctamente
     */
    function restaurarFoco(delay = 50) {
        try {
            if (lastFocusedCell && focusRestorationEnabled) {
                setTimeout(() => {
                    try {
                        lastFocusedCell.focus();
                        /* console.log('invUtils: Foco restaurado manualmente'); */
                        return true;
                    } catch (error) {
                        console.warn('invUtils: Error al restaurar foco manualmente:', error);
                        lastFocusedCell = null;
                        return false;
                    }
                }, delay);
                return true;
            } else {
                console.warn('invUtils: No hay celda enfocada para restaurar o el sistema está deshabilitado');
                return false;
            }
        } catch (error) {
            console.error('invUtils restaurarFoco error:', error);
            return false;
        }
    }

    /**
     * Limpiar la referencia de la última celda enfocada
     */
    function limpiarReferenciaFoco() {
        lastFocusedCell = null;
        /* console.log('invUtils: Referencia de última celda enfocada limpiada'); */
    }

    /**
     * Obtener el estado del sistema de re-enfoque
     * @returns {object} - Objeto con el estado del sistema
     */
    function leerEstadoFoco() {
        return {
            enabled: focusRestorationEnabled,
            lastFocusedCell: lastFocusedCell,
            hasLastFocusedCell: lastFocusedCell !== null,
            cellInfo: lastFocusedCell ? {
                tagName: lastFocusedCell.tagName,
                className: lastFocusedCell.className,
                id: lastFocusedCell.id,
                textContent: lastFocusedCell.textContent ? lastFocusedCell.textContent.substring(0, 50) + '...' : ''
            } : null
        };
    }

    // =============================================================================
    // GRID — Refresco y confirmación del modelo
    // =============================================================================

    /**
     * Función helper para refrescar un grid de manera simple
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {boolean} refreshRegion - Si debe refrescar también la región completa (default: true)
     * @returns {boolean} - true si se refrescó correctamente
     */
    function refrescarRegion(gridStaticId, refreshRegion = true) {
        try {
            console.log(`🔄 invUtils: Refrescando grid ${gridStaticId}`);

            const grid = apex.region(gridStaticId).call("getViews").grid;

            // Refrescar vista del grid
            try {
                grid.view$.trigger('refresh');
                console.log(`✅ invUtils: Vista del grid ${gridStaticId} refrescada`);
            } catch (e) {
                console.warn(`invUtils: No se pudo refrescar vista del grid ${gridStaticId}:`, e);
            }

            // Refrescar región completa si está habilitado
            if (refreshRegion) {
                try {
                    const region = apex.region(gridStaticId).widget().interactiveGrid('getViews').grid;
                    region.model.clearChanges();
                    apex.region(gridStaticId).refresh();
                    console.log(`✅ invUtils: Región ${gridStaticId} refrescada`);
                } catch (e) {
                    console.warn(`invUtils: No se pudo refrescar región ${gridStaticId}:`, e);
                }
            }

            return true;

        } catch (error) {
            console.error(`invUtils refrescarRegion error para ${gridStaticId}:`, error);
            return false;
        }
    }

    /**
     * Refrescar grid y recalcular
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {object} recalculoConfig - Configuración opcional para recálculo
     * @returns {boolean} - true si se refrescó correctamente
     */
    function refrescarConRecalculo(gridStaticId, recalculoConfig = null) {
        try {
            const grid = apex.region(gridStaticId).call("getViews").grid;

            // Refrescar la vista del grid
            try {
                // Método correcto para Interactive Grids de APEX
                grid.view$.trigger('refresh');
                console.log(`invUtils: Grid ${gridStaticId} refrescado`);
            } catch (e) {
                console.warn(`invUtils: No se pudo refrescar grid ${gridStaticId}:`, e);
            }

            // Ejecutar recálculo si se especifica
            if (recalculoConfig) {
                setTimeout(function () {
                    forzarRecalculo(gridStaticId, recalculoConfig);
                }, 100);
            }

            return true;

        } catch (error) {
            console.error('invUtils refrescarConRecalculo error:', error);
            return false;
        }
    }

    /**
     * Función helper para refrescar grid y recalcular automáticamente
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} targetColumn - Columna específica a recalcular (opcional)
     * @param {number} delay - Delay antes del recálculo (default: 100)
     * @returns {boolean} - true si se ejecutó correctamente
     */
    function refrescarCalculosRegistrados(gridStaticId, targetColumn = null, delay = 100) {
        try {
            console.log(`🔄 invUtils: Refrescando y recalculando ${gridStaticId}${targetColumn ? ` -> ${targetColumn}` : ''}`);

            // Primero refrescar el grid
            refrescarRegion(gridStaticId, true);

            // Luego recalcular si hay configuraciones automáticas
            setTimeout(() => {
                actualizarCalculoAutomatico(gridStaticId, targetColumn, 50);
            }, delay);

            return true;

        } catch (error) {
            console.error(`invUtils refrescarCalculosRegistrados error para ${gridStaticId}:`, error);
            return false;
        }
    }

    /**
     * Confirmar cambios en el modelo del grid sin refrescar la vista
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {boolean} commitAll - Si debe hacer commit de todos los registros (default: true)
     * @param {boolean} forceDirty - Si debe forzar el estado dirty antes de confirmar (default: true)
     * @returns {boolean} - true si se confirmaron correctamente
     */
    function confirmarCambios(gridStaticId, commitAll = true, forceDirty = true) {
        try {
            console.log(`💾 invUtils: Confirmando cambios en ${gridStaticId}`);

            const grid = apex.region(gridStaticId).call("getViews").grid;
            const model = grid.model;

            let changesCommitted = 0;

            if (commitAll) {
                // Confirmar todos los registros modificados
                model.forEach(function (record) {
                    try {
                        // Forzar estado dirty si está habilitado
                        if (forceDirty) {
                            try {
                                if (model.markDirty) {
                                    model.markDirty(record);
                                }
                                if (record.setDirty) {
                                    record.setDirty(true);
                                }
                            } catch (dirtyError) {
                                console.warn(`invUtils: Error al forzar dirty state:`, dirtyError);
                            }
                        }

                        // Verificar si el registro está modificado
                        let isModified = false;

                        // Método 1: Usar isDirty si está disponible
                        if (model.isDirty && model.isDirty(record)) {
                            isModified = true;
                        }

                        // Método 2: Verificar si tiene propiedades de modificación
                        if (record.isDirty && record.isDirty()) {
                            isModified = true;
                        }

                        // Método 3: Siempre intentar confirmar si forceDirty está habilitado
                        if (forceDirty) {
                            isModified = true;
                        }

                        if (isModified) {
                            // Marcar como confirmado
                            if (model.markDirty) {
                                model.markDirty(record);
                            }

                            // Commit del registro individual
                            if (model.commitRecord) {
                                model.commitRecord(record);
                            }

                            changesCommitted++;
                            console.log(`💾 invUtils: Registro confirmado en ${gridStaticId}`);
                        }
                    } catch (recordError) {
                        console.warn(`invUtils: Error al confirmar registro individual:`, recordError);
                    }
                });

                // Commit del modelo completo
                try {
                    if (model.commit) {
                        model.commit();
                        console.log(`💾 invUtils: Modelo completo confirmado en ${gridStaticId}`);
                    }
                } catch (commitError) {
                    console.warn(`invUtils: Error al confirmar modelo completo:`, commitError);
                }

            } else {
                // Solo confirmar el registro activo/seleccionado
                try {
                    const array = grid.getSelectedRecords();
                    if (array && array.length > 0) {
                        const selectedRecord = array[0][1];

                        // Forzar estado dirty si está habilitado
                        if (forceDirty) {
                            if (model.markDirty) {
                                model.markDirty(selectedRecord);
                            }
                            if (selectedRecord.setDirty) {
                                selectedRecord.setDirty(true);
                            }
                        }

                        if (model.markDirty) {
                            model.markDirty(selectedRecord);
                        }

                        if (model.commitRecord) {
                            model.commitRecord(selectedRecord);
                        }

                        changesCommitted = 1;
                        console.log(`💾 invUtils: Registro seleccionado confirmado en ${gridStaticId}`);
                    }
                } catch (selectedError) {
                    console.warn(`invUtils: Error al confirmar registro seleccionado:`, selectedError);
                }
            }

            console.log(`✅ invUtils: ${changesCommitted} cambios confirmados en ${gridStaticId}`);
            return true;

        } catch (error) {
            console.error(`invUtils confirmarCambios error para ${gridStaticId}:`, error);
            return false;
        }
    }

    /**
     * Refrescar solo la vista del grid sin recargar datos (confirmar cambios primero)
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {boolean} commitChanges - Si debe confirmar cambios antes de refrescar (default: true)
     * @returns {boolean} - true si se refrescó correctamente
     */
    function refrescarVista(gridStaticId, commitChanges = true) {
        try {
            console.log(`🔄 invUtils: Refrescando solo vista de ${gridStaticId}`);

            const grid = apex.region(gridStaticId).call("getViews").grid;

            // Confirmar cambios antes de refrescar si está habilitado
            if (commitChanges) {
                confirmarCambios(gridStaticId, true);
            }

            // Refrescar solo la vista del grid (sin recargar datos)
            try {
                // Método 1: Refrescar vista del grid
                if (grid.view$ && grid.view$.trigger) {
                    grid.view$.trigger('refresh');
                    console.log(`✅ invUtils: Vista del grid ${gridStaticId} refrescada`);
                }

                // Método 2: Refrescar vista usando el método del grid
                if (grid.refreshView) {
                    grid.refreshView();
                    console.log(`✅ invUtils: Vista del grid ${gridStaticId} refrescada usando refreshView()`);
                }

                // Método 3: Refrescar usando el método de la vista
                if (grid.getView && grid.getView().refresh) {
                    grid.getView().refresh();
                    console.log(`✅ invUtils: Vista del grid ${gridStaticId} refrescada usando getView().refresh()`);
                }

                return true;

            } catch (viewError) {
                console.warn(`invUtils: Error al refrescar vista del grid ${gridStaticId}:`, viewError);

                // Fallback: intentar refrescar usando el método de la región (pero solo vista)
                try {
                    if (grid.view$ && grid.view$.grid) {
                        grid.view$.grid('refresh');
                        console.log(`✅ invUtils: Vista del grid ${gridStaticId} refrescada usando fallback`);
                        return true;
                    }
                } catch (fallbackError) {
                    console.warn(`invUtils: Error en fallback para ${gridStaticId}:`, fallbackError);
                }

                return false;
            }

        } catch (error) {
            console.error(`invUtils refrescarVista error para ${gridStaticId}:`, error);
            return false;
        }
    }

    /**
     * Refrescar grid de manera segura (confirmar cambios y refrescar solo vista)
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {boolean} commitChanges - Si debe confirmar cambios antes de refrescar (default: true)
     * @param {boolean} refreshRegion - Si debe refrescar también la región completa (default: false)
     * @returns {boolean} - true si se refrescó correctamente
     */
    function refrescarConConfirmacion(gridStaticId, commitChanges = true, refreshRegion = false) {
        try {
            console.log(`🛡️ invUtils: Refrescando grid de manera segura ${gridStaticId}`);

            // Confirmar cambios primero
            if (commitChanges) {
                confirmarCambios(gridStaticId, true);
            }

            // Refrescar solo la vista del grid
            const viewRefreshed = refrescarVista(gridStaticId, false);

            // Refrescar región completa solo si se especifica (y con cuidado)
            if (refreshRegion && viewRefreshed) {
                try {
                    // Usar un timeout para asegurar que los cambios se hayan aplicado
                    setTimeout(() => {
                        try {
                            const grid = apex.region(gridStaticId).widget().interactiveGrid('getViews').grid;
                            grid.model.clearChanges();
                            apex.region(gridStaticId).refresh();
                            console.log(`✅ invUtils: Región ${gridStaticId} refrescada de manera segura`);
                        } catch (regionError) {
                            console.warn(`invUtils: No se pudo refrescar región ${gridStaticId}:`, regionError);
                        }
                    }, 100);
                } catch (regionError) {
                    console.warn(`invUtils: Error al refrescar región ${gridStaticId}:`, regionError);
                }
            }

            return viewRefreshed;

        } catch (error) {
            console.error(`invUtils refrescarConConfirmacion error para ${gridStaticId}:`, error);
            return false;
        }
    }

    /**
     * Forzar el estado "dirty" de un registro para que APEX lo reconozca como modificado
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {number} rowIndex - Índice de la fila (1 = primera fila, -1 = fila seleccionada)
     * @returns {boolean} - true si se marcó correctamente
     */
    function marcarFila(gridStaticId, rowIndex = -1) {
        try {
            console.log(`🔄 invUtils: Forzando estado dirty en ${gridStaticId}, fila ${rowIndex}`);

            const grid = apex.region(gridStaticId).call("getViews").grid;
            const model = grid.model;

            let targetRow = null;

            // Obtener fila objetivo
            if (rowIndex === -1) {
                const array = grid.getSelectedRecords();
                if (array && array.length > 0) {
                    targetRow = array[0][1];
                } else {
                    console.warn(`invUtils: No hay fila seleccionada en ${gridStaticId}`);
                    return false;
                }
            } else {
                const allRecords = [];
                model.forEach(function (record) {
                    allRecords.push(record);
                });

                if (allRecords.length >= rowIndex && rowIndex > 0) {
                    targetRow = allRecords[rowIndex - 1];
                } else {
                    console.warn(`invUtils: Fila ${rowIndex} fuera de rango en ${gridStaticId}`);
                    return false;
                }
            }

            if (!targetRow) {
                console.error(`invUtils: No se pudo obtener fila objetivo`);
                return false;
            }

            // Usar la función mejorada para forzar dirty state
            return marcarRegistro(model, targetRow, 'COSTO'); // Usar COSTO como columna por defecto

        } catch (error) {
            console.error(`invUtils marcarFila error para ${gridStaticId}:`, error);
            return false;
        }
    }

    /**
     * Forzar el estado "dirty" de un registro usando múltiples métodos
     * @param {object} model - Modelo del grid
     * @param {object} targetRow - Registro objetivo
     * @param {string} columnName - Nombre de la columna (opcional)
     * @returns {boolean} - true si se marcó correctamente
     */
    function marcarRegistro(model, targetRow, columnName = null) {
        try {
            console.log(`🔄 invUtils: Forzando dirty state usando múltiples métodos...`);

            let successCount = 0;

            // Método 1: markDirty
            try {
                if (model.markDirty) {
                    model.markDirty(targetRow);
                    successCount++;
                    console.log(`✅ invUtils: Dirty state usando markDirty()`);
                }
            } catch (e) {
                console.warn(`invUtils: Error con markDirty:`, e);
            }

            // Método 2: setDirty en modelo
            try {
                if (model.setDirty) {
                    model.setDirty(targetRow, true);
                    successCount++;
                    console.log(`✅ invUtils: Dirty state usando model.setDirty()`);
                }
            } catch (e) {
                console.warn(`invUtils: Error con model.setDirty:`, e);
            }

            // Método 3: setDirty en registro
            try {
                if (targetRow.setDirty) {
                    targetRow.setDirty(true);
                    successCount++;
                    console.log(`✅ invUtils: Dirty state usando record.setDirty()`);
                }
            } catch (e) {
                console.warn(`invUtils: Error con record.setDirty:`, e);
            }

            // Método 4: setValue con opciones dirty
            try {
                if (columnName && model.setValue && model.setValue.length > 3) {
                    const currentValue = model.getValue(targetRow, columnName);
                    if (currentValue !== undefined) {
                        model.setValue(targetRow, columnName, currentValue, { dirty: true });
                        successCount++;
                        console.log(`✅ invUtils: Dirty state usando setValue con opciones`);
                    }
                }
            } catch (e) {
                console.warn(`invUtils: Error con setValue con opciones:`, e);
            }

            // Método 5: updateRecord
            try {
                if (model.updateRecord) {
                    model.updateRecord(targetRow);
                    successCount++;
                    console.log(`✅ invUtils: Dirty state usando updateRecord()`);
                }
            } catch (e) {
                console.warn(`invUtils: Error con updateRecord:`, e);
            }

            // Método 6: Simular cambio manual
            try {
                if (columnName) {
                    const currentValue = model.getValue(targetRow, columnName);
                    if (currentValue !== undefined) {
                        // Re-establecer el valor para forzar dirty state
                        model.setValue(targetRow, columnName, currentValue);
                        successCount++;
                        console.log(`✅ invUtils: Dirty state usando re-establecimiento de valor`);
                    }
                }
            } catch (e) {
                console.warn(`invUtils: Error con re-establecimiento:`, e);
            }

            console.log(`📊 invUtils: ${successCount} métodos de dirty state ejecutados exitosamente`);
            return successCount > 0;

        } catch (error) {
            console.error('invUtils marcarRegistro error:', error);
            return false;
        }
    }

    // =============================================================================
    // GRID — Variantes de asignación existentes
    // =============================================================================

    /**
     * Setear valor numérico con commit explícito para evitar sobrescritura
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {number} rowIndex - Índice de la fila (1 = primera fila, -1 = fila seleccionada)
     * @param {number} value - Valor a establecer
     * @param {number} decimalPlaces - Número de decimales para formatear (default: null = sin formatear)
     * @param {boolean} refresh - Si debe refrescar la vista (default: true)
     * @returns {boolean} - true si se estableció correctamente
     */
    function asignarNumeroMarcado(gridStaticId, columnName, rowIndex, value, decimalPlaces = null, refresh = true) {
        try {
            // Obtener el grid usando el método que funciona
            const grid = apex.region(gridStaticId).call("getViews").grid;

            let targetRow = null;

            // Si rowIndex es -1, usar la fila seleccionada
            if (rowIndex === -1) {
                const array = grid.getSelectedRecords();
                if (array && array.length > 0) {
                    targetRow = array[0][1];
                } else {
                    console.warn(`invUtils: No hay fila seleccionada en ${gridStaticId}`);
                    return false;
                }
            } else {
                // Convertir rowIndex a índice interno (rowIndex - 1)
                const internalIndex = rowIndex - 1;

                // Obtener todas las filas del modelo, no solo las seleccionadas
                const allRecords = [];
                grid.model.forEach(function (record) {
                    allRecords.push(record);
                });

                if (allRecords.length > internalIndex && internalIndex >= 0) {
                    targetRow = allRecords[internalIndex];
                } else {
                    console.warn(`invUtils: Fila ${rowIndex} fuera de rango en ${gridStaticId} (total filas: ${allRecords.length})`);
                    return false;
                }
            }

            if (targetRow) {
                // Formatear valor si es necesario
                let finalValue = value;

                // Validar decimalPlaces antes de usar toFixed()
                if (decimalPlaces !== null && typeof value === 'number') {
                    // Asegurar que decimalPlaces esté en el rango válido (0-100)
                    let validDecimalPlaces = decimalPlaces;

                    if (typeof validDecimalPlaces !== 'number' || isNaN(validDecimalPlaces)) {
                        validDecimalPlaces = 2; // Valor por defecto
                    } else if (validDecimalPlaces < 0) {
                        validDecimalPlaces = 0; // Mínimo 0
                    } else if (validDecimalPlaces > 100) {
                        validDecimalPlaces = 100; // Máximo 100
                    }

                    finalValue = parseFloat(value.toFixed(validDecimalPlaces));
                }

                // Establecer el valor en el modelo
                grid.model.setValue(targetRow, columnName, finalValue);

                // Forzar la actualización del modelo para confirmar el cambio
                try {
                    // Usar el método correcto para Interactive Grids de APEX
                    if (grid.model && grid.model.markDirty) {
                        grid.model.markDirty(targetRow);
                    }

                    // Alternativa: forzar actualización del registro
                    if (grid.model && grid.model.updateRecord) {
                        grid.model.updateRecord(targetRow);
                    }
                } catch (commitError) {
                    console.warn('invUtils: No se pudo confirmar el cambio del modelo:', commitError);
                }

                // Refrescar la vista si está habilitado
                if (refresh) {
                    try {
                        // Método correcto para Interactive Grids de APEX
                        grid.view$.trigger('refresh');
                        //console.log(`invUtils: Vista refrescada usando grid.view$.trigger('refresh')`);
                    } catch (e) {
                        console.warn('invUtils: No se pudo refrescar la vista:', e);
                    }
                }

                //console.log(`invUtils: Valor ${finalValue} establecido en ${columnName}, fila ${rowIndex === -1 ? 'seleccionada' : rowIndex} con commit`);
                return true;
            }

            return false;

        } catch (error) {
            console.error('invUtils asignarNumeroMarcado error:', error);
            return false;
        }
    }

    /**
     * Setear valor numérico con commit en la fila seleccionada
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {number} value - Valor a establecer
     * @param {number} decimalPlaces - Número de decimales para formatear (default: null = sin formatear)
     * @param {boolean} refresh - Si debe refrescar la vista (default: true)
     * @returns {boolean} - true si se estableció correctamente
     */
    function asignarNumeroSeleccionadoMarcado(gridStaticId, columnName, value, decimalPlaces = null, refresh = true) {
        return asignarNumeroMarcado(gridStaticId, columnName, -1, value, decimalPlaces, refresh);
    }

    /**
     * Setear valor numérico con commit en la primera fila
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {number} value - Valor a establecer
     * @param {number} decimalPlaces - Número de decimales para formatear (default: null = sin formatear)
     * @param {boolean} refresh - Si debe refrescar la vista (default: true)
     * @returns {boolean} - true si se estableció correctamente
     */
    function asignarPrimerNumeroMarcado(gridStaticId, columnName, value, decimalPlaces = null, refresh = true) {
        return asignarNumeroMarcado(gridStaticId, columnName, 1, value, decimalPlaces, refresh);
    }

    /**
     * Setear valor numérico con manejo robusto de formato y persistencia
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {number} rowIndex - Índice de la fila (1 = primera fila, -1 = fila seleccionada)
     * @param {number} value - Valor a establecer
     * @param {number} decimalPlaces - Número de decimales para formatear (default: null = sin formatear)
     * @param {boolean} refresh - Si debe refrescar la vista (default: true)
     * @returns {boolean} - true si se estableció correctamente
     */
    function asignarNumeroSinFormato(gridStaticId, columnName, rowIndex, value, decimalPlaces = null, refresh = true) {
        try {
            console.log(`🔧 invUtils: Seteando valor robusto ${value} en ${columnName}, fila ${rowIndex}`);

            // Obtener el grid
            const grid = apex.region(gridStaticId).call("getViews").grid;
            const model = grid.model;

            let targetRow = null;

            // Obtener fila objetivo
            if (rowIndex === -1) {
                const array = grid.getSelectedRecords();
                if (array && array.length > 0) {
                    targetRow = array[0][1];
                } else {
                    console.warn(`invUtils: No hay fila seleccionada en ${gridStaticId}`);
                    return false;
                }
            } else {
                const allRecords = [];
                model.forEach(function (record) {
                    allRecords.push(record);
                });

                if (allRecords.length >= rowIndex && rowIndex > 0) {
                    targetRow = allRecords[rowIndex - 1];
                } else {
                    console.warn(`invUtils: Fila ${rowIndex} fuera de rango en ${gridStaticId} (total filas: ${allRecords.length})`);
                    return false;
                }
            }

            if (!targetRow) {
                console.error(`invUtils: No se pudo obtener fila objetivo`);
                return false;
            }

            // Obtener valor actual para comparar
            const currentValue = model.getValue(targetRow, columnName);
            console.log(`📊 invUtils: Valor actual en ${columnName}: ${currentValue} (tipo: ${typeof currentValue})`);

            // Formatear valor si es necesario - MANEJAR FORMATO EUROPEO
            let finalValue = value;
            if (decimalPlaces !== null && typeof value === 'number') {
                let validDecimalPlaces = decimalPlaces;

                if (typeof validDecimalPlaces !== 'number' || isNaN(validDecimalPlaces)) {
                    validDecimalPlaces = 2;
                } else if (validDecimalPlaces < 0) {
                    validDecimalPlaces = 0;
                } else if (validDecimalPlaces > 100) {
                    validDecimalPlaces = 100;
                }

                // Formatear como número con decimales exactos
                finalValue = parseFloat(value.toFixed(validDecimalPlaces));
            }

            console.log(`📊 invUtils: Valor final a establecer: ${finalValue} (tipo: ${typeof finalValue})`);

            // Deshabilitar temporalmente los formateadores
            try {
                // Intentar deshabilitar formateadores si existen
                if (model.setOption) {
                    model.setOption('disableFormatting', true);
                }
            } catch (e) {
                console.warn('invUtils: No se pudo deshabilitar formateadores:', e);
            }

            // Establecer el valor como número puro (sin formato)
            model.setValue(targetRow, columnName, finalValue);

            // Verificar que se estableció correctamente
            const verifyValue = model.getValue(targetRow, columnName);
            console.log(`📊 invUtils: Valor después de setear: ${verifyValue} (tipo: ${typeof verifyValue})`);

            // Forzar persistencia del cambio
            try {
                // Marcar como modificado
                if (model.markDirty) {
                    model.markDirty(targetRow);
                }

                // Commit del registro
                if (model.commitRecord) {
                    model.commitRecord(targetRow);
                }

                // Commit del modelo completo
                if (model.commit) {
                    model.commit();
                }

                console.log(`✅ invUtils: Cambio persistido correctamente`);

            } catch (commitError) {
                console.warn('invUtils: Error al hacer commit:', commitError);
            }

            // Rehabilitar formateadores
            try {
                if (model.setOption) {
                    model.setOption('disableFormatting', false);
                }
            } catch (e) {
                console.warn('invUtils: No se pudo rehabilitar formateadores:', e);
            }

            // Refrescar vista si es necesario
            if (refresh) {
                try {
                    // Refrescar la vista del grid
                    grid.view$.trigger('refresh');

                    // Alternativa: refrescar la región completa
                    setTimeout(() => {
                        try {
                            apex.region(gridStaticId).refresh();
                        } catch (e) {
                            console.warn('invUtils: No se pudo refrescar región:', e);
                        }
                    }, 100);

                    console.log(`🔄 invUtils: Vista refrescada`);

                } catch (refreshError) {
                    console.warn('invUtils: Error al refrescar vista:', refreshError);
                }
            }

            // Verificación final
            setTimeout(() => {
                const finalCheckValue = model.getValue(targetRow, columnName);
                console.log(`📊 invUtils: Verificación final - ${columnName}: ${finalCheckValue} (tipo: ${typeof finalCheckValue})`);

                // Comparar valores normalizados para evitar problemas de formato
                const normalizedExpected = typeof finalValue === 'number' ? finalValue : parseFloat(String(finalValue).replace(',', '.'));
                const normalizedActual = typeof finalCheckValue === 'number' ? finalCheckValue : parseFloat(String(finalCheckValue).replace(',', '.'));

                if (Math.abs(normalizedExpected - normalizedActual) > 0.001) {
                    console.warn(`⚠️ invUtils: Valor no se mantuvo - Esperado: ${finalValue}, Actual: ${finalCheckValue}`);
                } else {
                    console.log(`✅ invUtils: Valor se mantuvo correctamente`);
                }
            }, 200);

            return true;

        } catch (error) {
            console.error('invUtils asignarNumeroSinFormato error:', error);
            return false;
        }
    }

    /**
     * Setear valor numérico robusto en la fila seleccionada
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {number} value - Valor a establecer
     * @param {number} decimalPlaces - Número de decimales para formatear (default: null = sin formatear)
     * @param {boolean} refresh - Si debe refrescar la vista (default: true)
     * @returns {boolean} - true si se estableció correctamente
     */
    function asignarNumeroSeleccionadoSinFormato(gridStaticId, columnName, value, decimalPlaces = null, refresh = true) {
        return asignarNumeroSinFormato(gridStaticId, columnName, -1, value, decimalPlaces, refresh);
    }

    /**
     * Setear valor numérico robusto en la primera fila
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {number} value - Valor a establecer
     * @param {number} decimalPlaces - Número de decimales para formatear (default: null = sin formatear)
     * @param {boolean} refresh - Si debe refrescar la vista (default: true)
     * @returns {boolean} - true si se estableció correctamente
     */
    function asignarPrimerNumeroSinFormato(gridStaticId, columnName, value, decimalPlaces = null, refresh = true) {
        return asignarNumeroSinFormato(gridStaticId, columnName, 1, value, decimalPlaces, refresh);
    }

    /**
     * Setear valor numérico con formato europeo (7960,462)
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {number} rowIndex - Índice de la fila (1 = primera fila, -1 = fila seleccionada)
     * @param {number} value - Valor a establecer
     * @param {number} decimalPlaces - Número de decimales para formatear (default: 2)
     * @param {boolean} refresh - Si debe refrescar la vista (default: true)
     * @returns {boolean} - true si se estableció correctamente
     */
    function asignarNumeroEuropeo(gridStaticId, columnName, rowIndex, value, decimalPlaces = 2, refresh = true) {
        try {
            console.log(`🇪🇺 invUtils: Seteando valor europeo ${value} en ${columnName}, fila ${rowIndex}`);

            // Obtener el grid
            const grid = apex.region(gridStaticId).call("getViews").grid;
            const model = grid.model;

            let targetRow = null;

            // Obtener fila objetivo
            if (rowIndex === -1) {
                const array = grid.getSelectedRecords();
                if (array && array.length > 0) {
                    targetRow = array[0][1];
                } else {
                    console.warn(`invUtils: No hay fila seleccionada en ${gridStaticId}`);
                    return false;
                }
            } else {
                const allRecords = [];
                model.forEach(function (record) {
                    allRecords.push(record);
                });

                if (allRecords.length >= rowIndex && rowIndex > 0) {
                    targetRow = allRecords[rowIndex - 1];
                } else {
                    console.warn(`invUtils: Fila ${rowIndex} fuera de rango en ${gridStaticId} (total filas: ${allRecords.length})`);
                    return false;
                }
            }

            if (!targetRow) {
                console.error(`invUtils: No se pudo obtener fila objetivo`);
                return false;
            }

            // Obtener valor actual para comparar
            const currentValue = model.getValue(targetRow, columnName);
            console.log(`📊 invUtils: Valor actual en ${columnName}: ${currentValue} (tipo: ${typeof currentValue})`);

            // Formatear valor al formato europeo
            const europeanValue = formatearNumeroEuropeo(value, decimalPlaces, true);
            console.log(`🇪🇺 invUtils: Valor formateado europeo: ${europeanValue}`);

            // Establecer el valor como string formateado
            model.setValue(targetRow, columnName, europeanValue);

            // Verificar que se estableció correctamente
            const verifyValue = model.getValue(targetRow, columnName);
            console.log(`📊 invUtils: Valor después de setear: ${verifyValue} (tipo: ${typeof verifyValue})`);

            // Forzar persistencia del cambio
            try {
                // Marcar como modificado
                if (model.markDirty) {
                    model.markDirty(targetRow);
                }

                // Commit del registro
                if (model.commitRecord) {
                    model.commitRecord(targetRow);
                }

                console.log(`✅ invUtils: Cambio persistido correctamente`);

            } catch (commitError) {
                console.warn('invUtils: Error al hacer commit:', commitError);
            }

            // Refrescar vista si es necesario
            if (refresh) {
                try {
                    // Refrescar la vista del grid
                    grid.view$.trigger('refresh');

                    // Alternativa: refrescar la región completa
                    setTimeout(() => {
                        try {
                            apex.region(gridStaticId).refresh();
                        } catch (e) {
                            console.warn('invUtils: No se pudo refrescar región:', e);
                        }
                    }, 100);

                    console.log(`🔄 invUtils: Vista refrescada`);

                } catch (refreshError) {
                    console.warn('invUtils: Error al refrescar vista:', refreshError);
                }
            }

            // Verificación final
            setTimeout(() => {
                const finalCheckValue = model.getValue(targetRow, columnName);
                console.log(`📊 invUtils: Verificación final - ${columnName}: ${finalCheckValue} (tipo: ${typeof finalCheckValue})`);

                if (finalCheckValue === europeanValue) {
                    console.log(`✅ invUtils: Valor europeo se mantuvo correctamente`);
                } else {
                    console.warn(`⚠️ invUtils: Valor europeo no se mantuvo - Esperado: ${europeanValue}, Actual: ${finalCheckValue}`);
                }
            }, 200);

            return true;

        } catch (error) {
            console.error('invUtils asignarNumeroEuropeo error:', error);
            return false;
        }
    }

    /**
     * Setear valor numérico con formato europeo en la fila seleccionada
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {number} value - Valor a establecer
     * @param {number} decimalPlaces - Número de decimales para formatear (default: 2)
     * @param {boolean} refresh - Si debe refrescar la vista (default: true)
     * @returns {boolean} - true si se estableció correctamente
     */
    function asignarNumeroSeleccionadoEuropeo(gridStaticId, columnName, value, decimalPlaces = 2, refresh = true) {
        return asignarNumeroEuropeo(gridStaticId, columnName, -1, value, decimalPlaces, refresh);
    }

    /**
     * Setear valor numérico con formato europeo en la primera fila
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {number} value - Valor a establecer
     * @param {number} decimalPlaces - Número de decimales para formatear (default: 2)
     * @param {boolean} refresh - Si debe refrescar la vista (default: true)
     * @returns {boolean} - true si se estableció correctamente
     */
    function asignarPrimerNumeroEuropeo(gridStaticId, columnName, value, decimalPlaces = 2, refresh = true) {
        return asignarNumeroEuropeo(gridStaticId, columnName, 1, value, decimalPlaces, refresh);
    }

    /**
     * Setear valor en una celda específica del Interactive Grid con estado dirty
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {number} rowIndex - Índice de la fila (1 = primera fila, -1 = fila seleccionada)
     * @param {any} value - Valor a establecer
     * @param {boolean} refresh - Si debe refrescar la vista (default: true)
     * @param {boolean} forceDirty - Si debe forzar el estado dirty (default: true)
     * @returns {boolean} - true si se estableció correctamente
     */
    function asignarCeldaMarcada(gridStaticId, columnName, rowIndex, value, refresh = true, forceDirty = true) {
        try {
            console.log(`🔧 invUtils: Seteando valor con dirty ${value} en ${columnName}, fila ${rowIndex}`);

            // Obtener el grid usando el método que funciona
            const grid = apex.region(gridStaticId).call("getViews").grid;
            const model = grid.model;

            let targetRow = null;

            // Si rowIndex es -1, usar la fila seleccionada
            if (rowIndex === -1) {
                const array = grid.getSelectedRecords();
                if (array && array.length > 0) {
                    targetRow = array[0][1];
                } else {
                    console.warn(`invUtils: No hay fila seleccionada en ${gridStaticId}`);
                    return false;
                }
            } else {
                // Convertir rowIndex a índice interno (rowIndex - 1)
                const internalIndex = rowIndex - 1;

                // Obtener todas las filas del modelo, no solo las seleccionadas
                const allRecords = [];
                model.forEach(function (record) {
                    allRecords.push(record);
                });

                if (allRecords.length > internalIndex && internalIndex >= 0) {
                    targetRow = allRecords[internalIndex];
                } else {
                    console.warn(`invUtils: Fila ${rowIndex} fuera de rango en ${gridStaticId} (total filas: ${allRecords.length})`);
                    return false;
                }
            }

            if (targetRow) {
                // Obtener valor actual para comparar
                const currentValue = model.getValue(targetRow, columnName);
                console.log(`📊 invUtils: Valor actual en ${columnName}: ${currentValue}`);

                // Establecer el valor en el modelo
                model.setValue(targetRow, columnName, value);
                console.log(`📊 invUtils: Valor establecido: ${value}`);

                // Forzar estado dirty si está habilitado
                if (forceDirty) {
                    console.log(`🔄 invUtils: Forzando estado dirty...`);

                    // Usar la función mejorada para forzar dirty state
                    const dirtySuccess = marcarRegistro(model, targetRow, columnName);

                    if (dirtySuccess) {
                        console.log(`✅ invUtils: Estado dirty forzado exitosamente`);
                    } else {
                        console.warn(`⚠️ invUtils: No se pudo forzar estado dirty`);
                    }
                }

                // Refrescar la vista si está habilitado
                if (refresh) {
                    try {
                        // Método correcto para Interactive Grids de APEX
                        grid.view$.trigger('refresh');
                        console.log(`✅ invUtils: Vista refrescada`);
                    } catch (e) {
                        console.warn('invUtils: No se pudo refrescar la vista:', e);
                    }
                }

                // Verificación final
                setTimeout(() => {
                    const finalValue = model.getValue(targetRow, columnName);
                    console.log(`📊 invUtils: Verificación final - ${columnName}: ${finalValue}`);

                    // Verificar si el registro está marcado como dirty usando múltiples métodos
                    let isDirty = false;

                    try {
                        // Método 1: Usar isDirty del modelo
                        if (model.isDirty && model.isDirty(targetRow)) {
                            isDirty = true;
                            console.log(`✅ invUtils: Registro confirmado como dirty usando model.isDirty()`);
                        }
                    } catch (e) {
                        console.warn(`invUtils: Error con model.isDirty:`, e);
                    }

                    try {
                        // Método 2: Usar isDirty del registro
                        if (targetRow.isDirty && targetRow.isDirty()) {
                            isDirty = true;
                            console.log(`✅ invUtils: Registro confirmado como dirty usando record.isDirty()`);
                        }
                    } catch (e) {
                        console.warn(`invUtils: Error con record.isDirty:`, e);
                    }

                    try {
                        // Método 3: Verificar si el registro tiene propiedades de modificación
                        if (targetRow.isModified && targetRow.isModified()) {
                            isDirty = true;
                            console.log(`✅ invUtils: Registro confirmado como modified usando isModified()`);
                        }
                    } catch (e) {
                        console.warn(`invUtils: Error con isModified:`, e);
                    }

                    try {
                        // Método 4: Verificar si el registro tiene estado de cambio
                        if (targetRow.hasChanges && targetRow.hasChanges()) {
                            isDirty = true;
                            console.log(`✅ invUtils: Registro confirmado como changed usando hasChanges()`);
                        }
                    } catch (e) {
                        console.warn(`invUtils: Error con hasChanges:`, e);
                    }

                    if (!isDirty) {
                        console.warn(`⚠️ invUtils: Registro no está marcado como dirty - intentando forzar...`);

                        // Intentar forzar dirty state una vez más
                        try {
                            if (model.setDirty) {
                                model.setDirty(targetRow, true);
                                console.log(`🔄 invUtils: Dirty state forzado nuevamente usando setDirty()`);
                            }
                        } catch (e) {
                            console.warn(`invUtils: Error al forzar dirty state:`, e);
                        }

                        try {
                            if (model.markDirty) {
                                model.markDirty(targetRow);
                                console.log(`🔄 invUtils: Dirty state forzado nuevamente usando markDirty()`);
                            }
                        } catch (e) {
                            console.warn(`invUtils: Error al forzar dirty state:`, e);
                        }
                    } else {
                        console.log(`✅ invUtils: Estado dirty confirmado correctamente`);
                    }
                }, 100);

                return true;
            }

            return false;

        } catch (error) {
            console.error('invUtils asignarCeldaMarcada error:', error);
            return false;
        }
    }

    /**
     * Setear valor en la fila seleccionada con estado dirty
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {any} value - Valor a establecer
     * @param {boolean} refresh - Si debe refrescar la vista (default: true)
     * @param {boolean} forceDirty - Si debe forzar el estado dirty (default: true)
     * @returns {boolean} - true si se estableció correctamente
     */
    function asignarCeldaSeleccionadaMarcada(gridStaticId, columnName, value, refresh = true, forceDirty = true) {
        return asignarCeldaMarcada(gridStaticId, columnName, -1, value, refresh, forceDirty);
    }

    /**
     * Setear valor en la primera fila con estado dirty
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {any} value - Valor a establecer
     * @param {boolean} refresh - Si debe refrescar la vista (default: true)
     * @param {boolean} forceDirty - Si debe forzar el estado dirty (default: true)
     * @returns {boolean} - true si se estableció correctamente
     */
    function asignarPrimeraCeldaMarcada(gridStaticId, columnName, value, refresh = true, forceDirty = true) {
        return asignarCeldaMarcada(gridStaticId, columnName, 1, value, refresh, forceDirty);
    }

    /**
     * Setear valor con espera de estabilización y confirmación automática
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {number} rowIndex - Índice de la fila (1 = primera fila, -1 = fila seleccionada)
     * @param {any} value - Valor a establecer
     * @param {number} maxAttempts - Máximo número de intentos (default: 5)
     * @param {number} delayBetweenAttempts - Delay entre intentos en ms (default: 200)
     * @returns {Promise<boolean>} - Promise que resuelve a true si se estableció correctamente
     */
    function asignarCeldaVerificada(gridStaticId, columnName, rowIndex, value, maxAttempts = 5, delayBetweenAttempts = 200) {
        return new Promise((resolve) => {
            try {
                console.log(`🔄 invUtils: Iniciando seteo con estabilización - ${value} en ${columnName}, fila ${rowIndex}`);

                const grid = apex.region(gridStaticId).call("getViews").grid;
                const model = grid.model;

                let targetRow = null;

                // Obtener fila objetivo
                if (rowIndex === -1) {
                    const array = grid.getSelectedRecords();
                    if (array && array.length > 0) {
                        targetRow = array[0][1];
                    } else {
                        console.warn(`invUtils: No hay fila seleccionada en ${gridStaticId}`);
                        resolve(false);
                        return;
                    }
                } else {
                    const allRecords = [];
                    model.forEach(function (record) {
                        allRecords.push(record);
                    });

                    if (allRecords.length >= rowIndex && rowIndex > 0) {
                        targetRow = allRecords[rowIndex - 1];
                    } else {
                        console.warn(`invUtils: Fila ${rowIndex} fuera de rango en ${gridStaticId}`);
                        resolve(false);
                        return;
                    }
                }

                if (!targetRow) {
                    console.error(`invUtils: No se pudo obtener fila objetivo`);
                    resolve(false);
                    return;
                }

                let attempts = 0;
                let lastValue = null;

                function intentarAsignacion() {
                    attempts++;
                    console.log(`🔄 invUtils: Intento ${attempts}/${maxAttempts} - Estableciendo valor ${value}`);

                    // Obtener valor actual
                    const currentValue = model.getValue(targetRow, columnName);
                    console.log(`📊 invUtils: Valor actual: ${currentValue}, Valor objetivo: ${value}`);

                    // Establecer el valor
                    model.setValue(targetRow, columnName, value);

                    // Forzar dirty state
                    marcarRegistro(model, targetRow, columnName);

                    // Esperar un poco y verificar si el valor se mantuvo
                    setTimeout(() => {
                        const verifyValue = model.getValue(targetRow, columnName);
                        console.log(`📊 invUtils: Valor después de seteo: ${verifyValue}`);

                        // Verificar si el valor se estabilizó
                        if (verifyValue === value || verifyValue === lastValue) {
                            console.log(`✅ invUtils: Valor estabilizado en ${verifyValue}`);

                            // Confirmar cambios
                            confirmarCambios(gridStaticId, true, true);

                            // Refrescar vista
                            try {
                                grid.view$.trigger('refresh');
                                console.log(`✅ invUtils: Vista refrescada`);
                            } catch (e) {
                                console.warn(`invUtils: Error al refrescar vista:`, e);
                            }

                            resolve(true);
                        } else {
                            lastValue = verifyValue;

                            if (attempts < maxAttempts) {
                                console.log(`🔄 invUtils: Valor no estabilizado, reintentando...`);
                                setTimeout(intentarAsignacion, delayBetweenAttempts);
                            } else {
                                console.warn(`⚠️ invUtils: No se pudo estabilizar el valor después de ${maxAttempts} intentos`);

                                // Intentar una última vez con un enfoque diferente
                                try {
                                    // Forzar el valor usando setValue con opciones
                                    if (model.setValue && model.setValue.length > 3) {
                                        model.setValue(targetRow, columnName, value, {
                                            dirty: true,
                                            silent: false,
                                            validate: false
                                        });
                                    } else {
                                        model.setValue(targetRow, columnName, value);
                                    }

                                    // Forzar dirty state nuevamente
                                    marcarRegistro(model, targetRow, columnName);

                                    // Confirmar cambios
                                    confirmarCambios(gridStaticId, true, true);

                                    console.log(`✅ invUtils: Último intento completado`);
                                    resolve(true);
                                } catch (finalError) {
                                    console.error(`invUtils: Error en último intento:`, finalError);
                                    resolve(false);
                                }
                            }
                        }
                    }, delayBetweenAttempts);
                }

                // Iniciar el proceso
                intentarAsignacion();

            } catch (error) {
                console.error('invUtils asignarCeldaVerificada error:', error);
                resolve(false);
            }
        });
    }

    /**
     * Setear valor con estabilización en la fila seleccionada
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {any} value - Valor a establecer
     * @param {number} maxAttempts - Máximo número de intentos (default: 5)
     * @param {number} delayBetweenAttempts - Delay entre intentos en ms (default: 200)
     * @returns {Promise<boolean>} - Promise que resuelve a true si se estableció correctamente
     */
    function asignarCeldaSeleccionadaVerificada(gridStaticId, columnName, value, maxAttempts = 5, delayBetweenAttempts = 200) {
        return asignarCeldaVerificada(gridStaticId, columnName, -1, value, maxAttempts, delayBetweenAttempts);
    }

    /**
     * Setear valor con estabilización en la primera fila
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {any} value - Valor a establecer
     * @param {number} maxAttempts - Máximo número de intentos (default: 5)
     * @param {number} delayBetweenAttempts - Delay entre intentos en ms (default: 200)
     * @returns {Promise<boolean>} - Promise que resuelve a true si se estableció correctamente
     */
    function asignarPrimeraCeldaVerificada(gridStaticId, columnName, value, maxAttempts = 5, delayBetweenAttempts = 200) {
        return asignarCeldaVerificada(gridStaticId, columnName, 1, value, maxAttempts, delayBetweenAttempts);
    }

    /**
     * Simular interacción del usuario para activar el grid
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {number} rowIndex - Índice de la fila (1 = primera fila, -1 = fila seleccionada)
     * @returns {boolean} - true si se activó correctamente
     */
    function simularInteraccionUsuario(gridStaticId, columnName, rowIndex = -1) {
        try {
            console.log(`🎯 invUtils: Simulando interacción del usuario en ${gridStaticId}`);

            const grid = apex.region(gridStaticId).call("getViews").grid;
            const model = grid.model;

            let targetRow = null;

            // Obtener fila objetivo
            if (rowIndex === -1) {
                const array = grid.getSelectedRecords();
                if (array && array.length > 0) {
                    targetRow = array[0][1];
                } else {
                    console.warn(`invUtils: No hay fila seleccionada en ${gridStaticId}`);
                    return false;
                }
            } else {
                const allRecords = [];
                model.forEach(function (record) {
                    allRecords.push(record);
                });

                if (allRecords.length >= rowIndex && rowIndex > 0) {
                    targetRow = allRecords[rowIndex - 1];
                } else {
                    console.warn(`invUtils: Fila ${rowIndex} fuera de rango en ${gridStaticId}`);
                    return false;
                }
            }

            if (!targetRow) {
                console.error(`invUtils: No se pudo obtener fila objetivo`);
                return false;
            }

            // Método 1: Navegar a la celda
            try {
            grid.gotoCell(targetRow, columnName);
                console.log(`✅ invUtils: Navegación a celda simulada`);
            } catch (e) {
                console.warn(`invUtils: Error en navegación:`, e);
            }

            // Método 2: Simular focus en la celda
            try {
                const cellElement = grid.getCellElement ? grid.getCellElement(targetRow, columnName) : null;
                if (cellElement && cellElement.length > 0) {
                    cellElement.focus();
                    console.log(`✅ invUtils: Focus en celda simulado`);
                }
            } catch (e) {
                console.warn(`invUtils: Error en focus:`, e);
            }

            // Método 3: Simular click en la celda
            try {
                const cellElement = grid.getCellElement ? grid.getCellElement(targetRow, columnName) : null;
                if (cellElement && cellElement.length > 0) {
                    cellElement.trigger('click');
                    console.log(`✅ invUtils: Click en celda simulado`);
                }
            } catch (e) {
                console.warn(`invUtils: Error en click:`, e);
            }

            // Método 4: Activar modo edición
            try {
                if (grid.setEditMode) {
                    grid.setEditMode(true);
                    console.log(`✅ invUtils: Modo edición activado`);
                }
            } catch (e) {
                console.warn(`invUtils: Error en modo edición:`, e);
            }

            // Método 5: Forzar activación del registro
            try {
                if (grid.setActiveRecord) {
                    grid.setActiveRecord(targetRow);
                    console.log(`✅ invUtils: Registro activado`);
                }
            } catch (e) {
                console.warn(`invUtils: Error en activación de registro:`, e);
            }

            return true;

        } catch (error) {
            console.error('invUtils simularInteraccionUsuario error:', error);
            return false;
        }
    }

    /**
     * Setear valor con activación previa del grid
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {number} rowIndex - Índice de la fila (1 = primera fila, -1 = fila seleccionada)
     * @param {any} value - Valor a establecer
     * @param {boolean} simulateInteraction - Si debe simular interacción del usuario (default: true)
     * @returns {boolean} - true si se estableció correctamente
     */
    function asignarCeldaActivada(gridStaticId, columnName, rowIndex, value, simulateInteraction = true) {
        try {
            console.log(`🎯 invUtils: Seteando valor con activación - ${value} en ${columnName}, fila ${rowIndex}`);

            // Simular interacción del usuario primero
            if (simulateInteraction) {
                simularInteraccionUsuario(gridStaticId, columnName, rowIndex);

                // Esperar un poco para que la interacción se procese
                setTimeout(() => {
                    // Ahora establecer el valor
                    asignarCeldaMarcada(gridStaticId, columnName, rowIndex, value, true, true);

                    // Confirmar cambios después de un delay adicional
                    setTimeout(() => {
                        confirmarCambios(gridStaticId, true, true);
                        console.log(`✅ invUtils: Valor establecido con activación completado`);
                    }, 100);
                }, 200);
            } else {
                // Establecer valor directamente
                asignarCeldaMarcada(gridStaticId, columnName, rowIndex, value, true, true);
                confirmarCambios(gridStaticId, true, true);
            }

            return true;

        } catch (error) {
            console.error('invUtils asignarCeldaActivada error:', error);
            return false;
        }
    }

    /**
     * Setear valor con activación en la fila seleccionada
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {any} value - Valor a establecer
     * @param {boolean} simulateInteraction - Si debe simular interacción del usuario (default: true)
     * @returns {boolean} - true si se estableció correctamente
     */
    function asignarCeldaSeleccionadaActivada(gridStaticId, columnName, value, simulateInteraction = true) {
        return asignarCeldaActivada(gridStaticId, columnName, -1, value, simulateInteraction);
    }

    /**
     * Setear valor con activación en la primera fila
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {any} value - Valor a establecer
     * @param {boolean} simulateInteraction - Si debe simular interacción del usuario (default: true)
     * @returns {boolean} - true si se estableció correctamente
     */
    function asignarPrimeraCeldaActivada(gridStaticId, columnName, value, simulateInteraction = true) {
        return asignarCeldaActivada(gridStaticId, columnName, 1, value, simulateInteraction);
    }

    /**
     * Setear valor en una celda con manejo robusto para evitar que APEX lo revierta
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {number} rowIndex - Índice de la fila (1 = primera fila, -1 = fila seleccionada)
     * @param {any} value - Valor a establecer
     * @param {boolean} refresh - Si debe refrescar la vista (default: true)
     * @param {number} maxRetries - Máximo número de reintentos (default: 3)
     * @returns {Promise<boolean>} - Promise que resuelve a true si se estableció correctamente
     */
    function asignarCeldaPausandoEventos(gridStaticId, columnName, rowIndex, value, refresh = true, maxRetries = 3) {
        return new Promise((resolve) => {
            try {
                console.log(`🛡️ invUtils: Seteando valor robusto ${value} en ${columnName}, fila ${rowIndex}`);

                const grid = apex.region(gridStaticId).call("getViews").grid;
                const model = grid.model;

                let targetRecord = null;

                // Obtener registro objetivo
                if (rowIndex === -1) {
                    const selectedRecords = apex.region(gridStaticId).widget().interactiveGrid("getCurrentView").getSelectedRecords();
                    if (selectedRecords && selectedRecords.length > 0) {
                        targetRecord = selectedRecords[0];
                    } else {
                        console.warn(`invUtils: No hay registro seleccionado en ${gridStaticId}`);
                        resolve(false);
                        return;
                    }
                } else {
                    const allRecords = [];
                    model.forEach(function (record) {
                        allRecords.push(record);
                    });

                    if (allRecords.length >= rowIndex && rowIndex > 0) {
                        targetRecord = allRecords[rowIndex - 1];
                    } else {
                        console.warn(`invUtils: Fila ${rowIndex} fuera de rango en ${gridStaticId}`);
                        resolve(false);
                        return;
                    }
                }

                if (!targetRecord) {
                    console.error(`invUtils: No se pudo obtener registro objetivo`);
                    resolve(false);
                    return;
                }

                let attempts = 0;
                let lastValue = null;

                function intentarAsignacion() {
                    attempts++;
                    console.log(`🔄 invUtils: Intento ${attempts}/${maxRetries} - Estableciendo valor ${value}`);

                    try {
                        // Paso 1: Deshabilitar temporalmente los listeners de APEX
                        let originalListeners = null;
                        try {
                            if (model._listeners) {
                                originalListeners = model._listeners;
                                model._listeners = [];
                                console.log(`✅ invUtils: Listeners deshabilitados temporalmente`);
                            }
                        } catch (e) {
                            console.warn(`invUtils: No se pudieron deshabilitar listeners:`, e);
                        }

                        // Paso 2: Obtener valor actual
                        const currentValue = model.getValue(targetRecord, columnName);
                        console.log(`📊 invUtils: Valor actual: ${currentValue}, Valor objetivo: ${value}`);

                        // Paso 3: Establecer el valor usando múltiples métodos
                        let setValueSuccess = false;

                        // Método 1: setValue directo
                        try {
                            model.setValue(targetRecord, columnName, value);
                            setValueSuccess = true;
                            console.log(`✅ invUtils: Valor establecido usando setValue directo`);
                        } catch (e) {
                            console.warn(`invUtils: Error con setValue directo:`, e);
                        }

                        // Método 2: setValue con opciones si el método 1 falló
                        if (!setValueSuccess) {
                            try {
                                model.setValue(targetRecord, columnName, value, { silent: true, dirty: true });
                                setValueSuccess = true;
                                console.log(`✅ invUtils: Valor establecido usando setValue con opciones`);
                            } catch (e) {
                                console.warn(`invUtils: Error con setValue con opciones:`, e);
                            }
                        }

                        // Paso 4: Forzar estado dirty de manera agresiva
                        try {
                            // Método 1: markDirty
                            if (model.markDirty) {
                                model.markDirty(targetRecord);
                            }

                            // Método 2: setDirty en registro
                            if (targetRecord.setDirty) {
                                targetRecord.setDirty(true);
                            }

                            // Método 3: Simular cambio manual
                            const tempValue = model.getValue(targetRecord, columnName);
                            if (tempValue !== value) {
                                model.setValue(targetRecord, columnName, value);
                            }

                            console.log(`✅ invUtils: Estado dirty forzado`);
                        } catch (e) {
                            console.warn(`invUtils: Error al forzar dirty state:`, e);
                        }

                        // Paso 5: Restaurar listeners
                        try {
                            if (originalListeners) {
                                model._listeners = originalListeners;
                                console.log(`✅ invUtils: Listeners restaurados`);
                            }
                        } catch (e) {
                            console.warn(`invUtils: Error al restaurar listeners:`, e);
                        }

                        // Paso 6: Commit inmediato
                        try {
                            if (model.commitRecord) {
                                model.commitRecord(targetRecord);
                            }
                            if (model.commit) {
                                model.commit();
                            }
                            console.log(`✅ invUtils: Commit ejecutado`);
                        } catch (e) {
                            console.warn(`invUtils: Error en commit:`, e);
                        }

                        // Paso 7: Verificar si el valor se mantuvo
                        setTimeout(() => {
                            const verifyValue = model.getValue(targetRecord, columnName);
                            console.log(`📊 invUtils: Valor después de seteo: ${verifyValue}`);

                            // Verificar si el valor se estabilizó
                            if (verifyValue === value || verifyValue === lastValue) {
                                console.log(`✅ invUtils: Valor estabilizado en ${verifyValue}`);

                                // Refrescar vista si está habilitado
                                if (refresh) {
                                    try {
                                        if (grid.view$ && grid.view$.trigger) {
                                            grid.view$.trigger('refresh');
                                            console.log(`✅ invUtils: Vista refrescada`);
                                        }
                                    } catch (e) {
                                        console.warn(`invUtils: Error al refrescar vista:`, e);
                                    }
                                }

                                resolve(true);
                            } else {
                                console.warn(`⚠️ invUtils: Valor cambió a ${verifyValue}, intentando de nuevo...`);
                                lastValue = verifyValue;

                                if (attempts < maxRetries) {
                                    setTimeout(intentarAsignacion, 200);
                                } else {
                                    console.error(`❌ invUtils: No se pudo estabilizar el valor después de ${maxRetries} intentos`);
                                    resolve(false);
                                }
                            }
                        }, 100);

                    } catch (error) {
                        console.error(`invUtils: Error en intento ${attempts}:`, error);

                        if (attempts < maxRetries) {
                            setTimeout(intentarAsignacion, 200);
                        } else {
                            resolve(false);
                        }
                    }
                }

                // Iniciar el proceso
                intentarAsignacion();

            } catch (error) {
                console.error('invUtils asignarCeldaPausandoEventos error:', error);
                resolve(false);
            }
        });
    }

    /**
     * Setear valor robusto en la fila seleccionada
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {any} value - Valor a establecer
     * @param {boolean} refresh - Si debe refrescar la vista (default: true)
     * @param {number} maxRetries - Máximo número de reintentos (default: 3)
     * @returns {Promise<boolean>} - Promise que resuelve a true si se estableció correctamente
     */
    function asignarCeldaSeleccionadaPausandoEventos(gridStaticId, columnName, value, refresh = true, maxRetries = 3) {
        return asignarCeldaPausandoEventos(gridStaticId, columnName, -1, value, refresh, maxRetries);
    }

    /**
     * Setear valor robusto en la primera fila
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna
     * @param {any} value - Valor a establecer
     * @param {boolean} refresh - Si debe refrescar la vista (default: true)
     * @param {number} maxRetries - Máximo número de reintentos (default: 3)
     * @returns {Promise<boolean>} - Promise que resuelve a true si se estableció correctamente
     */
    function asignarPrimeraCeldaPausandoEventos(gridStaticId, columnName, value, refresh = true, maxRetries = 3) {
        return asignarCeldaPausandoEventos(gridStaticId, columnName, 1, value, refresh, maxRetries);
    }

    // =============================================================================
    // GRID — Selección y sincronización con ítems
    // =============================================================================

    /**
     * Escucha la selección de fila en un IG y setea el valor de una columna en un item de página.
     * @param {string} gridStaticId - Static ID del IG (ej: 'IG_ANIMALES').
     * @param {string} columnName - Nombre de la columna a extraer (ej: 'COD_ANIMAL').
     * @param {string} itemName - Nombre del item de página donde setear el valor (ej: 'P_COD_ANIMAL').
     */
    function sincronizarItemSeleccion(gridStaticId, columnName, itemName) {
        try {
            // Esperar a que el IG esté inicializado
            var region = apex.region(gridStaticId);
            if (!region || !region.widget) {
                console.error('invUtils: No se encontró la región IG con Static ID:', gridStaticId);
                return false;
            }
            var $ig = region.widget();
            // Evitar múltiples bindings
            $ig.off('interactivegridselectionchange.sincronizarItemSeleccion');
            $ig.on('interactivegridselectionchange.sincronizarItemSeleccion', function (event, ui) {
                try {
                    var view = $ig.interactiveGrid('getViews', 'grid');
                    var model = view.model;
                    var selectedRecords = ui.selectedRecords;
                    if (selectedRecords && selectedRecords.length > 0) {
                        var record = selectedRecords[0];
                        var value = model.getValue(record, columnName);
                        if (typeof $s === 'function') {
                            $s(itemName, value);
                        } else if (window.apex && apex.item && typeof apex.item(itemName).setValue === 'function') {
                            apex.item(itemName).setValue(value);
                        } else {
                            console.warn('invUtils: No se pudo setear el valor en el item de página:', itemName);
                        }
                    }
                } catch (e) {
                    console.error('invUtils: Error en sincronizarItemSeleccion (handler):', e);
                }
            });
            return true;
        } catch (error) {
            console.error('invUtils: Error en sincronizarItemSeleccion:', error);
            return false;
        }
    }

    /**
     * Escucha selección de fila y cambios en una columna específica, y setea el valor en un item de página.
     * @param {string} gridStaticId - Static ID del IG.
     * @param {string} columnName - Columna a extraer.
     * @param {string} itemName - Item de página a setear.
     */
    function sincronizarItemCambios(gridStaticId, columnName, itemName) {
        try {
            var region = apex.region(gridStaticId);
            if (!region || !region.widget) {
                console.error('invUtils: No se encontró la región IG con Static ID:', gridStaticId);
                return false;
            }
            var $ig = region.widget();
            var view = $ig.interactiveGrid('getViews', 'grid');
            var model = view.model;

            var listenerId = 'setItemOnRowOrCellChange_' + gridStaticId + '_' + columnName + '_' + itemName;

            // Limpia listeners previos
            $ig.off('interactivegridselectionchange.' + listenerId);
            model.unsubscribe && model.unsubscribe(listenerId);

            // Listener de selección de fila
            $ig.on('interactivegridselectionchange.' + listenerId, function (event, ui) {
                try {
                    var selectedRecords = ui.selectedRecords;
                    if (selectedRecords && selectedRecords.length > 0) {
                        var record = selectedRecords[0];
                        var value = model.getValue(record, columnName);
                        if (typeof $s === 'function') {
                            $s(itemName, value);
                        } else if (window.apex && apex.item && typeof apex.item(itemName).setValue === 'function') {
                            apex.item(itemName).setValue(value);
                        }
                    }
                } catch (e) {
                    console.error('invUtils: Error en sincronizarItemCambios (selection handler):', e);
                }
            });

            // Listener de cambio de celda
            model.subscribe({
                id: listenerId,
                onChange: function (type, change) {
                    if (type === 'set' && change.field === columnName) {
                        // Obtener el registro afectado
                        var value = model.getValue(change.record, columnName);
                        if (typeof $s === 'function') {
                            $s(itemName, value);
                        } else if (window.apex && apex.item && typeof apex.item(itemName).setValue === 'function') {
                            apex.item(itemName).setValue(value);
                        }
                    }
                }
            });

            return true;
        } catch (error) {
            console.error('invUtils: Error en sincronizarItemCambios:', error);
            return false;
        }
    }

    /**
     * Asigna un valor a una columna específica de la fila actualmente seleccionada en la grilla.
     * @param {string} gridStaticId - Static ID del Interactive Grid.
     * @param {string} columnName - Nombre de la columna donde asignar el valor.
     * @param {any} value - Valor a asignar.
     * @returns {boolean} - true si se asignó correctamente, false en caso contrario.
     */
    function asignarColumnaSeleccionada(gridStaticId, columnName, value) {
        try {
            // Obtener el Interactive Grid usando el método que funciona (como cargarDatos)
            var grid = apex.region(gridStaticId).call("getViews").grid;
            if (!grid) {
                console.error('invUtils: No se encontró la región IG con Static ID:', gridStaticId);
                return false;
            }

            var model = grid.model;

            // Obtener la fila seleccionada
            var selectedRecords = grid.getSelectedRecords();
            if (!selectedRecords || selectedRecords.length === 0) {
                console.warn('invUtils: No hay fila seleccionada en la grilla:', gridStaticId);
                return false;
            }

            var record = selectedRecords[0];
            model.setValue(record, columnName, value);

            console.log('invUtils: Valor asignado correctamente:', {
                grid: gridStaticId,
                column: columnName,
                value: value
            });

            return true;
        } catch (error) {
            console.error('invUtils: Error en asignarColumnaSeleccionada:', error);
            return false;
        }
    }

    /**
     * Selecciona automáticamente la primera fila de la grilla al inicializar.
     * @param {string} gridStaticId - Static ID del Interactive Grid.
     * @param {function} callback - Función opcional a ejecutar después de seleccionar la primera fila.
     * @returns {boolean} - true si se configuró correctamente, false en caso contrario.
     */
    function seleccionarFilaInicial(gridStaticId, callback) {
        try {
            // Obtener el Interactive Grid usando el método que funciona (como cargarDatos)
            var grid = apex.region(gridStaticId).call("getViews").grid;
            if (!grid) {
                console.error('invUtils: No se encontró la región IG con Static ID:', gridStaticId);
                return false;
            }

            var model = grid.model;
            var subId = 'selectFirstRowOnInit_' + gridStaticId;
            try { model.unsubscribe && model.unsubscribe(subId); } catch (e) { }

            // Función para seleccionar la primera fila
            function seleccionarPrimeraFila() {
                try {
                    var records = model.getRecords();
                    if (records && records.length > 0) {
                        var firstRecord = records[0];
                        grid.setSelectedRecords([firstRecord]);

                        console.log('invUtils: Primera fila seleccionada automáticamente en:', gridStaticId);

                        // Ejecutar callback si se proporciona
                        if (typeof callback === 'function') {
                            callback(firstRecord);
                        }

                        return true;
                    } else {
                        console.warn('invUtils: No hay registros en la grilla:', gridStaticId);
                        return false;
                    }
                } catch (e) {
                    console.error('invUtils: Error al seleccionar primera fila:', e);
                    return false;
                }
            }

            // Verificar si ya hay datos cargados
            var records = model.getRecords();
            if (records && records.length > 0) {
                // Si ya hay datos, seleccionar inmediatamente
                seleccionarPrimeraFila();
            } else {
                // Si no hay datos, esperar a que se carguen
                model.subscribe({
                    id: subId,
                    onChange: function (type, change) {
                        if (type === 'add' && model.getRecords().length === 1) {
                            // Primera vez que se agrega un registro
                            setTimeout(seleccionarPrimeraFila, 100); // Pequeño delay para asegurar que la vista esté lista
                        }
                    }
                });
            }

            return true;
        } catch (error) {
            console.error('invUtils: Error en seleccionarFilaInicial:', error);
            return false;
        }
    }

    /**
     * Sincroniza la columna de la fila seleccionada hacia un ítem de página.
     * Actualiza el ítem al cambiar la selección o el valor en la grilla.
     * @param {string} gridStaticId - Static ID del Interactive Grid.
     * @param {string} columnName - Nombre de la columna a sincronizar.
     * @param {string} itemName - Nombre del item de página a sincronizar.
     * @param {object} options - Opciones adicionales de configuración.
     * @returns {boolean} - true si se configuró correctamente, false en caso contrario.
     */
    // Función simplificada: solo sincroniza de Grid → Item (cuando seleccionas una fila)
    function sincronizarItem(gridStaticId, columnName, itemName, options) {
        try {
            options = options || {};
            var syncId = 'sync_grid_to_item_' + gridStaticId + '_' + columnName + '_' + itemName;

            // Obtener el widget del Interactive Grid y sus vistas
            var region = apex.region(gridStaticId);
            var $ig = region && region.widget ? region.widget() : null;
            if (!$ig) {
                console.error('invUtils: No se encontró la región IG con Static ID:', gridStaticId);
                return false;
            }

            var grid = $ig.interactiveGrid('getViews', 'grid');
            var model = grid && grid.model ? grid.model : null;
            if (!model) {
                console.error('invUtils: No se pudo obtener el modelo del IG:', gridStaticId);
                return false;
            }

            // Limpiar bindings previos si existen
            if (!model._apxGridSyncs) { model._apxGridSyncs = {}; }
            if (model._apxGridSyncs[syncId] && typeof model._apxGridSyncs[syncId].cleanup === 'function') {
                try { model._apxGridSyncs[syncId].cleanup(); } catch (e) { /* noop */ }
            }

            // Limpiar listeners previos
            if ($ig && $ig.off) {
                $ig.off('interactivegridselectionchange.' + syncId);
            }
            model.unsubscribe && model.unsubscribe(syncId + '_cell');

            // Función para actualizar el item con el valor de la columna
            var asignarItem = function (record) {
                try {
                    var raw = model.getValue(record, columnName);
                    // Si la columna es Popup LOV, el modelo puede devolver {v, d}
                    var value = (raw && typeof raw === 'object' && (raw.v !== undefined || raw.d !== undefined))
                        ? raw.v
                        : raw;

                    // Actualizar el item
                    if (window.apex && apex.item && typeof apex.item(itemName).setValue === 'function') {
                        try {
                            // Tercer parámetro true intenta suprimir change events (evita eco hacia Item→Grid)
                            apex.item(itemName).setValue(value, null, true);
                        } catch (e) {
                            apex.item(itemName).setValue(value);
                        }
                    } else if (typeof $s === 'function') {
                        $s(itemName, value);
                    }

                    if (options.debug) {
                        console.log('invUtils: Grid -> Item sync:', {
                            column: columnName,
                            value: value,
                            item: itemName,
                            record: record
                        });
                    }
                } catch (e) {
                    console.error('invUtils: Error actualizando item desde grid:', e);
                }
            };

            // Función para manejar cambios de selección
            var manejarCambioSeleccion = function (selectedRecords) {
                try {
                    if (selectedRecords && selectedRecords.length > 0) {
                        asignarItem(selectedRecords[0]);

                        if (options.debug) {
                            console.log('invUtils: Selección cambiada, registros:', selectedRecords.length);
                        }
                    } else if (options.debug) {
                        console.log('invUtils: No hay registros seleccionados');
                    }
                } catch (e) {
                    console.error('invUtils: Error manejando cambio de selección:', e);
                }
            };

            // Listener del evento estándar de APEX sobre el widget del IG
            if ($ig && $ig.on) {
                $ig.on('interactivegridselectionchange.' + syncId, function (event, ui) {
                    try {
                        if (options.debug) {
                            console.log('invUtils: Evento interactivegridselectionchange disparado');
                        }
                        var selectedRecords = ui && ui.selectedRecords ? ui.selectedRecords : null;
                        manejarCambioSeleccion(selectedRecords);
                    } catch (e) {
                        console.error('invUtils: Error en listener interactivegridselectionchange:', e);
                    }
                });
            }

            // Listener de cambio de celda (solo si la fila está seleccionada)
            model.subscribe({
                id: syncId + '_cell',
                onChange: function (type, change) {
                    if (type === 'set' && change.field === columnName) {
                        try {
                            // Solo actualizar el item si el registro cambiado está seleccionado
                            var selectedRecords = grid.getSelectedRecords();
                            var isSelected = selectedRecords && selectedRecords.some(function (record) {
                                return record === change.record;
                            });

                            if (isSelected) {
                                asignarItem(change.record);

                                if (options.debug) {
                                    console.log('invUtils: Celda cambiada en fila seleccionada');
                                }
                            }
                        } catch (e) {
                            console.error('invUtils: Error en listener de cambio de celda:', e);
                        }
                    }
                }
            });

            // Sincronización inicial: si hay una fila seleccionada, sincronizar el item
            setTimeout(function () {
                try {
                    var selectedRecords = grid.getSelectedRecords && grid.getSelectedRecords();
                    if (selectedRecords && selectedRecords.length > 0) {
                        asignarItem(selectedRecords[0]);

                        if (options.debug) {
                            console.log('invUtils: Sincronización inicial completada');
                        }
                    } else if (options.debug) {
                        console.log('invUtils: No hay filas seleccionadas en la sincronización inicial');
                    }
                } catch (e) {
                    console.error('invUtils: Error en sincronización inicial:', e);
                }
            }, 100);

            // Guardar cleanup
            model._apxGridSyncs[syncId] = {
                cleanup: function () {
                    try { model.unsubscribe && model.unsubscribe(syncId + '_cell'); } catch (e) { }
                    try { if ($ig && $ig.off) { $ig.off('interactivegridselectionchange.' + syncId); } } catch (e) { }
                }
            };

            console.log('invUtils: Sincronización Grid → Item configurada con múltiples listeners:', {
                grid: gridStaticId,
                column: columnName,
                item: itemName
            });

            return true;
        } catch (error) {
            console.error('invUtils: Error en sincronizarItem:', error);
            return false;
        }
    }

    // Función simplificada: solo sincroniza de Item → Grid (cuando cambia el item)
    function sincronizarDesdeItem(gridStaticId, columnName, itemName, options) {
        try {
            options = options || {};
            var syncId = 'sync_item_to_grid_' + gridStaticId + '_' + columnName + '_' + itemName;
            var asPopupLov = options.asPopupLov === true; // si true, setea {v,d} en la grilla

            // Obtener el widget del Interactive Grid y el modelo
            var region = apex.region(gridStaticId);
            var $ig = region && region.widget ? region.widget() : null;
            if (!$ig) {
                console.error('invUtils: No se encontró la región IG con Static ID:', gridStaticId);
                return false;
            }

            var grid = $ig.interactiveGrid('getViews', 'grid');
            var model = grid && grid.model ? grid.model : null;
            if (!model) {
                console.error('invUtils: No se pudo obtener el modelo del IG:', gridStaticId);
                return false;
            }

            // Resolver el item (jQuery y APEX API)
            var $item = (typeof $ === 'function') ? $('#' + itemName) : null;
            var apexItem = (window.apex && apex.item) ? apex.item(itemName) : null;
            if ((!$item || $item.length === 0) && (!apexItem || !apexItem.node$)) {
                console.error('invUtils: No se encontró el item de página:', itemName);
                return false;
            }
            if (!($item && $item.length) && apexItem && apexItem.node$) {
                $item = apexItem.node$; // usar el nodo del item provisto por APEX
            }

            // Limpiar bindings previos
            try { $item.off('change.' + syncId); } catch (e) { }

            if (!model._apxGridSyncs) { model._apxGridSyncs = {}; }
            if (model._apxGridSyncs[syncId] && typeof model._apxGridSyncs[syncId].cleanup === 'function') {
                try { model._apxGridSyncs[syncId].cleanup(); } catch (e) { }
            }

            var isSyncing = false; // evitar bucles accidentales

            // Función para setear en la fila seleccionada
            var asignarColumnaSeleccionada = function (value) {
                try {
                    var selectedRecords = grid.getSelectedRecords && grid.getSelectedRecords();
                    if (!selectedRecords || selectedRecords.length === 0) {
                        if (options.debug) {
                            console.warn('invUtils: No hay fila seleccionada para Item → Grid');
                        }
                        return false;
                    }
                    var record = selectedRecords[0];
                    isSyncing = true;
                    // Si se desea setear como Popup LOV, construir {v,d}
                    var finalValue = value;
                    if (asPopupLov) {
                        var display = null;
                        try {
                            // Intentar obtener el display del item si existe (APEX 21+)
                            if (apexItem && typeof apexItem.getDisplayValue === 'function') {
                                display = apexItem.getDisplayValue();
                            } else if ($item && $item.find) {
                                display = $item.find('option:selected').text();
                            }
                        } catch (e) { /* noop */ }
                        if (display == null || display === '') { display = value; }
                        finalValue = { v: value, d: display };
                    }
                    model.setValue(record, columnName, finalValue);
                    if (model.markDirty) { model.markDirty(record); }
                    if (model.commitRecord) { model.commitRecord(record); }
                    isSyncing = false;

                    if (options.debug) {
                        console.log('invUtils: Item -> Grid sync:', {
                            item: itemName,
                            value: value,
                            column: columnName
                        });
                    }
                    return true;
                } catch (e) {
                    isSyncing = false;
                    console.error('invUtils: Error seteando valor en la fila seleccionada:', e);
                    return false;
                }
            };

            // Bind al cambio del item
            $item.on('change.' + syncId, function () {
                try {
                    if (isSyncing) { return; }
                    var itemValue = apexItem && typeof apexItem.getValue === 'function'
                        ? apexItem.getValue()
                        : ($item && $item.val ? $item.val() : null);
                    asignarColumnaSeleccionada(itemValue);
                } catch (e) {
                    console.error('invUtils: Error en handler de cambio del item:', e);
                }
            });

            // Sincronización inicial opcional: empujar valor del item a la fila seleccionada
            if (options && options.pushInitial === true) {
                setTimeout(function () {
                    try {
                        var initialValue = apexItem && typeof apexItem.getValue === 'function'
                            ? apexItem.getValue()
                            : ($item && $item.val ? $item.val() : null);
                        asignarColumnaSeleccionada(initialValue);
                    } catch (e) {
                        console.warn('invUtils: Error en sincronización inicial Item → Grid:', e);
                    }
                }, 50);
            }

            // Guardar cleanup
            model._apxGridSyncs[syncId] = {
                cleanup: function () {
                    try { $item.off('change.' + syncId); } catch (e) { }
                }
            };

            console.log('invUtils: Sincronización Item → Grid configurada:', {
                grid: gridStaticId,
                column: columnName,
                item: itemName
            });

            return true;
        } catch (error) {
            console.error('invUtils: Error en sincronizarDesdeItem:', error);
            return false;
        }
    }

    // Helper: configura sincronización bidireccional Grid ↔ Item
    // options:
    //  - debug: boolean
    //  - pushInitialGridToItem: boolean (por defecto true)
    //  - pushInitialItemToGrid: boolean (por defecto false)
    function sincronizarItemBidireccional(gridStaticId, columnName, itemName, options) {
        try {
            options = options || {};
            var debug = !!options.debug;
            var pushGridToItem = options.pushInitialGridToItem !== false; // default true
            var pushItemToGrid = options.pushInitialItemToGrid === true;   // default false
            var asPopupLov = options.asPopupLov === true; // si la columna es Popup LOV

            // Configurar Grid → Item
            var ok1 = sincronizarItem(gridStaticId, columnName, itemName, { debug: debug });

            // Configurar Item → Grid
            var ok2 = sincronizarDesdeItem(gridStaticId, columnName, itemName, { debug: debug, pushInitial: pushItemToGrid, asPopupLov: asPopupLov });

            // Si se pidió empujar desde Grid al Item de entrada
            if (pushGridToItem) {
                setTimeout(function () {
                    try {
                        var region = apex.region(gridStaticId);
                        var $ig = region && region.widget ? region.widget() : null;
                        var grid = $ig ? $ig.interactiveGrid('getViews', 'grid') : null;
                        var model = grid && grid.model ? grid.model : null;
                        if (grid && model) {
                            var selectedRecords = grid.getSelectedRecords && grid.getSelectedRecords();
                            if (selectedRecords && selectedRecords.length > 0) {
                                var raw = model.getValue(selectedRecords[0], columnName);
                                var value = (raw && typeof raw === 'object' && (raw.v !== undefined || raw.d !== undefined)) ? raw.v : raw;
                                if (window.apex && apex.item && typeof apex.item(itemName).setValue === 'function') {
                                    try { apex.item(itemName).setValue(value, null, true); } catch (e) { apex.item(itemName).setValue(value); }
                                } else if (typeof $s === 'function') {
                                    $s(itemName, value);
                                }
                                if (debug) { console.log('invUtils: Push inicial Grid → Item aplicado'); }
                            }
                        }
                    } catch (e) {
                        console.warn('invUtils: Error en push inicial Grid → Item:', e);
                    }
                }, 50);
            }

            if (debug) {
                console.log('invUtils: Sincronización bidireccional configurada (GridItemValues):', {
                    grid: gridStaticId,
                    column: columnName,
                    item: itemName,
                    pushInitialGridToItem: pushGridToItem,
                    pushInitialItemToGrid: pushItemToGrid
                });
            }

            return !!(ok1 && ok2);
        } catch (error) {
            console.error('invUtils: Error en sincronizarItemBidireccional:', error);
            return false;
        }
    }

    // =============================================================================
    // GRID — Diagnóstico
    // =============================================================================

    /**
     * Debug completo para monitorear cambios en Interactive Grid
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} columnName - Nombre de la columna a monitorear (opcional)
     * @returns {object} - Objeto con funciones de control del debug
     */
    function depurarCambios(gridStaticId, columnName = null) {
        try {
            console.log(`🔍 invUtils: Iniciando debug completo para ${gridStaticId}${columnName ? ` -> ${columnName}` : ''}`);

            const grid = apex.region(gridStaticId).call("getViews").grid;
            const model = grid.model;

            // Almacén para valores anteriores
            const previousValues = new Map();
            const debugInfo = {
                gridStaticId: gridStaticId,
                columnName: columnName,
                startTime: new Date(),
                changes: [],
                errors: []
            };

            // Función para obtener valor actual
            function leerValorActual(record, col) {
                try {
                    return model.getValue(record, col);
                } catch (e) {
                    return 'ERROR: ' + e.message;
                }
            }

            // Función para registrar cambio
            function registrarCambio(type, record, column, oldValue, newValue, source = 'unknown') {
                const change = {
                    timestamp: new Date(),
                    type: type,
                    column: column,
                    oldValue: oldValue,
                    newValue: newValue,
                    source: source,
                    recordId: record ? record.id : 'unknown'
                };

                debugInfo.changes.push(change);

                console.log(`🔄 invUtils DEBUG [${type}] ${column}: "${oldValue}" -> "${newValue}" (${source})`);
            }

            // Función para registrar error
            function registrarError(error, context) {
                const errorInfo = {
                    timestamp: new Date(),
                    error: error.message,
                    context: context,
                    stack: error.stack
                };

                debugInfo.errors.push(errorInfo);
                console.error(`❌ invUtils DEBUG ERROR [${context}]:`, error);
            }

            // Suscribirse a cambios en el modelo
            const modelSubscription = model.subscribe({
                onChange: function (type, change) {
                    try {
                        console.log(`📊 invUtils DEBUG: Modelo cambió - Tipo: ${type}, Campo: ${change.field}, Valor: ${change.value}`);

                        if (columnName && change.field !== columnName) {
                            return; // Solo monitorear columna específica si se especifica
                        }

                        // Obtener registro
                        let record = null;
                        if (change.record) {
                            record = change.record;
                        } else if (change.recordId) {
                            record = model.getRecord(change.recordId);
                        }

                        if (record) {
                            const currentValue = leerValorActual(record, change.field);
                            const previousValue = previousValues.get(`${record.id}_${change.field}`);

                            if (previousValue !== currentValue) {
                                registrarCambio('model', record, change.field, previousValue, currentValue, 'model_change');
                                previousValues.set(`${record.id}_${change.field}`, currentValue);
                            }
                        }

                    } catch (error) {
                        registrarError(error, 'model_subscription');
                    }
                }
            });

            // Monitorear eventos de la vista
            const viewSubscription = grid.view$.on('change', function (event, data) {
                try {
                    console.log(`👁️ invUtils DEBUG: Vista cambió - Evento: ${event}`, data);
                } catch (error) {
                    registrarError(error, 'view_subscription');
                }
            });

            // Función para obtener estado actual
            function leerEstadoActual() {
                try {
                    const state = {
                        timestamp: new Date(),
                        gridInfo: {
                            staticId: gridStaticId,
                            totalRecords: 0,
                            selectedRecords: 0
                        },
                        columnValues: {},
                        modelState: {}
                    };

                    // Contar registros
                    let recordCount = 0;
                    model.forEach(function (record) {
                        recordCount++;

                        if (columnName) {
                            const value = leerValorActual(record, columnName);
                            state.columnValues[`record_${recordCount}`] = {
                                id: record.id,
                                value: value,
                                type: typeof value
                            };
                        }
                    });

                    state.gridInfo.totalRecords = recordCount;

                    // Información de registros seleccionados
                    try {
                        const selectedRecords = grid.getSelectedRecords();
                        state.gridInfo.selectedRecords = selectedRecords ? selectedRecords.length : 0;
                    } catch (e) {
                        state.gridInfo.selectedRecords = 'ERROR: ' + e.message;
                    }

                    // Estado del modelo
                    try {
                        state.modelState.editable = model.getOption ? model.getOption('editable') : 'unknown';
                        state.modelState.dirty = model.isDirty ? model.isDirty() : 'unknown';
                    } catch (e) {
                        state.modelState.error = e.message;
                    }

                    return state;

                } catch (error) {
                    registrarError(error, 'get_current_state');
                    return null;
                }
            }

            // Función para simular cambio manual
            function simularCambioManual() {
                try {
                    console.log(`🎯 invUtils DEBUG: Simulando cambio manual...`);

                    const array = grid.getSelectedRecords();
                    if (array && array.length > 0) {
                        const targetRow = array[0][1];
                        const currentValue = leerValorActual(targetRow, columnName || 'COSTO');
                        const newValue = parseFloat(currentValue || 0) + 0.01;

                        console.log(`🎯 invUtils DEBUG: Cambiando ${columnName || 'COSTO'} de ${currentValue} a ${newValue}`);

                        model.setValue(targetRow, columnName || 'COSTO', newValue);

                        // Forzar commit
                        if (model.commitRecord) {
                            model.commitRecord(targetRow);
                        }

                        if (model.markDirty) {
                            model.markDirty(targetRow);
                        }

                        console.log(`🎯 invUtils DEBUG: Cambio manual simulado completado`);
                    } else {
                        console.warn(`🎯 invUtils DEBUG: No hay registros seleccionados para simular cambio`);
                    }

                } catch (error) {
                    registrarError(error, 'simulate_manual_change');
                }
            }

            // Función para detener debug
            function detenerDepuracion() {
                try {
                    console.log(`🛑 invUtils DEBUG: Deteniendo debug para ${gridStaticId}`);

                    if (modelSubscription && modelSubscription.unsubscribe) {
                        modelSubscription.unsubscribe();
                    }

                    if (viewSubscription && viewSubscription.off) {
                        viewSubscription.off('change');
                    }

                    console.log(`📊 invUtils DEBUG RESUMEN:`);
                    console.log(`   - Cambios registrados: ${debugInfo.changes.length}`);
                    console.log(`   - Errores registrados: ${debugInfo.errors.length}`);
                    console.log(`   - Tiempo de ejecución: ${new Date() - debugInfo.startTime}ms`);

                    return debugInfo;

                } catch (error) {
                    registrarError(error, 'stop_debug');
                    return debugInfo;
                }
            }

            // Función para obtener resumen
            function leerResumen() {
                return {
                    ...debugInfo,
                    currentState: leerEstadoActual(),
                    runtime: new Date() - debugInfo.startTime
                };
            }

            // Inicializar valores anteriores
            model.forEach(function (record) {
                if (columnName) {
                    const value = leerValorActual(record, columnName);
                    previousValues.set(`${record.id}_${columnName}`, value);
                }
            });

            console.log(`✅ invUtils DEBUG: Debug iniciado para ${gridStaticId}`);
            console.log(`   - Monitoreando columna: ${columnName || 'TODAS'}`);
            console.log(`   - Registros iniciales: ${previousValues.size}`);

            // Retornar funciones de control
            return {
                leerEstadoActual: leerEstadoActual,
                simularCambioManual: simularCambioManual,
                detenerDepuracion: detenerDepuracion,
                leerResumen: leerResumen,
                debugInfo: debugInfo
            };

        } catch (error) {
            console.error('invUtils depurarCambios error:', error);
            return null;
        }
    }

    // =============================================================================
    // GRID — fórmulas y configuraciones rápidas
    // =============================================================================

    /**
     * Fórmulas predefinidas comunes
     */
    const formulas = {
        // Cantidad por costo
        multiplicar: (values, col1, col2) => values[col1] * values[col2],

        // Precio con IVA
        agregarImpuesto: (values, priceCol, taxPercent = 10) => values[priceCol] * (1 + taxPercent / 100),

        // Subtotal con descuento
        calcularSubtotal: (values, qtyCol, priceCol, discountCol) => {
            const subtotal = values[qtyCol] * values[priceCol];
            return subtotal * (1 - values[discountCol] / 100);
        },

        // Suma de columnas
        sumar: (values, ...columns) => columns.reduce((total, col) => total + values[col], 0),

        // Promedio de columnas
        promediar: (values, ...columns) => {
            const sumar = columns.reduce((total, col) => total + values[col], 0);
            return sumar / columns.length;
        }
    };

    /**
     * Configuraciones rápidas para casos comunes
     */
    const configuracionesRapidas = {
        /**
         * Configurar multiplicación simple (cantidad × precio = total)
         */
        configurarProducto: function (gridStaticId, col1, col2, targetCol, decimalPlaces = 2) {
            return configurarCalculoAutomatico(gridStaticId, {
                sourceColumns: [col1, col2],
                targetColumn: targetCol,
                formula: function (values) {
                    return values[col1] * values[col2];
                },
                decimalPlaces: decimalPlaces
            });
        },

        /**
         * Configurar precio con IVA
         */
        configurarImpuesto: function (gridStaticId, priceCol, targetCol, taxPercent = 10, decimalPlaces = 2) {
            return configurarCalculoAutomatico(gridStaticId, {
                sourceColumns: [priceCol],
                targetColumn: targetCol,
                formula: function (values) {
                    return values[priceCol] * (1 + taxPercent / 100);
                },
                decimalPlaces: decimalPlaces
            });
        },

        /**
         * Configurar subtotal con descuento
         */
        configurarDescuento: function (gridStaticId, qtyCol, priceCol, discountCol, targetCol, decimalPlaces = 2) {
            return configurarCalculoAutomatico(gridStaticId, {
                sourceColumns: [qtyCol, priceCol, discountCol],
                targetColumn: targetCol,
                formula: function (values) {
                    const subtotal = values[qtyCol] * values[priceCol];
                    return subtotal * (1 - values[discountCol] / 100);
                },
                decimalPlaces: decimalPlaces
            });
        }
    };

    // =============================================================================
    // AUXILIARES PRIVADOS — no se publican en la API
    // =============================================================================

    /**
    * Verifica de forma fiable si un registro de un modelo de IG está marcado para eliminación.
    * @param {object} record El objeto de registro del modelo.
    * @param {object} model El modelo del Interactive Grid.
    * @returns {boolean} True si el registro está marcado para ser eliminado.
    */
    function esRegistroEliminado(record, model) {
        try {
            // El método más fiable es a través de los metadatos del registro.
            const recordId = model.getRecordId(record);
            if (recordId) {
                const meta = model.getRecordMetadata(recordId);
                // Si el registro fue eliminado (meta.deleted) o es un agregado (meta.agg), no debe procesarse.
                if (meta && (meta.deleted || meta.agg)) {
                    return true;
                }
            }
            // Fallback por si la metadata no está disponible o es un registro nuevo sin ID.
            // La propiedad 't' con el valor 'd' también es un indicador interno de APEX.
            if (record._meta && record._meta.t === 'd') {
                return true;
            }

        } catch (e) {
            console.warn('invUtils: No se pudo verificar el estado del registro.', e);
        }
        return false;
    }

    /**
     * Generar ID único para una configuración
     * @param {string} gridStaticId - Static ID del Interactive Grid
     * @param {string} targetColumn - Columna destino
     * @returns {string} - ID único de la configuración
     */
    function generarIdConfiguracion(gridStaticId, targetColumn) {
        return `${gridStaticId}_${targetColumn}`;
    }

    /**
     * Ejecuta un cálculo específico en el registro activo
     */
    function calcularFormula(gridStaticId, settings) {
        try {
            const grid = apex.region(gridStaticId).call("getViews").grid;
            if (!grid) {
                console.error('invUtils: No se pudo encontrar el grid con ID:', gridStaticId);
                return;
            }
            const model = grid.model;

            // 1. ITERAR SOBRE TODAS LAS FILAS DEL MODELO
            model.forEach(function (record) {

                // 2. OMITIR FILAS MARCADAS PARA ELIMINACIÓN
                if (esRegistroEliminado(record, model)) {
                    return; // Saltar a la siguiente fila
                }

                try {
                    // 3. OBTENER VALORES Y APLICAR FÓRMULA (para la fila actual del bucle)
                    const values = {};
                    settings.sourceColumns.forEach(column => {
                        values[column] = normalizarNumero(model.getValue(record, column));
                    });

                    let result = settings.formula(values, record); // Pasamos 'record' por si la fórmula lo necesita
                    const decimalPlaces = settings.decimalPlaces || 2;
                    const roundedResult = parseFloat(Number(result).toFixed(decimalPlaces));

                    // 4. CONDICIÓN DE GUARDA (ANTI-BUCLE)
                    const currentValue = model.getValue(record, settings.targetColumn);
                    const roundedCurrentValue = parseFloat(Number(currentValue).toFixed(decimalPlaces));

                    if (roundedCurrentValue !== roundedResult) {
                        model.setValue(record, settings.targetColumn, roundedResult);
                    }

                } catch (recordError) {
                    const recordId = model.getRecordId(record) || "nuevo";
                    console.warn(`Error al procesar la fórmula en la fila ${recordId}:`, recordError);
                }
            });

        } catch (error) {
            console.error('invUtils calcularFormula error:', error);
        }
    }

    /**
     * Configurar eventos para disparar cálculos automáticamente
     */
    function configurarEventosCalculo(gridStaticId, sourceColumns, callback) {
        try {
            const ig$ = apex.region(gridStaticId).widget().interactiveGrid("getViews", "grid");
            const model = ig$.model;

            // Configurar listener para cambios en el modelo
            model.subscribe({
                onChange: function (type, change) {
                    if (type === 'set' && sourceColumns.includes(change.field)) {
                        setTimeout(callback, 50);
                    }
                }
            });

        } catch (error) {
            console.error('invUtils configurarEventosCalculo error:', error);
        }
    }

    /**
     * Obtener el registro activo del grid
     */
    function leerContextoRegistro(gridStaticId) {
        try {
            const region = apex.region(gridStaticId);
            if (!region.widget) {
                return { success: false, error: 'Grid no encontrado' };
            }

            const ig$ = region.widget().interactiveGrid("getViews", "grid");
            const model = ig$.model;

            // En versiones más antiguas, obtener el registro activo puede ser diferente
            // Intentar diferentes métodos según la versión
            let record = null;

            // Método 1: Intentar obtener registro seleccionado
            try {
                const selectedRecords = ig$.getSelectedRecords();
                if (selectedRecords && selectedRecords.length > 0) {
                    record = selectedRecords[0];
                }
            } catch (e) {
                // Ignorar error y probar siguiente método
            }

            // Método 2: Intentar obtener registro activo
            if (!record) {
                try {
                    const activeRecordId = ig$.getActiveRecordId ? ig$.getActiveRecordId() : null;
                    if (activeRecordId) {
                        record = model.getRecord(activeRecordId);
                    }
                } catch (e) {
                    // Ignorar error y probar siguiente método
                }
            }

            // Método 3: Obtener el primer registro si no hay activo
            if (!record) {
                try {
                    // Usar model.forEach para obtener el primer registro
                    let firstRecord = null;
                    model.forEach(function (rec) {
                        if (!firstRecord) {
                            firstRecord = rec;
                        }
                    });
                    record = firstRecord;
                } catch (e) {
                    // Ignorar error
                }
            }

            if (!record) {
                return { success: false, error: 'No hay registro disponible' };
            }

            return { success: true, model, record, gridView: ig$ };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Se conserva la inicialización automática del foco de la biblioteca original.
    setTimeout(() => {
        configurarRestauracionFoco(true);
    }, 100);

    // =============================================================================
    // API PÚBLICA — PUBLICAR AQUÍ LAS NUEVAS FUNCIONES
    // =============================================================================

    // 1. Implementar la función arriba, en GENERAL, ITEM o GRID, con JSDoc.
    // 2. Agregar su nombre al objeto correspondiente de este return.
    //    Ejemplo: leerTexto dentro de item se usa como invUtils.item.leerTexto(...).
    // 3. Si es un auxiliar interno, NO agregarlo aquí.
    // 4. Aplicar las reglas de docs/desarrollo.md: leer/asignar, verbo + objeto,
    //    tres palabras preferidas y excepciones justificadas por el comportamiento.
    // 5. Documentar firma y retorno en docs/referencia-api.md, y ejemplos en docs/manual.md.
    //    Registrar renombrados en docs/migracion.md. No traducir métodos de APEX.
    return {
        mostrarAlerta,
        posponerEjecucion,
        cancelarEjecucionPendiente,
        ejecutarSiCambia,
        cancelarEjecucionesPendientes,
        normalizarNumero,
        formatearNumero: formatearNumeroEuropeo,
        formatearNumeroEuropeo,
        convertirNumeroEuropeo,

        item: {
            leerNumero,
            leerValorNumerico,
            leerNumeros
        },

        grid: {
            // Edición y datos
            habilitarEdicion,
            extraerDatos,
            extraerCampos,
            cargarDatos,
            cargarDatosDirectos,
            cargarDesdeItem,

            // Cálculos y configuración
            configurarCalculoAutomatico,
            calcularColumnas,
            configurarMultiplicacion,
            asegurarCalculoAutomatico,
            asegurarFormatoDecimal,
            sumarColumna,
            sumarTotal,
            escucharCambios,
            forzarRecalculo,
            actualizarCalculoAutomatico,
            leerConfiguracionCalculo,
            eliminarConfiguracionCalculo,
            leerConfiguracionesCalculo,
            estaInicializado,
            inicializarModulo,
            recalcularFilas,

            // Lectura de valores
            leerColumna,
            leerCelda,
            leerCeldaSeleccionada,
            leerPrimeraCelda,
            leerFilaActual,
            leerNumeroCelda,
            leerNumeroSeleccionado,
            leerPrimerNumero,
            leerNumeroRedondeado,
            leerNumeroSeleccionadoRedondeado,
            leerPrimerNumeroRedondeado,
            leerEnteroCelda,
            leerEnteroSeleccionado,
            leerPrimerEntero,

            // Asignación de valores
            asignarColumna,
            asignarCelda,
            asignarCeldaSeleccionada,
            asignarPrimeraCelda,
            limpiarCeldasSeleccionadas,
            asignarNumeroCelda,
            asignarNumeroSeleccionado,
            asignarPrimerNumero,
            asignarEnteroCelda,
            asignarEnteroSeleccionado,
            asignarPrimerEntero,
            asignarCeldaConRecalculo,
            asignarCeldaSeleccionadaConRecalculo,
            asignarPrimeraCeldaConRecalculo,
            asignarFilas,
            asignarValorFilas,

            // Navegación y foco
            irACelda,
            irAPrimeraCelda,
            irACeldaSeleccionada,
            configurarRestauracionFoco,
            habilitarRestauracionFoco,
            deshabilitarRestauracionFoco,
            leerUltimoFoco,
            asignarUltimoFoco,
            restaurarFoco,
            limpiarReferenciaFoco,
            leerEstadoFoco,

            // Refresco y confirmación del modelo
            refrescarRegion,
            refrescarConRecalculo,
            refrescarCalculosRegistrados,
            confirmarCambios,
            refrescarVista,
            refrescarConConfirmacion,
            marcarFila,
            marcarRegistro,

            // Variantes de asignación existentes
            asignarNumeroMarcado,
            asignarNumeroSeleccionadoMarcado,
            asignarPrimerNumeroMarcado,
            asignarNumeroSinFormato,
            asignarNumeroSeleccionadoSinFormato,
            asignarPrimerNumeroSinFormato,
            asignarNumeroEuropeo,
            asignarNumeroSeleccionadoEuropeo,
            asignarPrimerNumeroEuropeo,
            asignarCeldaMarcada,
            asignarCeldaSeleccionadaMarcada,
            asignarPrimeraCeldaMarcada,
            asignarCeldaVerificada,
            asignarCeldaSeleccionadaVerificada,
            asignarPrimeraCeldaVerificada,
            simularInteraccionUsuario,
            asignarCeldaActivada,
            asignarCeldaSeleccionadaActivada,
            asignarPrimeraCeldaActivada,
            asignarCeldaPausandoEventos,
            asignarCeldaSeleccionadaPausandoEventos,
            asignarPrimeraCeldaPausandoEventos,

            // Selección y sincronización con ítems
            sincronizarItemSeleccion,
            sincronizarItemCambios,
            asignarColumnaSeleccionada,
            seleccionarFilaInicial,
            sincronizarItem,
            sincronizarDesdeItem,
            sincronizarItemBidireccional,

            // Diagnóstico
            depurarCambios,

            formulas,
            configuracionesRapidas
        }
    };

})(window.apex, window.apex.jQuery);
