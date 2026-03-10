const loginForm = document.getElementById("loginForm");
const recordForm = document.getElementById("recordForm");
const loginView = document.getElementById("loginView");
const formView = document.getElementById("formView");

const gestorInput = document.getElementById("codigoGestor");
const gestorActivo = document.getElementById("gestorActivo");
const installBtn = document.getElementById("installBtn");

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

let deferredInstallPrompt = null;

document.addEventListener("DOMContentLoaded", () => {
  restaurarSesion();
  restaurarBorrador();
  registrarEventosDeAutoguardado();
  registrarInstalacionPwa();
});

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

recordForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  limpiarMensaje();
  limpiarEstadosInvalidos();

  if (!validarFormulario()) {
    return;
  }

  const gestor = (localStorage.getItem(STORAGE_GESTOR) || "GESTOR").trim().toUpperCase();
  const registro = construirRegistro();
  const timestamp = obtenerMarcaDeTiempo();

  const csvContent = convertirRegistroACSV(registro);
  const tsvContent = convertirRegistroATSV(registro);

  const csvFile = crearArchivoPlano(
    csvContent,
    `${gestor}_${timestamp}.csv`,
    "text/csv;charset=utf-8;"
  );

  const tsvFile = crearArchivoPlano(
    tsvContent,
    `${gestor}_${timestamp}.tsv`,
    "text/tab-separated-values;charset=utf-8;"
  );

  bloquearBotonEnvio(true);

  try {
    const resultado = await compartirORespaldar({
      csvFile,
      tsvFile
    });

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

function restaurarSesion() {
  const gestorGuardado = localStorage.getItem(STORAGE_GESTOR);

  if (!gestorGuardado) return;

  gestorInput.value = gestorGuardado;
  iniciarSesion(gestorGuardado);
}

function iniciarSesion(codigo) {
  if (gestorActivo) {
    gestorActivo.textContent = codigo;
  }

  loginView.style.display = "none";
  formView.style.display = "block";
  formView.hidden = false;
}

function registrarInstalacionPwa() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;

    if (installBtn) {
      installBtn.hidden = false;
    }
  });

  if (installBtn) {
    installBtn.addEventListener("click", async () => {
      if (!deferredInstallPrompt) return;

      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;

      if (choice.outcome === "accepted") {
        installBtn.hidden = true;
      }

      deferredInstallPrompt = null;
    });
  }

  window.addEventListener("appinstalled", () => {
    if (installBtn) {
      installBtn.hidden = true;
    }
    deferredInstallPrompt = null;
  });
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
        validarTelefonosEnVivo();
      }

      limpiarMensaje();
      limpiarInvalido(campo);
      guardarBorrador();
    });
  });

  window.addEventListener("beforeunload", guardarBorrador);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      guardarBorrador();
    }
  });
}

function normalizarTelefono(input) {
  input.value = String(input.value || "").replace(/\D/g, "").slice(0, 10);
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

    validarTelefonosEnVivo();
  } catch (error) {
    console.error("No fue posible restaurar el borrador:", error);
    localStorage.removeItem(STORAGE_DRAFT);
  }
}

function validarFormulario() {
  const nombre = nombrePaciente.value.trim();
  const fecha = fechaAccidente.value;
  const telefono = celular.value.trim();
  const telefonoConfirmado = confirmarCelular.value.trim();

  if (!nombre) {
    marcarInvalido(nombrePaciente);
    mostrarError("Ingrese el nombre del paciente.");
    nombrePaciente.focus();
    return false;
  }

  if (!fecha) {
    marcarInvalido(fechaAccidente);
    mostrarError("Seleccione la fecha del accidente.");
    fechaAccidente.focus();
    return false;
  }

  if (!/^\d{10}$/.test(telefono)) {
    marcarInvalido(celular);
    mostrarError("El número celular debe tener exactamente 10 dígitos.");
    celular.focus();
    return false;
  }

  if (!/^\d{10}$/.test(telefonoConfirmado)) {
    marcarInvalido(confirmarCelular);
    mostrarError("La confirmación del celular debe tener exactamente 10 dígitos.");
    confirmarCelular.focus();
    return false;
  }

  if (telefono !== telefonoConfirmado) {
    marcarInvalido(celular);
    marcarInvalido(confirmarCelular);
    mostrarError("Los números de celular no coinciden.");
    confirmarCelular.focus();
    return false;
  }

  if (!confirmacionTelefono.checked) {
    marcarInvalido(confirmacionTelefono);
    mostrarError("Debe confirmar que verificó el número de teléfono antes de enviar.");
    confirmacionTelefono.focus();
    return false;
  }

  return true;
}

