# 🐦 Flappy Bird IA con Neataptic y p5.js
## 🌟 Funcionalidades Clave

- 🤖 Entrenamiento evolutivo usando NEAT (NeuroEvolution of Augmenting Topologies)
- 🧠 Inteligencia Artificial adaptativa que aprende a volar sin supervisión
- 🎮 Simulación interactiva tipo Flappy Bird en entorno gráfico p5.js
- 📊 Visualización en tiempo real de métricas como generación, puntaje y cantidad de redes activas
- 🔄 Mutación dinámica y evolución de redes neuronales en función del rendimiento


## 🧩 Componentes Principales
### 1. Configuración NEAT
```javascript
neat = new neataptic.Neat(5, 1, {
  mutationRate: 0.3,  // Probabilidad de mutación
  popSize: 50,        // 50 individuos por generación
  elitism: 5,         // Los 5 mejores pasan sin cambios
  mutationAmount: 2   // Intensidad de las mutaciones
});
```

### 2. Arquitectura Neuronal

| Componente | Descripción |
|------------|-------------|
| 5 inputs   | Posición Y, distancias a tuberías ... |
| 1 output   | Probabilidad de salto (> 0.5 = saltar) |
| Función de activación | Sigmoide en capa oculta |

### 3. Inputs recibidos por la Red Neuronal
```javascript
class Flappy {
  getInputs() {
    return [
      this.y / height,             // Posición normalizada
      distanceX / maxDistance,     // Distancia a tubería
      nextPipe.top / height,       // Altura tubería superior
      nextPipe.bottom / height,    // Altura tubería inferior
      this.velocity / maxVelocity  // Velocidad actual
    ];
  }
}
```

## ⚙️ Parámetros Ajustables

| Parámetro         | Valor por defecto | Rango recomendado | Efecto                    |
|-------------------|-------------------|-------------------|---------------------------|
| Tasa de mutación  | 0.3               | 0.1-0.5           | Mayor diversidad genética |
| Tamaño población  | 50                | 30-100            | Velocidad de convergencia |
| Élitismo          | 5                 | 1-10% población   | Conserva los mejores       |

## 📊 Proceso de Entrenamiento

**Generación 0:**
- 50 redes neuronales aleatorias
- Comportamiento caótico (mueren rápidamente)

**Generación 5-10:**
- Primeros patrones de salto
- Sobreviven 2-3 tuberías

**Generación 50+:**
- Vuelo estable
- Récord > 50 tuberías

## 📈 Métricas de Rendimiento
```javascript
// En draw():
text(`Mejor puntaje: ${bestScore}`, 20, 40);
text(`Generación: ${generation}`, 20, 60);
text(`Vivos: ${flappysAlive}/${neat.popSize}`, 20, 80);
```

## 🚀 Instalación y Uso
```bash
# Requisitos:
# 1. Servidor web local (Live Server en VSCode o XAMPP)
# 2. Navegador moderno (Chrome/Firefox)

# Pasos:
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/flappy-neat.git
# 2. Iniciar servidor web en el directorio
# 3. Abrir index.html
```

## 🐛 Problemas Conocidos

- **Estancamiento evolutivo:**  
Solución: Aumentar tasa de mutación

- **Overfitting local:**  
Solución: Reducir élitismo

- **Rendimiento lento:**  
Solución: Disminuir tamaño de población
