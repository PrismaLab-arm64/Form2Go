/* ===========================
   FORM2GO - LÓGICA PRINCIPAL
   =========================== */

const loginView = document.getElementById("loginView");
const formView = document.getElementById("formView");

const loginForm = document.getElementById("loginForm");
const recordForm = document.getElementById("recordForm");

const gestorInput = document.getElementById("codigoGestor");
const gestorActivo = document.getElementById("gestorActivo");

const celular = document.getElementById("celular");
const confirmarCelular = document.getElementById("confirmarCelular");

const formMessage = document.getElementById("formMessage");

/* ===========================
   CONFIGURACIÓN
   =========================== */

const STORAGE_GESTOR = "form2go_gestor";
const STORAGE_DRAFT = "form2go_draft";

/* ===========================
   RESTAURAR SESIÓN
   =========================== */

document.addEventListener("DOMContentLoaded", () => {
  const gestorGuardado = localStorage.getItem(STORAGE_GESTOR);

  if (gestorGuardado) {
    iniciarSesion(gestorGuardado);
  }

  restaurarBorrador();
});

/* ===========================
   LOGIN
   =========================== */

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const codigo = gestorInput.value.trim().toUpperCase();

  if (!codigo) {
    alert("Ingrese el código del gestor");
    return;
  }

  localStorage.setItem(STORAGE_GESTOR, codigo);

  iniciarSesion(codigo);
});

function iniciarSesion(codigo) {
  gestorActivo.textContent = codigo;

  loginView.hidden = true;
  formView.hidden = false;

  loginView.classList.remove("view--active");
  formView.classList.add("view--active");
}

/* ===========================
   AUTOGUARDADO DE BORRADOR
   =========================== */

recordForm.addEventListener("input", guardarBorrador);

function guardarBorrador() {
  const datos = new FormData(recordForm);
  const draft = {};

  datos.forEach((value, key) => {
    draft[key] = value;
  });

  localStorage.setItem(STORAGE_DRAFT, JSON.stringify(draft));
}

function restaurarBorrador() {
  const draft = localStorage.getItem(STORAGE_DRAFT);

  if (!draft) return;

  const data = JSON.parse(draft);

  Object.keys(data).forEach((key) => {
    const campo = recordForm.elements[key];
    if (campo) campo.value = data[key];
  });
}

/* ===========================
   VALIDACIÓN
   =========================== */

function validarFormulario() {
  formMessage.textContent = "";

  if (celular.value.length !== 10) {
    mostrarError("El número celular debe tener 10 dígitos");
    return false;
  }

  if (celular.value !== confirmarCelular.value) {
    mostrarError("Los números de celular no coinciden");
    return false;
  }

  if (!document.getElementById("confirmacionTelefono").checked) {
    mostrarError("Debe confirmar que verificó el número");
    return false;
  }

  return true;
}

function mostrarError(msg) {
  formMessage.textContent = msg;
}

/* ===========================
   ENVÍO DEL FORMULARIO
   =========================== */

recordForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validarFormulario()) return;

  const gestor = localStorage.getItem(STORAGE_GESTOR);

  const datos = new FormData(recordForm);

  const registro = {
    NombrePaciente: datos.get("nombrePaciente"),
    FechaAccidente: datos.get("fechaAccidente"),
    CompaniaSOAT: datos.get("companiaSoat"),
    NombreEPS: datos.get("nombreEps"),
    Celular: datos.get("celular"),
    Diagnostico: datos.get("diagnostico"),
    Hechos: datos.get("hechos"),
  };

  const csv = convertirCSV(registro);

  const archivo = generarArchivoCSV(csv, gestor);

  await compartirArchivo(archivo);

  limpiarFormulario();
});

/* ===========================
   GENERAR CSV
   =========================== */

function convertirCSV(registro) {
  const headers = Object.keys(registro).join(",");
  const valores = Object.values(registro)
    .map((v) => `"${(v || "").replace(/"/g, '""')}"`)
    .join(",");

  return headers + "\n" + valores;
}

/* ===========================
   CREAR ARCHIVO CSV
   =========================== */

function generarArchivoCSV(csv, gestor) {
  const ahora = new Date();

  const fecha = ahora.toISOString().split("T")[0];

  const hora = ahora
    .toTimeString()
    .slice(0, 5)
    .replace(":", "-");

  const nombre = `${gestor}_${fecha}_${hora}.csv`;

  const blob = new Blob([csv], { type: "text/csv" });

  return new File([blob], nombre, { type: "text/csv" });
}

/* ===========================
   COMPARTIR ARCHIVO
   =========================== */

async function compartirArchivo(file) {
  if (navigator.share && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: "Registro Form2Go",
        text: "Registro generado desde Form2Go",
        files: [file],
      });
    } catch (error) {
      console.log("Compartir cancelado");
    }
  } else {
    descargarArchivo(file);
  }
}

/* ===========================
   DESCARGA DE RESPALDO
   =========================== */

function descargarArchivo(file) {
  const url = URL.createObjectURL(file);

  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;

  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

/* ===========================
   LIMPIAR FORMULARIO
   =========================== */

function limpiarFormulario() {
  recordForm.reset();

  localStorage.removeItem(STORAGE_DRAFT);

  formMessage.textContent = "Registro enviado correctamente";
  formMessage.classList.add("is-success");

  setTimeout(() => {
    formMessage.textContent = "";
    formMessage.classList.remove("is-success");
  }, 3000);
}
