const loginForm = document.getElementById("loginForm");
const recordForm = document.getElementById("recordForm");

const loginView = document.getElementById("loginView");
const formView = document.getElementById("formView");

const gestorInput = document.getElementById("codigoGestor");
const gestorActivo = document.getElementById("gestorActivo");

const nombrePaciente = document.getElementById("nombrePaciente");
const fechaAccidente = document.getElementById("fechaAccidente");
const companiaSoat = document.getElementById("companiaSoat");
const nombreEps = document.getElementById("nombreEps");
const celular = document.getElementById("celular");
const confirmarCelular = document.getElementById("confirmarCelular");
const diagnostico = document.getElementById("diagnostico");
const hechos = document.getElementById("hechos");
const confirmacionTelefono = document.getElementById("confirmacionTelefono");

const formMessage = document.getElementById("formMessage");

const STORAGE_GESTOR = "form2go_gestor";
const STORAGE_DRAFT = "form2go_draft";

document.addEventListener("DOMContentLoaded", () => {
  restaurarSesion();
  restaurarBorrador();
  registrarEventosDeAutoguardado();
});

function restaurarSesion() {
  const gestorGuardado = localStorage.getItem(STORAGE_GESTOR);

  if (gestorGuardado) {
    iniciarSesion(gestorGuardado);
    gestorInput.value = gestorGuardado;
  }
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

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
  loginView.style.display = "none";
  formView.style.display = "block";
}

function registrarEventosDeAutoguardado() {
  const campos = [
    nombrePaciente,
    fechaAccidente,
    companiaSoat,
    nombreEps,
    celular,
    confirmarCelular,
    diagnostico,
    hechos,
    confirmacionTelefono
  ];

  campos.forEach((campo) => {
    if (!campo) return;

    const evento = campo.type === "checkbox" ? "change" : "input";
    campo.addEventListener(evento, () => {
      if (campo === celular || campo === confirmarCelular) {
        normalizarTelefono(campo);
      }
      limpiarMensaje();
      guardarBorrador();
    });
  });
}

function normalizarTelefono(input) {
  input.value = input.value.replace(/\D/g, "").slice(0, 10);
}

function guardarBorrador() {
  const draft = {
    nombrePaciente: nombrePaciente.value,
    fechaAccidente: fechaAccidente.value,
    companiaSoat: companiaSoat.value,
    nombreEps: nombreEps.value,
    celular: celular.value,
    confirmarCelular: confirmarCelular.value,
    diagnostico: diagnostico.value,
    hechos: hechos.value,
    confirmacionTelefono: confirmacionTelefono.checked
  };

  localStorage.setItem(STORAGE_DRAFT, JSON.stringify(draft));
}

function restaurarBorrador() {
  const rawDraft = localStorage.getItem(STORAGE_DRAFT);
  if (!rawDraft) return;

  try {
    const draft = JSON.parse(rawDraft);

    nombrePaciente.value = draft.nombrePaciente || "";
    fechaAccidente.value = draft.fechaAccidente || "";
    companiaSoat.value = draft.companiaSoat || "";
    nombreEps.value = draft.nombreEps || "";
    celular.value = draft.celular || "";
    confirmarCelular.value = draft.confirmarCelular || "";
    diagnostico.value = draft.diagnostico || "";
    hechos.value = draft.hechos || "";
    confirmacionTelefono.checked = Boolean(draft.confirmacionTelefono);
  } catch (error) {
    console.error("No fue posible restaurar el borrador:", error);
    localStorage.removeItem(STORAGE_DRAFT);
  }
}

recordForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  limpiarMensaje();

  if (!validarFormulario()) {
    return;
  }

  const gestor = localStorage.getItem(STORAGE_GESTOR) || "GESTOR";
  const registro = construirRegistro();
  const csv = convertirRegistroACSV(registro);
  const archivo = crearArchivoCSV(csv, gestor);

  bloquearBotonEnvio(true);

  try {
    const resultado = await compartirODescargarArchivo(archivo);

    if (resultado.ok) {
      mostrarExito(resultado.message);
      limpiarFormulario();
    } else {
      mostrarError(resultado.message);
    }
  } catch (error) {
    console.error("Error al procesar el envío:", error);
    mostrarError("Ocurrió un error al generar o compartir el archivo.");
  } finally {
    bloquearBotonEnvio(false);
  }
});

