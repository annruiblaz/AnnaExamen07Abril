// Variables globales para gestionar el juego
let pajaro, fondo, tuberiaInferior;
let posPajaroY = 300;
let velocidad = 0;
let gravedad = 0.6 ;
let fuerzaSalto = -20;
let tuberias = [];
let espacioTuberias = 100; // Espacio constante entre tuberías
let velocidadTuberias = 1.5  ;
let cantidadTuberias = 4; // Número de tuberías reutilizables
let anchoTuberia = 50; // Ancho de la imagen de la tubería
let canJump = true;

// Precarga las imágenes del juego
function preload() {
	fondo = loadImage("/assets/background.png");
	pajaro = loadImage("/assets/flappy.png");
	tuberiaInferior = loadImage("/assets/pipe_bottom.png");
}

// Configuración inicial del juego
function setup() {
	createCanvas(500, 600);
	// Inicializa las tuberías en distintas posiciones
    tuberias.push(new Tuberia(130));
    tuberias.push(new Tuberia(130 + anchoTuberia + espacioTuberias));
    tuberias.push(new Tuberia(130+ (anchoTuberia + espacioTuberias) * 2));
    tuberias.push(new Tuberia(130+ (anchoTuberia + espacioTuberias) * 3));


/* 	for (let i = 0; i < cantidadTuberias; i++) {
		tuberias.push(new Tuberia(i * (espacioTuberias + anchoTuberia) + width));
	} */
}

// Bucle principal del juego
function draw() {
	background(fondo);

	// Mueve y dibuja cada tubería
	for (let i = 0; i < tuberias.length; i++) {
		tuberias[i].mover();
		tuberias[i].mostrar();
		// Reubica las tuberías cuando salen de la pantalla
		if (tuberias[i].fueraPantalla()) {
			let ultimaX = Math.max(...tuberias.map(t => t.x)); // Encuentra la tubería más a la derecha
			tuberias[i].reiniciar(ultimaX + espacioTuberias + anchoTuberia);
		}

        //TODO: revisar para dar + margen
		//comprueba si la tuberia se encuentra en el espacio del flappy (100-140px del canvas)
        if(tuberias[i].x >= 80  && tuberias[i].x <= 130 ) {
            //console.log('La pipe está en el eje x a la altura del flappy');

/*             console.log('PosY de la pipe', tuberias[i].posY);
            console.log('PosY de flappy', posPajaroY); */
			//si el flappy esta por encima de la pipe (en el eje y)
            if(posPajaroY < tuberias[i].posY) {
                //console.log('Flappy sobre pipe');
				if(posPajaroY >=   tuberias[i].posY - 32 ) {
					posPajaroY = tuberias[i].posY - 32;
					velocidad = 0;
					canJump = true;
				} else {
					canJump = false;
				}
            }
        } else {//si la tuberia no se encuentra dnd el flappy (es decir está entre el hueco d las tuberias)
			//y si el flappy se encuentra x abajo d la altura de la tuberia (está en el hueco)
            if(posPajaroY > tuberias[i].posY) {
				canJump = false;
            }
        }

		//pinta un circulo dnd en el punto en el q coinciden el flappy y la pipe
		if(canJump) {
			fill(255, 0, 0);
			ellipse(120, tuberias[i].posY - 15, 10, 10);
		}
	}   

	// pinta el flappy img, x, y, width, height
	image(pajaro, 100, posPajaroY, 40, 30);
	
	// Aplica la gravedad al pájaro
	velocidad += gravedad;
	posPajaroY += velocidad;

	// Evita que el pájaro caiga fuera de la pantalla
	if (posPajaroY > height - 30) {
		posPajaroY = height - 30;
		velocidad = 0;
	}

	mostrarDatos();
}

function mostrarDatos() {
    fill('#000');
    textSize(16);
    text(`posPajaroY: ${posPajaroY.toFixed(1)}`, 20, 20);
    text(`velocidad: ${velocidad.toFixed(1)}`, 20, 40);
    text(`canJump: ${canJump}`, 20, 60);
}


// Función que detecta cuando se presiona una tecla
function keyPressed() {
	if (key == ' ' && canJump) {
		velocidad = fuerzaSalto;
        checkCollision();
		canJump = false;
	}
}

function checkCollision() {

}

//clase para los flappys
class Flappy {

}

// Clase que representa las tuberías
class Tuberia {
	constructor(x) {
		this.x = x;
		this.posY = height - 200;
	}

	// Mueve la tubería hacia la izquierda
	mover() {
		this.x -= velocidadTuberias;
	}

	// Dibuja la tubería en pantalla
	mostrar() {
		image(tuberiaInferior, this.x, this.posY, anchoTuberia, tuberiaInferior.height);
	}

	// Verifica si la tubería ha salido de la pantalla
	fueraPantalla() {
		return this.x < -anchoTuberia;
	}

	// Reposiciona la tubería a la derecha de la pantalla con separación constante
	reiniciar(nuevaX) {
		this.x = nuevaX;
	}
}