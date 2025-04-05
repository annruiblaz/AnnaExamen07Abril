// Variables globales para gestionar el juego
let bird, bgGame, pipeBottom;
let velocity = 0;
let gravity = 0.6;
let jumpPower = -20;
let pipes = [];
let pipeGap = 100; // Espacio constante entre tuberías
let velocityPipes = 2;
let numPipes = 4; // Número de tuberías reutilizables
let pipeWidth = 50; // Ancho de la imagen de la tubería
let neat;
let bestScore = 0;
let generation = 0;
let flappysAlive = 0;

// Precarga las imágenes del juego
function preload() {
	bgGame = loadImage("/assets/background.png");
	bird = loadImage("/assets/flappy.png");
	pipeBottom = loadImage("/assets/pipe_bottom.png");
}

// config inicial del juego
function setup() {
	createCanvas(500, 600); //creamos el canvas
	createPipes();//y las pipes iniciales
	const neatTest = new neataptic.Neat(1, 1, { popSize: 100 });
	console.log("Población en prueba neatTest:", neatTest.population.length); // Debería ser 10

	//inicializamos neat con una red d 3 inputs, 1 output y la config
	neat = new neataptic.Neat(3, 1, {
		mutationRate: 0.2, //% d mutacion en cada geneeracion
		popSize: 20, //tamaño d la pop d redes neuronales
		elitism: 2, //num d individuos q se preservan sin cambios
		mutationAmount: 2 //num d mutaciones aplicadas a cada individuo
	});

	console.log("Población ANTES de resetGame:", neat.population.length);
	//inicializa el juego
	resetGame();
	console.log("Población DESPUÉS de resetGame:", neat.population.length);
}

function createPipes() {
	// crea las pipes en distintas posiciones
	for (let i = 0; i < numPipes  ; i++) {
		pipes.push(new Pipe(200 * i));
	}
}

// Bucle principal del juego
function draw() {
	background(bgGame); //pintamos el fondo

	flappysAlive = 0; //reseteo el num d flappys vivos

	// Mueve y dibuja cada tubería
	for (let i = 0; i < pipes.length; i++) {
		pipes[i].move();
		pipes[i].show();

		// Reubica las tuberías cuando salen de la pantalla
		if (pipes[i].offCanvas()) {
			let ultimaX = Math.max(...pipes.map(t => t.xStart + pipeWidth));
			pipes[i].reiniciar(ultimaX + pipeGap + pipeWidth);
		}

		//pinta lineas para visualizar los puntos q utilizo d ref d dnd está el flappy
		//stroke('#FFF');
		//line(95, 0, 95, 600); // x izq
		//line(145, 0, 145, 600);// x derecha
		//line(95, pipes[0].posY -32, 145, pipes[0].posY -32); //punto d "altura d la pipe" q es dnd se posiciona el flappy
	}

	//bool q controla el estado d los flappys
	let allDead = true;

	//iteramos cada individuo de la pop
	for(let genome of neat.population) {
		let flappy = genome.bird; //y almacenamos el flappy d cada uno

		//comprobamos si esta vivo
		if(!flappy.dead) {
			allDead = false; //ponemos la bool q controla el estado general a false
			flappysAlive ++; //sumamos ese flappy al total

			//actualizamos y mostramos el flappy (lo hago solo si sigue
			// vivo xq queda feo q los q han "muerto" se vean siempre en el borde chocando con las pipes)
			flappy.update();
			flappy.show();
			genome.score ++; //y le sumamos 1 a su puntuación

			//si la puntuación del flappy actual supera el record
			if(genome.score > bestScore) {
				bestScore = genome.score; //actualizamos el valor del record con la puntuacion del flappy 
			}
		}
	}

	//si no ha sobrevivido ningun flappy
	if(allDead) {
		nextGeneration(); //creamos una nueva generacion
	}

	//actualiza los datos q se ven en el front
	showData();
}

//pinta los datos en el canvas
function showData() {
	//props d p5 para mostrar + facil los datos
	fill('#000');
	textSize(16);
	text(`Generación: ${generation}`, 10, 20);
	text(`Record Total: ${bestScore}`, 10, 40);
	text(`Flappys vivos: ${flappysAlive}`, 10, 60);
}

function resetGame() {
	//eliminamos pipes y las volvemos a crear
	pipes = [];
	createPipes();

	for( let genome of neat.population) {
		genome.y = 200; //colocamos el flappy en su y inicial
		genome.dead = false; //para q el flappy esté vivo
		genome.score = 0; //reiniciamos la puntuación
		genome.hasJumped = false;//reiniciamos el estado de salto
		genome.bird = new Flappy(genome); //creamos un nuevo flappy para cada individuo
	}

	console.log('Neat.population', neat.population);
}

function nextGeneration() {
	generation ++; //aumentamos num d gen
	neat.evolve(); //evolucionamos la pop usando neat
	resetGame();//reiniciamos con la nueva gen
}

// Clase que representa las tuberías
class Pipe {
	constructor(lastX) {
		this.xStart = lastX + pipeGap;
		this.posY = height - 200;
	}

	// Mueve la tubería hacia la izquierda
	move() {
		this.xStart -= velocityPipes  ;
	}

	// Dibuja la tubería en pantalla
	show() {
		image(pipeBottom, this.xStart, this.posY, pipeWidth, pipeBottom.height);
	}