function validarFormulario() {
  if (!nombrePaciente.value.trim()) {
    mostrarError("Ingrese el nombre del paciente.");
    nombrePaciente.focus();
    return false;
  }

  if (!fechaAccidente.value) {
    mostrarError("Seleccione la fecha del accidente.");
    fechaAccidente.focus();
    return false;
  }

  const telefono = celular.value.trim();
  const telefonoConfirmado = confirmarCelular.value.trim();

  if (!/^\d{10}$/.test(telefono)) {
    mostrarError("El número celular debe tener exactamente 10 dígitos.");
    celular.focus();
    return false;
  }

  if (!/^\d{10}$/.test(telefonoConfirmado)) {
    mostrarError("La confirmación del celular debe tener exactamente 10 dígitos.");
    confirmarCelular.focus();
    return false;
  }

  if (telefono !== telefonoConfirmado) {
    mostrarError("Los números de celular no coinciden.");
    confirmarCelular.focus();
    return false;
  }

  if (!confirmacionTelefono.checked) {
    mostrarError("Debe confirmar que verificó el número antes de enviar.");
    confirmacionTelefono.focus();
    return false;
  }

  return true;
}

function construirRegistro() {
  return {
    NombrePaciente: nombrePaciente.value.trim(),
    FechaAccidente: fechaAccidente.value,
    CompaniaSOAT: companiaSoat.value.trim(),
    NombreEPS: nombreEps.value.trim(),
    Celular: celular.value.trim(),
    Diagnostico: diagnostico.value.trim(),
    Hechos: hechos.value.trim()
  };
}

function convertirRegistroACSV(registro) {
  const encabezados = Object.keys(registro).join(",");
  const valores = Object.values(registro)
    .map((valor) => `"${String(valor).replace(/"/g, '""')}"`)
    .join(",");

  return `${encabezados}\n${valores}`;
}

function crearArchivoCSV(csv, gestor) {
  const ahora = new Date();
  const fecha = ahora.toISOString().slice(0, 10);
  const hora = ahora.toTimeString().slice(0, 8).replace(/:/g, "-");
  const nombreArchivo = `${gestor}_${fecha}_${hora}.csv`;

  const contenido = "\uFEFF" + csv;
  const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });

  return new File([blob], nombreArchivo, {
    type: "text/csv;charset=utf-8;"
  });
}

async function compartirODescargarArchivo(file) {
  const shareDisponible =
    navigator.share &&
    navigator.canShare &&
    navigator.canShare({ files: [file] });

  if (shareDisponible) {
    try {
      await navigator.share({
        title: "Registro Form2Go",
        text: "Registro generado desde Form2Go",
        files: [file]
      });

      return {
        ok: true,
        message: "Registro compartido correctamente."
      };
    } catch (error) {
      const cancelado = error && error.name === "AbortError";

      if (cancelado) {
        return {
          ok: false,
          message: "El envío fue cancelado. El formulario conserva los datos."
        };
      }

      descargarArchivo(file);
      return {
        ok: true,
        message: "No fue posible compartir. El archivo CSV se descargó como respaldo."
      };
    }
  }

  descargarArchivo(file);
  return {
    ok: true,
    message: "El dispositivo no admite compartir archivos. El CSV se descargó correctamente."
  };
}

function descargarArchivo(file) {
  const url = URL.createObjectURL(file);
  const enlace = document.createElement("a");

  enlace.href = url;
  enlace.download = file.name;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

function limpiarFormulario() {
  recordForm.reset();
  localStorage.removeItem(STORAGE_DRAFT);
}

function bloquearBotonEnvio(bloquear) {
  const boton = recordForm.querySelector('button[type="submit"]');
  if (!boton) return;

  boton.disabled = bloquear;
  boton.textContent = bloquear ? "PROCESANDO..." : "ENVIAR";
}

function mostrarError(mensaje) {
  if (formMessage) {
    formMessage.textContent = mensaje;
    formMessage.classList.remove("is-success");
  } else {
    alert(mensaje);
  }
}

function mostrarExito(mensaje) {
  if (formMessage) {
    formMessage.textContent = mensaje;
    formMessage.classList.add("is-success");
  } else {
    alert(mensaje);
  }
}

function limpiarMensaje() {
  if (!formMessage) return;
  formMessage.textContent = "";
  formMessage.classList.remove("is-success");
}
