# Form2Go

<p align="center">
  <img src="icons/icon-192.png" width="120">
</p>

<p align="center">
<b>Registro ágil de campo para Gestores SOAT</b>
</p>

<p align="center">
Progressive Web App minimalista para captura rápida de información y envío inmediato de registros estructurados.
</p>

---

## Estado del proyecto

![Status](https://img.shields.io/badge/status-development-blue)  
![PWA](https://img.shields.io/badge/PWA-ready-green)  
![License](https://img.shields.io/badge/license-private-red)  
![Version](https://img.shields.io/badge/version-1.0-9cf)

---

# Descripción

**Form2Go** es una **Progressive Web App (PWA)** diseñada para registrar información de captación en campo por parte de **gestores SOAT**, generando archivos **CSV estructurados** que pueden ser enviados inmediatamente al equipo asesor para su gestión.

La aplicación prioriza:

- velocidad de registro
- simplicidad operativa
- funcionamiento offline
- generación automática de archivos estructurados

Su diseño responde a escenarios reales de trabajo en terreno donde el gestor debe capturar datos en segundos y compartirlos de inmediato.

---

# Objetivo del proyecto

Proveer una herramienta ligera y confiable que permita:

- registrar casos rápidamente en campo
- estructurar la información en formato CSV
- compartir registros inmediatamente con el asesor
- operar sin dependencia de servidores o bases de datos externas

Form2Go está diseñado para entornos donde la **agilidad operativa y la simplicidad tecnológica son críticas**.

---

# Flujo de operación

## 1. Inicio de sesión

El gestor introduce su **código único de identificación**.

Código del gestor
[________]


El código queda almacenado localmente para identificar los registros generados.

---

## 2. Registro del caso

El gestor diligencia los siguientes campos:

- Nombre del paciente
- Fecha del accidente
- Nombre compañía SOAT
- Nombre EPS
- Celular
- Diagnóstico
- Hechos

El formulario está optimizado para uso móvil.

---

## 3. Envío del registro

Al presionar **ENVIAR**, la aplicación:

1. genera un archivo CSV  
2. incorpora el código del gestor  
3. agrega fecha y hora  
4. activa el menú de compartir del dispositivo  
5. permite el envío inmediato al asesor  

---

## 4. Reinicio automático

Después del envío:

- el formulario se limpia automáticamente
- queda listo para el siguiente registro

---

# Formato del archivo generado

Los archivos se nombran utilizando el siguiente esquema:
CODIGO_GESTOR_FECHA_HORA.csv


Ejemplo:


SK01_2026-03-08_22-41.csv


Esto permite:

- identificar al gestor
- mantener orden cronológico
- facilitar auditoría de registros

---

# Estructura del archivo CSV

Columnas exportadas:


NombrePaciente
FechaAccidente
CompaniaSOAT
NombreEPS
Celular
Diagnostico
Hechos


Ejemplo de salida:


NombrePaciente,FechaAccidente,CompaniaSOAT,NombreEPS,Celular,Diagnostico,Hechos
Juan Perez,2026-03-05,SURA,Nueva EPS,3120000000,Fractura tibia,Accidente en motocicleta


---

# Arquitectura técnica

Form2Go funciona completamente del lado del cliente.

No requiere:

- servidores backend
- bases de datos remotas
- APIs externas

Tecnologías utilizadas:

- HTML5
- CSS3
- JavaScript
- PWA Manifest
- Service Worker
- Web Share API

---

# Características

| Característica | Descripción |
|---|---|
| Registro rápido | Captura de datos en menos de 15 segundos |
| Funcionamiento offline | No depende de conexión permanente |
| Exportación estructurada | Generación automática de CSV |
| Compartir inmediato | Integración con Web Share API |
| Diseño minimalista | Interfaz optimizada para campo |

---

# Instalación como PWA

Form2Go puede instalarse como aplicación directamente desde el navegador.

Pasos generales:

1. abrir la aplicación en el navegador  
2. seleccionar **Agregar a pantalla de inicio**  
3. ejecutar como aplicación independiente  

Compatible con:

- Android  
- iOS  
- navegadores modernos  
- escritorio  

---

# Estructura del repositorio


form2go/
│
├── index.html
├── manifest.json
├── service-worker.js
│
├── css/
│ └── styles.css
│
├── js/
│ └── app.js
│
├── icons/
│ ├── icon-192.png
│ └── icon-512.png
│
└── README.md


---

# Seguridad y manejo de información

Form2Go no transmite datos a servidores externos.

Los registros:

- se generan localmente
- se exportan manualmente
- se comparten por decisión del usuario

Esto reduce riesgos asociados a almacenamiento remoto innecesario.

---

# Casos de uso

Form2Go puede utilizarse en contextos como:

- captación de casos SOAT
- registro de eventos en campo
- levantamiento rápido de información
- operaciones comerciales móviles
- registro preliminar para gestión posterior

---

# Desarrollo

**Desarrollo por:** Prisma-Lab_arm64  
**Desarrollado por:** Ing. John A. Skinner  
**Año:** 2026  

---

# Licenciamiento

Form2Go es un desarrollo de carácter **privado y especializado**.

Condiciones de uso:

- licencia no comercial
- uso exclusivo bajo autorización
- licencia exclusiva bajo suscripción para **SISTROVIAL.LEGAL**

Queda prohibida su reproducción, distribución, modificación o explotación sin autorización expresa del titular o licenciatario autorizado.

---

# Autoría

Proyecto desarrollado por **Prisma-Lab_arm64**  
Dirección técnica y desarrollo: **Ing. John A. Skinner**

INGRESAR