	// Verifica si la tubería ha salido de la pantalla
	offCanvas() {
		return this.xStart < -pipeWidth;
	}

	// Reposiciona la tubería a la derecha de la pantalla con separación constante
	reiniciar(nuevaX) {
		this.xStart = nuevaX;
	}
}

//clase para los flappys
class Flappy {
	constructor(genome) {
		this.x = 100; //posicion inicial en el eje x
		this.y = 200; //inicial en el eje y
		this.alto = 30;
		this.ancho = 40;
		this.velocity = velocity;
		this.gravity = gravity;
		this.jumpPower = jumpPower;
		this.score = 0; //para luego seleccionar los mejores
		this.dead = false; //para ver si esta vivo o no (si cae entre los huecos)
		this.hasJumped = false; //controla si el flappy ya ha saltado sobre la pipe
		this.canJump = false; //controla el doble salto
		this.brain = genome; //asignamos la red neuronal al flappy
	}

	update() {
		// Aplica la gravedad al pájaro
		this.velocity += this.gravity;
		this.y += this.velocity;

 		let inputs = this.getInputs(); //obtenemos los inputs para la red ( eje x, y de la pipe + posicion y del flappy)
		//console.log('Inputs: ', inputs);

		let output = this.brain.activate(inputs); //activamos la red neuronal con los inputs y almacenamos su output
		//console.log('Output: ', output);

		//comprobamos si el output es > 0.5 y
		// la flag canJump es true, debe saltar
		if(output > 0.5 && this.canJump) {
			this.velocity = this.jumpPower; //aplicamos el salto
			this.canJump = false; //desactivamos la flag para evitar q de un doble salto
			this.hasJumped = true;
		}

		this.checkCollision();
	}

	checkCollision() {
		//console.log('Dentro de checkCollision flappy');

		 //comprueba colisión con el suelo ya q es el unico momento 
		 // en el q el flappy muere
		if (this.y > height - 30) { //si su altura es mayor q el canvas - altura del flappy (xq caeria del canvas)
            this.y = height - 30;//le posicionamos en el borde inferior
            this.velocity = 0;//para evitar q siga cayendo
            this.dead = true; //actualizamos su valor en dead
            return;
        }

		// comprobamos la colisión con las pipes
        for (let i = 0; i < pipes.length; i++) {
            const pipe = pipes[i];
            
            // Comprueba si la pipe está en el espacio del flappy (95-145px del canvas)
            if (pipe.xStart + pipeWidth >= 95 && pipe.xStart <= 145) {
                let pipeHeight = pipe.posY - 32; // almacena la altura de la pipe  - 32 (para ajustar cuando s posiciona el flappy)

                //si el flappy esta x encima de la pipe (en el eje y)
                if (this.y < pipe.posY) {
					//si no ha saltado aun y esta sobre la pipe
                    if (this.y >= pipeHeight && !this.hasJumped) {
                        this.y = pipeHeight; //lo mantenemos "estatico" sobre la altura d la pipe
                        this.velocity = 0;//paramos la caida
                        this.canJump = true;//activamos el salto (con la flag evitamos q pueda hacer doble salto)
						return;
                    } else { //si ha saltado
                        this.canJump = false; //desactivamos la flag
                        this.hasJumped = false; //permitimos q pueda saltar + mantenerse en la siguiente pipe
						return;
                    }
                }
            } else { //si la pipe no esta dnd el flappy (xq flappy esta entre el hueco de las pipes)
                // y si el flappy esta x debajo de la altura de la pipe (  en el hueco)
                if (this.y > pipe.posY) {
                    this.canJump = false; //desactivamos para q el flappy no salte mientras cae y s salve (xq seria hacer trampa)
					return;
                }
            }
        }
	}

	show() {
		// pinta el flappy img, x, y, width, height
		image(bird, this.x, this.y, this.ancho, this.alto);
	}

	getInputs() {
		//xdefecto la mas cercana (al iniciar) es siempre la 1
		//ya q siempre cae sobre la 0
		let closestPipe = pipes[1];

		//almacenamos la distancia entre el flappy y la siguiente pipe
		let distanceToPipe = closestPipe.xStart - this.x;

		//iteramos sobre las pipes
		for(let pipe of pipes) {
			//si está en el rango d delante del flappy y menor q 
			// delante del flappy (145) + el ancho d la pipe + el espacio entre pipes
			if(pipe.xStart > 145 && pipe.xStart <= 145 + pipeGap + pipeWidth) {
				closestPipe = pipe; //asignamos esa pipe q entra en el rango como la + cercana
			}
		}

		//pinta una linea en el punto d ref q obtiene de la pipe + cercana
		//ignoralo q es para comprobar q lo detecta bien :)
		//stroke('red');
		//line(closestPipe.xStart, 0, closestPipe.xStart, 600);

		//devuelve un array con los valores numericos d referencia
		return [
			parseInt(this.y.toFixed()), //la posicion actual del flappy en el eje y
			parseInt(distanceToPipe.toFixed()), //la distancia entre el flappy y la siguiente pipe (+ cercana)
			parseInt(closestPipe.posY), //el valor d la parte superior d la pipe (en el eje y)
			parseInt(closestPipe.xStart.toFixed()), //el valor sin decimales de la posicion x d la pipe + cercana
		];
	}
}
