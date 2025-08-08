const tablero = document.getElementById("tablero");
const mensaje = document.getElementById("mensaje");
const contenedorTeclado = document.getElementById("teclado");
const casillas = Array.from({ length: 9 }, () => Array(9));

let tableroCompleto = [];
let tableroVisible = [];
let tableroActual = Array.from({ length: 9 }, () => Array(9).fill(""));
let casillaActiva = null;

function crearTablero() {
    for (let i = 0; i < 9; i++) {
        const fila = document.createElement("div");
        fila.classList.add("fila", "fila-sudoku");

        for (let j = 0; j < 9; j++) {
            const input = document.createElement("input");
            input.type = "text";
            input.maxLength = 1;
            input.classList.add("casilla");
            input.dataset.fila = i;
            input.dataset.columna = j;

            if (i % 3 === 0) input.classList.add("borde-superior");
            if (j % 3 === 0) input.classList.add("borde-izquierdo");
            if (i === 8) input.classList.add("borde-inferior");
            if (j === 8) input.classList.add("borde-derecho");

            input.addEventListener("input", validarCasilla);

            input.addEventListener("focus", () => {
                casillaActiva = input;
            });

            casillas[i][j] = input;
            fila.appendChild(input);
        }
        tablero.appendChild(fila);
    }
}

function validarCasilla(e) {
    const input = e.target;
    input.classList.remove("invalido");
    const valorIngresado = input.value;

    if (!/^[1-9]$/.test(valorIngresado)) {
        input.value = "";
        return;
    }

    const fila = parseInt(input.dataset.fila);
    const columna = parseInt(input.dataset.columna);
    const valorCorrecto = tableroCompleto[fila][columna];

    if (valorIngresado !== valorCorrecto) {
        input.classList.add("invalido");
    }

    if (validarSudoku()) {
        mostrarMensaje("¡Has ganado!", "exito");
    }
}

function mostrarTablero() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const input = casillas[i][j];
            input.value = tableroActual[i][j];

            input.classList.remove("casilla-llena");
            if (tableroActual[i][j] !== "") {
                input.classList.add("casilla-llena");
                input.disabled = true;
            } else {
                input.disabled = false;
            }
        }
    }
}

function cargarSudoku() {
    fetch("json/sudokus.json")
        .then(respuesta => {
            if (!respuesta.ok) {
                console.log(`Error al intentar cargar los tableros: ${respuesta.status}`);
                throw new Error("Error al cargar sudoku");
            }
            return respuesta.json();
        })
        .then(sudokus => {
            const id = Math.floor(Math.random() * sudokus.length);
            console.log("ID: ", id);
            const sudoku = sudokus[id];

            tableroCompleto = sudoku.completo;
            tableroVisible = sudoku.visible;

            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    tableroActual[i][j] = tableroVisible[i][j];
                }
            }
            mostrarTablero();
        })
        .catch(error => {
            console.log(`Error al intentar cargar el JSON: ${error}`);
        });
}

function validarSudoku() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (casillas[i][j].value.trim() === "") return false;

            if (casillas[i][j].value !== tableroCompleto[i][j]) return false;
        }
    }
    return true;
}

function mostrarMensaje(texto, tipo = "") {
    mensaje.style.display = "block";
    mensaje.textContent = texto;
    mensaje.className = "mensaje";

    if (tipo) {
        mensaje.classList.add(tipo, "mensaje-sudoku");
    }

    setTimeout(() => {
        mensaje.textContent = "";
        mensaje.className = "mensaje";
        mensaje.style.display = "none";
    }, 5000);
}

function moverFocoSiguiente() {
    let fila = parseInt(casillaActiva.dataset.fila);
    let columna = parseInt(casillaActiva.dataset.columna);

    for (let i = fila; i < 9; i++) {
        for (let j = (i === fila ? columna + 1 : 0); j < 9; j++) {
            const siguiente = casillas[i][j];
            if (!siguiente.disabled) {
                siguiente.focus();
                casillaActiva = siguiente;
                return;
            }
        }
    }
}

const teclas = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["eliminar", "enviar"]
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
    if (!casillaActiva || casillaActiva.disabled) return;

    if (tecla === "eliminar") {
        casillaActiva.value = "";
        casillaActiva.focus();
        casillaActiva.classList.remove("invalido");
    } else if (tecla === "enviar") {
        if (validarSudoku()) {
            mostrarMensaje("¡Has ganado!", "exito");
        } else {
            mostrarMensaje("Aún hay errores o casillas vacías", "error");
        }
    } else {
        if (/^[1-9]$/.test(tecla)) {
            casillaActiva.value = tecla;

            const fila = parseInt(casillaActiva.dataset.fila);
            const columna = parseInt(casillaActiva.dataset.columna);
            const valorCorrecto = tableroCompleto[fila][columna];

            if (tecla !== valorCorrecto) {
                casillaActiva.classList.add("invalido");
                casillaActiva.focus();
            } else {
                casillaActiva.classList.remove("invalido");
                casillaActiva.dispatchEvent(new Event("input"));
                moverFocoSiguiente();
            }
        }
    }
});

crearTablero();
cargarSudoku();