function validarTelefonosEnVivo() {
  limpiarInvalido(celular);
  limpiarInvalido(confirmarCelular);

  const telefono = celular.value.trim();
  const telefonoConfirmado = confirmarCelular.value.trim();

  if (!telefono && !telefonoConfirmado) return;

  if (telefono && !/^\d{0,10}$/.test(telefono)) {
    marcarInvalido(celular);
  }

  if (telefonoConfirmado && !/^\d{0,10}$/.test(telefonoConfirmado)) {
    marcarInvalido(confirmarCelular);
  }

  if (telefono.length === 10 && telefonoConfirmado.length === 10 && telefono !== telefonoConfirmado) {
    marcarInvalido(celular);
    marcarInvalido(confirmarCelular);
  }
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

function convertirRegistroATSV(registro) {
  const encabezados = Object.keys(registro).join("\t");
  const valores = Object.values(registro)
    .map((valor) => String(valor).replace(/\t/g, " ").replace(/\r?\n/g, " "))
    .join("\t");

  return `${encabezados}\n${valores}`;
}

function obtenerMarcaDeTiempo() {
  const ahora = new Date();
  const fecha = ahora.toISOString().slice(0, 10);
  const hora = ahora.toTimeString().slice(0, 8).replace(/:/g, "-");
  return `${fecha}_${hora}`;
}

function crearArchivoPlano(contenido, nombreArchivo, tipoMime) {
  const contenidoConBom = "\uFEFF" + contenido;
  const blob = new Blob([contenidoConBom], { type: tipoMime });
  return new File([blob], nombreArchivo, { type: tipoMime });
}

async function compartirORespaldar({ csvFile, tsvFile }) {
  const soportaShare = typeof navigator !== "undefined" && typeof navigator.share === "function";
  const soportaCanShare = typeof navigator !== "undefined" && typeof navigator.canShare === "function";

  if (soportaShare && soportaCanShare) {
    const shareDataArchivo = {
      title: "Registro Form2Go",
      text: "Registro generado desde Form2Go.",
      files: [csvFile]
    };

    if (navigator.canShare(shareDataArchivo)) {
      try {
        await navigator.share(shareDataArchivo);
        return {
          ok: true,
          message: "Registro compartido correctamente."
        };
      } catch (error) {
        if (error && error.name === "AbortError") {
          return {
            ok: false,
            message: "El envío fue cancelado. El formulario conserva los datos."
          };
        }
      }
    }
  }

  descargarArchivo(csvFile);
  descargarArchivo(tsvFile);

  if (soportaShare) {
    try {
      await navigator.share({
        title: "Registro Form2Go",
        text: "No fue posible compartir el archivo directamente. El CSV y el TSV se descargaron en la carpeta Descargas del dispositivo. Adjunte el archivo manualmente en WhatsApp."
      });

      return {
        ok: true,
        message: "Se descargaron los archivos y se abrió la hoja de compartir para continuar por WhatsApp."
      };
    } catch (error) {
      if (error && error.name === "AbortError") {
        return {
          ok: false,
          message: "Se descargaron los archivos, pero se canceló la acción de compartir."
        };
      }
    }
  }

  return {
    ok: true,
    message: "Este dispositivo no admite compartir archivos directamente. Se descargaron CSV y TSV como respaldo en Descargas."
  };
}

function descargarArchivo(file) {
  const url = URL.createObjectURL(file);
  const enlace = document.createElement("a");

  enlace.href = url;
  enlace.download = file.name;
  enlace.style.display = "none";

  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);

  setTimeout(() => URL.revokeObjectURL(url), 1200);
}

function limpiarFormulario() {
  recordForm.reset();
  localStorage.removeItem(STORAGE_DRAFT);
  limpiarEstadosInvalidos();
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

function marcarInvalido(elemento) {
  if (!elemento) return;

  if (elemento.type === "checkbox") {
    elemento.closest(".checkbox-group")?.classList.add("is-invalid");
    return;
  }

  elemento.classList.add("is-invalid");
}

function limpiarInvalido(elemento) {
  if (!elemento) return;

  if (elemento.type === "checkbox") {
    elemento.closest(".checkbox-group")?.classList.remove("is-invalid");
    return;
  }

  elemento.classList.remove("is-invalid");
}

function limpiarEstadosInvalidos() {
  [
    nombrePaciente,
    fechaAccidente,
    companiaSoat,
    nombreEps,
    celular,
    confirmarCelular,
    diagnostico,
    hechos,
    confirmacionTelefono
  ].forEach(limpiarInvalido);
}
