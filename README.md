# Form2Go

Aplicación web progresiva (PWA) para **registro ágil de información en campo por Gestores SOAT**.

Form2Go permite capturar datos de manera rápida desde un dispositivo móvil, generar automáticamente un archivo **CSV estructurado** y compartirlo con el asesor de oficina para su procesamiento.

---

## Objetivo

Optimizar el proceso de **captura de información en campo**, evitando errores de transcripción y facilitando el envío inmediato de los registros al equipo administrativo.

Form2Go está diseñada para:

- Gestores SOAT en campo
- Asesores de oficina
- Equipos de atención inicial

---

## Características principales

✔ Interfaz minimalista optimizada para uso en campo  
✔ Confirmación de número telefónico para evitar errores  
✔ Generación automática de archivo CSV  
✔ Compartir archivo directamente desde el dispositivo  
✔ Funcionamiento como **PWA instalable**  
✔ Compatible con dispositivos móviles  
✔ Almacenamiento temporal de datos durante la captura  
✔ Validación básica de formulario  

---

## Flujo de uso

1. El gestor abre la aplicación.
2. Ingresa su **código de gestor**.
3. Diligencia el formulario de registro.
4. Confirma el número telefónico.
5. Presiona **ENVIAR**.
6. El sistema genera un archivo CSV.
7. El archivo puede compartirse directamente con el asesor.

---

## Estructura del proyecto


Form2Go
│
├─ assets
│ └─ icons
│ ├─ icon-192.png
│ └─ icon-512.png
│
├─ js
│ └─ app.js
│
├─ index.html
├─ styles.css
├─ manifest.json
├─ service-worker.js
├─ README.md
└─ .gitignore


---

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript
- Progressive Web App (PWA)
- Service Workers
- Web Share API

---

## Instalación como aplicación

Form2Go puede instalarse como aplicación en dispositivos móviles.

### Android

1. Abrir la aplicación en el navegador.
2. Seleccionar **Agregar a pantalla de inicio**.
3. Instalar la aplicación.

La app funcionará como una aplicación nativa.

---

## Compatibilidad

La aplicación funciona en:

- Chrome
- Edge
- Navegadores móviles modernos

Algunas funciones de compartir archivos pueden variar según el navegador.

---

## Exportación de datos

El sistema genera un archivo CSV con la siguiente estructura:


NombrePaciente
FechaAccidente
CompaniaSOAT
NombreEPS
Celular
Diagnostico
Hechos


El archivo puede abrirse en:

- Excel
- Google Sheets
- Sistemas CRM
- Bases de datos

---

## Seguridad de datos

La aplicación no almacena información en servidores externos.

Los datos capturados:

- permanecen temporalmente en el dispositivo
- se eliminan después del envío del registro

---

## Licencia

Licencia de uso **exclusiva bajo suscripción para SISTROVIAL LEGAL**.

Uso **no comercial para gestores autorizados**.

---

## Desarrollo

Desarrollado por:

**Prisma-Lab_arm64**

Ing. **John A. Skinner**  
Año **2026**

---

## Estado del proyecto

Versión estable funcional.

Form2Go se encuentra operativa para captura de registros en campo y generación de reportes CSV.

---
