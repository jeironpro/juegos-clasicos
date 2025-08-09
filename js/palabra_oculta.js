const filas = 6;
const columnas = 5;
const mensaje = document.getElementById("mensaje");
const tablero = document.getElementById("tablero");
const contenedorTeclado = document.getElementById("teclado");

let palabraSecreta = "";
let filaActual = 0;
let listaPalabras = [];
let juegoTerminado = false;

fetch("json/palabras_ocultas.json")
    .then(respuesta => {
        if (!respuesta.ok) {
            console.log(`Error al cargar las palabras: ${respuesta.status}`);
        }
        return respuesta.json();
    })

    .then(palabras => {
        listaPalabras = palabras;
        palabraSecreta = palabras[Math.floor(Math.random() * palabras.length)];
    })

    .catch(error => {
        console.log(`Error intentar cargar el JSON: ${error}`);
    })

for (let i = 0; i < filas; i++) {
    const fila = document.createElement("div");
    fila.classList.add("fila");
    
    for (let j = 0; j < columnas; j++) {
        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = 1;
        input.classList.add("casilla");
        input.dataset.fila = i;
        input.dataset.columna = j;

        input.disabled = i !== filaActual;
        
        input.addEventListener("input", (e) => {
            e.target.value = e.target.value.replace(/[^a-zA-ZñÑáéíóúÁÉÍÓÚüÜ]/g, "").toLowerCase();
            
            if (e.target.value && j < columnas - 1) {
                const siguienteCasilla = fila.children[j + 1];
                
                if (siguienteCasilla) {
                    siguienteCasilla.focus();
                }
            }
        });
        fila.appendChild(input);
    }
    tablero.appendChild(fila);
}
document.querySelector(".casilla").focus();

function verificarFila(numeroFila) {
    const fila = document.querySelectorAll(`.fila:nth-child(${numeroFila + 1}) .casilla`);
    
    let palabraIngresada = "";
    
    fila.forEach(casilla => palabraIngresada += casilla.value);
    
    if (palabraIngresada.length !== 5) {
        mostrarMensaje("Completa la palabra", "aviso");
        return;
    }
    
    if (!listaPalabras.includes(palabraIngresada)) {
        mostrarMensaje("Palabra no válida", "error");
        return;
    }
    
    const letrasSecretas = palabraSecreta.split('');
    const letrasIngresadas = palabraIngresada.split('');
    
    const usada = Array(5).fill(false);
    
    for (let i = 0; i < 5; i++) {
        fila[i].classList.remove("verde", "amarillo", "gris");

        if (letrasIngresadas[i] === letrasSecretas[i]) {
            fila[i].classList.add("verde");
            usada[i] = true;
        }
    }
    
    for (let i = 0; i < 5; i++) {
        if (fila[i].classList.contains("verde")) {
            continue;
        }

        const letra = letrasIngresadas[i];
        let encontrada = false;

        for (let j = 0; j < 5; j++) {
            if (!usada[j] && letra === letrasSecretas[j]) {
                encontrada = true;
                usada[j] = true;
                break;
            }
        }

        if (encontrada) {
            fila[i].classList.add("amarillo");
        } else {
            fila[i].classList.add("gris");
        }
    }

    if (palabraIngresada === palabraSecreta) {
        mostrarMensaje("Has acertado", "exito");
        juegoTerminado = true;
        return;
    }
    fila.forEach(casilla => casilla.disabled = true);
    filaActual += 1;

    if (filaActual < filas) {
        const siguienteFila = document.querySelectorAll(`.fila:nth-child(${filaActual + 1}) .casilla`);

        siguienteFila.forEach(casilla => casilla.disabled = false);

        if (siguienteFila.length > 0) {
            siguienteFila[0].focus();
        }
    } else {
        mostrarMensaje(`No has acertado. Palabra oculta: ${palabraSecreta}`, "error");
        juegoTerminado = true;
    }
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !juegoTerminado) {
        verificarFila(filaActual);

        const siguienteFila = document.querySelectorAll(`.fila:nth-child(${filaActual + 1}) .casilla`);

        if (siguienteFila.length > 0) {
            siguienteFila[0].focus();
        }
    }
});

function mostrarMensaje(texto, tipo = "") {
    mensaje.style.display = "block";
    mensaje.textContent = texto;
    mensaje.className = "mensaje";

    if (tipo) {
        mensaje.classList.add(tipo, "mensaje-palabra-oculta");
    }

    setTimeout(() => {
        mensaje.textContent = "";
        mensaje.className = "mensaje";
        mensaje.style.display = "none";
    }, 5000);
}

const teclas = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ñ"],
    ["z", "x", "c", "v", "b", "n", "m", "eliminar", "enviar"]
];

teclas.forEach(fila => {
    const filaTeclado = document.createElement("div");
    filaTeclado.classList.add("fila-teclado");

    fila.forEach(letra => {
        const boton = document.createElement("button");
        boton.classList.add("tecla");
        
        if (letra === "eliminar") {
            boton.classList.add("eliminar");
            boton.innerHTML = `<span class="material-symbols-outlined">backspace</span>`;
        } else if (letra === "enviar") {
            boton.classList.add("enviar");
            boton.innerHTML = `<span class="material-symbols-outlined">keyboard_return</span>`;
        } else {
            boton.textContent = letra;
        }
        boton.setAttribute("data-tecla", letra);
        filaTeclado.appendChild(boton);
    });
    
    contenedorTeclado.appendChild(filaTeclado);
});

contenedorTeclado.addEventListener("click", (e) => {
    const boton = e.target.closest("button");
    if (!boton) return;

    const tecla = boton.getAttribute("data-tecla");
    const fila = document.querySelectorAll(`.fila:nth-child(${filaActual + 1}) .casilla`);

    if (tecla === "eliminar") {
        for (let i = columnas - 1; i >= 0; i--) {
            if (fila[i].value !== "") {
                fila[i].value = "";
                fila[i].focus();
                break;
            }
        }
    } else if (tecla === "enviar") {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    } else {
        for (let i = 0; i < columnas; i++) {
            if (fila[i].value === "" && !fila[i].disabled) {
                fila[i].value = tecla;

                if (i < columnas - 1) {
                    fila[i + 1].focus();
                }
                break;
            }
        }
    }
});