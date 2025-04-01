// Variables globales para gestionar el juego
let pajaro, fondo, tuberiaInferior;
let posPajaroY = 200;
let velocidad = 0;
let gravedad = 0.6;
let fuerzaSalto = -20;
let tuberias = [];
let espacioTuberias = 100; // Espacio constante entre tuberías
let velocidadTuberias = 1.5;
let cantidadTuberias = 4; // Número de tuberías reutilizables
let anchoTuberia = 50; // Ancho de la imagen de la tubería
let canJump = true;
let neat;
let pruebaFlappy;
let bestScore = 0;
let pipeHeight;

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
	tuberias.push(new Tuberia(150));
	tuberias.push(new Tuberia(150 + anchoTuberia + espacioTuberias));
	tuberias.push(new Tuberia(150 + (anchoTuberia + espacioTuberias) * 2));
	tuberias.push(new Tuberia(150 + (anchoTuberia + espacioTuberias) * 3));

/* 	for (let i = 0; i < cantidadTuberias; i++) {
		tuberias.push(new Tuberia(i * (espacioTuberias + anchoTuberia) + width));
	} */

	pipeHeight = (tuberias[0].posY -32);

	pruebaFlappy = new Flappy();
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
			let ultimaX = Math.max(...tuberias.map(t => t.xStart+ anchoTuberia));
			tuberias[i].reiniciar(ultimaX + espacioTuberias + anchoTuberia);
		}

		//TODO: revisar para dar + margen
		//comprueba si la tuberia se encuentra en el espacio del flappy (100-140px del canvas)
		if (tuberias[i].xStart+50 >= 95 && tuberias[i].xStart <= 145) {
			//console.log('La pipe está en el eje x a la altura del flappy');

			//para comprobar q x estamos detectando!
			stroke('red');
			line(parseInt(tuberias[i].xStart+50).toFixed(), 0, parseInt(tuberias[i].xStart+50).toFixed(), 600);// x derecha
			line(parseInt(tuberias[i].xStart).toFixed(), 0, parseInt(tuberias[i].xStart).toFixed(), 600);// x derecha

			//si el flappy esta por encima de la pipe (en el eje y)
			if (pruebaFlappy.y < tuberias[i].posY) {
				//console.log('Flappy sobre pipe');
				if (pruebaFlappy.y >= pipeHeight) {
					pruebaFlappy.y = pipeHeight;
					pruebaFlappy.velocidad = 0;
					canJump = true;
				} else {
					canJump = false;
				}
			}
		} else { //si la tuberia no se encuentra dnd el flappy (es decir está entre el hueco d las tuberias)
			//y si el flappy se encuentra x abajo d la altura de la tuberia (está en el hueco)
			if (pruebaFlappy.y > tuberias[i].posY) {
				canJump = false;
				pruebaFlappy.estaVivo = false;
				pruebaFlappy.puntuacion = 0;
			}
		}

		if(pruebaFlappy.estaVivo) {
			pruebaFlappy.puntuacion ++;
		}

		//pinta lineas para visualizar los puntos q utilizo d ref
		stroke('#FFF');
		line(95, 0, 95, 600); // x izq
		//line(145, 0, 145, 600);// x derecha
		line(95, pipeHeight, 145, pipeHeight); //punto d "altura d la pipe" q es dnd se posiciona el flappy

	}

	// pinta la img del flappy
	pruebaFlappy.show();
	// Aplica la gravedad al flappy
	pruebaFlappy.update();

	if(pruebaFlappy.puntuacion > bestScore) {
		bestScore = pruebaFlappy.puntuacion;
	}

	// Evita que el flappy caiga fuera de la pantalla
	if (pruebaFlappy.y > height - 30) {
		pruebaFlappy.y = height - 30;
		pruebaFlappy.velocidad = 0;
		pruebaFlappy.estaVivo = false;
	}

	mostrarDatos();
}

function mostrarDatos() {
	fill('#000');
	textSize(16);
	text(`Flappy y: ${posPajaroY.toFixed(1)}`, 10, 20);
	text(`Velocidad: ${velocidad.toFixed(1)}`, 10, 40);
	text(`canJump: ${canJump}`, 10, 60);
	text(`Puntuación Flappy: ${bestScore}`, 10, 80);
	text(`Record Total: ${bestScore}`, 10, 100);

}


// Función que detecta cuando se presiona una tecla
function keyPressed() {
	console.log('Tecla pulsado');
	if (key == ' ' && canJump) {
		console.log('Spacebar Pulsado y puede saltar');
		console.log(`Velocidad: ${pruebaFlappy.velocidad} Fuerza salto: ${pruebaFlappy.fuerzaSalto}`);

		pruebaFlappy.velocidad = pruebaFlappy.fuerzaSalto;
		canJump = false;
		console.log(`Salto realizado: Velocidad: ${pruebaFlappy.velocidad} Fuerza salto: ${pruebaFlappy.fuerzaSalto}`);

	}
}

// Clase que representa las tuberías
class Tuberia {
	constructor(xStart) {
		this.xStart = xStart;
		this.xEnd = this.xStart + 50;
		this.posY = height - 200;
	}

	// Mueve la tubería hacia la izquierda
	mover() {
		this.xStart -= velocidadTuberias;
	}

	// Dibuja la tubería en pantalla
	mostrar() {
		image(tuberiaInferior, this.xStart, this.posY, anchoTuberia, tuberiaInferior.height);
	}

	// Verifica si la tubería ha salido de la pantalla
	fueraPantalla() {
		return this.xStart < -anchoTuberia;
	}

	// Reposiciona la tubería a la derecha de la pantalla con separación constante
	reiniciar(nuevaX) {
		this.xStart = nuevaX;
	}
}

//clase para los flappys
class Flappy {
	constructor() {
		this.x = 100;
		this.y = 200;
		this.alto = 30;
		this.ancho = 40;
		this.velocidad = velocidad;
		this.gravedad = gravedad;
		this.fuerzaSalto = fuerzaSalto;
		this.puntuacion = 0;
		this.estaVivo = true;
	}

	update() {
		// Aplica la gravedad al pájaro
		this.velocidad += this.gravedad;
		this.y += this.velocidad;
		this.checkCollision();
	}

	checkCollision() {
		//console.log('Dentro de checkCollision flappy');
	}

	show() {
		// pinta el flappy img, x, y, width, height
		image(pajaro, this.x, this.y, this.ancho, this.alto);
	}
}
