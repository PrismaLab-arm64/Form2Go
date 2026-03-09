const loginView = document.getElementById("loginView");
const formView = document.getElementById("formView");

const loginForm = document.getElementById("loginForm");
const recordForm = document.getElementById("recordForm");

const gestorInput = document.getElementById("codigoGestor");
const gestorActivo = document.getElementById("gestorActivo");

const celular = document.getElementById("celular");
const confirmarCelular = document.getElementById("confirmarCelular");
const confirmacionTelefono = document.getElementById("confirmacionTelefono");

const formMessage = document.getElementById("formMessage");

const STORAGE_GESTOR = "form2go_gestor";
const STORAGE_DRAFT = "form2go_draft";

document.addEventListener("DOMContentLoaded", () => {
  const gestorGuardado = localStorage.getItem(STORAGE_GESTOR);

  if (gestorGuardado) {
    iniciarSesion(gestorGuardado);
  }

  restaurarBorrador();
});

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const codigo = gestorInput.value.trim().toUpperCase();

  if (!codigo) {
    alert("Ingrese el código del gestor.");
    gestorInput.focus();
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

recordForm.addEventListener("input", () => {
  normalizarTelefono(celular);
  normalizarTelefono(confirmarCelular);
  limpiarErroresVisuales();
  guardarBorrador();
});

function guardarBorrador() {
  const datos = new FormData(recordForm);
  const draft = {};

  datos.forEach((value, key) => {
    draft[key] = value;
  });

  draft.confirmacionTelefono = confirmacionTelefono.checked;
  localStorage.setItem(STORAGE_DRAFT, JSON.stringify(draft));
}

function restaurarBorrador() {
  const draft = localStorage.getItem(STORAGE_DRAFT);
  if (!draft) return;

  const data = JSON.parse(draft);

  Object.keys(data).forEach((key) => {
    const campo = recordForm.elements[key];
    if (!campo) return;

    if (campo.type === "checkbox") {
      campo.checked = Boolean(data[key]);
    } else {
      campo.value = data[key];
    }
  });
}

function normalizarTelefono(input) {
  input.value = input.value.replace(/\D/g, "").slice(0, 10);
}

function limpiarErroresVisuales() {
  [celular, confirmarCelular].forEach((campo) => {
    campo.classList.remove("is-invalid");
  });
  formMessage.textContent = "";
  formMessage.classList.remove("is-success");
}

function mostrarError(msg, campo = null) {
  formMessage.textContent = msg;
  formMessage.classList.remove("is-success");

  if (campo) {
    campo.classList.add("is-invalid");
    campo.focus();
  }
}

function validarFormulario() {
  limpiarErroresVisuales();

  const telefono = celular.value.trim();
  const telefonoConfirmado = confirmarCelular.value.trim();

  if (!/^\d{10}$/.test(telefono)) {
    mostrarError("El número celular debe tener exactamente 10 dígitos.", celular);
    return false;
  }

  if (!/^\d{10}$/.test(telefonoConfirmado)) {
    mostrarError("La confirmación del celular debe tener exactamente 10 dígitos.", confirmarCelular);
    return false;
  }

  if (telefono !== telefonoConfirmado) {
    mostrarError("Los números de celular no coinciden.", confirmarCelular);
    return false;
  }

  if (!confirmacionTelefono.checked) {
    mostrarError("Debe confirmar que verificó el número de teléfono antes de enviar.");
    confirmacionTelefono.focus();
    return false;
  }

  return true;
}

recordForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validarFormulario()) return;

  const gestor = localStorage.getItem(STORAGE_GESTOR) || "GESTOR";
  const datos = new FormData(recordForm);

  const registro = {
    NombrePaciente: datos.get("nombrePaciente") || "",
    FechaAccidente: datos.get("fechaAccidente") || "",
    CompaniaSOAT: datos.get("companiaSoat") || "",
    NombreEPS: datos.get("nombreEps") || "",
    Celular: datos.get("celular") || "",
    Diagnostico: datos.get("diagnostico") || "",
    Hechos: datos.get("hechos") || ""
  };

  const csv = convertirCSV(registro);
  const archivo = generarArchivoCSV(csv, gestor);
  const enviado = await compartirArchivo(archivo);

  if (enviado) {
    limpiarFormulario();
  }
});

function convertirCSV(registro) {
  const headers = Object.keys(registro).join(",");
  const valores = Object.values(registro)
    .map((v) => `"${String(v).replace(/"/g, '""')}"`)
    .join(",");

  return `${headers}\n${valores}`;
}

function generarArchivoCSV(csv, gestor) {
  const ahora = new Date();
  const fecha = ahora.toISOString().split("T")[0];
  const hora = ahora.toTimeString().slice(0, 5).replace(":", "-");
  const nombre = `${gestor}_${fecha}_${hora}.csv`;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  return new File([blob], nombre, { type: "text/csv;charset=utf-8;" });
}

async function compartirArchivo(file) {
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: "Registro Form2Go",
        text: "Registro generado desde Form2Go",
        files: [file]
      });
      return true;
    } catch (error) {
      console.log("Compartir cancelado o no completado.", error);
      return false;
    }
  }

  descargarArchivo(file);
  return true;
}

function descargarArchivo(file) {
  const url = URL.createObjectURL(file);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = file.name;

  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);

  URL.revokeObjectURL(url);
}

function limpiarFormulario() {
  recordForm.reset();
  localStorage.removeItem(STORAGE_DRAFT);

  formMessage.textContent = "Registro enviado correctamente.";
  formMessage.classList.add("is-success");

  setTimeout(() => {
    formMessage.textContent = "";
    formMessage.classList.remove("is-success");
  }, 3000);
}
