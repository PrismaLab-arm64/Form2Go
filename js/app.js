const loginForm=document.getElementById("loginForm")
const recordForm=document.getElementById("recordForm")

const loginView=document.getElementById("loginView")
const formView=document.getElementById("formView")

const gestorActivo=document.getElementById("gestorActivo")

loginForm.addEventListener("submit",e=>{

e.preventDefault()

const codigo=document.getElementById("codigoGestor").value

localStorage.setItem("gestor",codigo)

gestorActivo.textContent=codigo

loginView.style.display="none"
formView.style.display="block"

})


recordForm.addEventListener("submit",e=>{

e.preventDefault()

const telefono=document.getElementById("celular").value
const telefono2=document.getElementById("confirmarCelular").value

if(telefono!==telefono2){

alert("Los números no coinciden")
return

}

if(!document.getElementById("confirmacionTelefono").checked){

alert("Debe confirmar el número")

return

}

const data={

nombre:document.getElementById("nombrePaciente").value,
fecha:document.getElementById("fechaAccidente").value,
soat:document.getElementById("companiaSoat").value,
eps:document.getElementById("nombreEps").value,
celular:telefono,
diagnostico:document.getElementById("diagnostico").value,
hechos:document.getElementById("hechos").value

}

const csv=Object.values(data).join(",")

const blob=new Blob([csv],{type:"text/csv"})

const file=new File([blob],"registro.csv")

if(navigator.share){

navigator.share({files:[file]})

}

recordForm.reset()

})
