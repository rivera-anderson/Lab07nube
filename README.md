# 🇵🇪 Peru Vibe

## 🎯 Conclusiones del Laboratorio
El presente laboratorio demostró con éxito la implementación de una arquitectura moderna, escalable y de alta disponibilidad, abarcando desde la contenerización local hasta el despliegue automatizado en la nube.

* **Contenerización y Orquestación Local:** Se logró unificar los servicios web utilizando Docker Compose, implementando con éxito un servidor Nginx con balanceo de carga (*Round Robin*) hacia tres nodos backend de Python independientes, simulando un entorno de microservicios robusto.
* **Despliegue Cloud Resiliente:** La migración a Amazon Web Services (AWS) comprobó la eficacia de combinar *Auto Scaling Groups* y un *Application Load Balancer*. Esto asegura que la aplicación se mantenga operativa distribuyendo el tráfico en diferentes zonas de disponibilidad, logrando tolerancia a fallos.
* **Automatización de Infraestructura:** El uso de *Launch Templates* y la inyección de scripts en el *User Data* de las instancias EC2 permitió un aprovisionamiento automatizado ("zero-touch"), demostrando cómo instalar Docker, clonar repositorios y levantar contenedores desde cero sin intervención manual.

---

Peru Vibe es una Single Page Application (SPA) moderna enfocada en mostrar las mejores rutas turísticas, culturales y gastronómicas del Perú. Desarrollada con React y animaciones fluidas (Framer Motion) en el frontend, y respaldada por un API robusto en Python Flask y SQLite en el backend.

## 🏗️ Arquitectura del Sistema

El proyecto está diseñado para soportar alta disponibilidad tanto en entornos locales como en la nube de AWS.

### 1. Entorno Local (Docker Compose)
Toda la aplicación está dockerizada para garantizar la consistencia en el desarrollo.
- **Frontend (Puerto 80):** Servidor Nginx que actúa como servidor de archivos estáticos para React y como **Reverse Proxy**.
- **Balanceo de Carga:** Nginx utiliza el algoritmo **Round Robin** para distribuir equitativamente el tráfico de la API (`/api/*`).
- **Backend (Nodos 1, 2 y 3):** Tres contenedores independientes ejecutando Python Flask (puertos 8081, 8082, 8083) que procesan las peticiones en paralelo.

### 2. Despliegue en AWS Nube (Alta Disponibilidad)
La arquitectura en AWS está pensada para ser escalable y tolerante a fallos:
- **Application Load Balancer (ALB):** Recibe el tráfico HTTP de internet y verifica la salud (Health Checks) de los servidores.
- **Auto Scaling Group (ASG):** Garantiza que siempre existan instancias activas desplegadas en distintas Zonas de Disponibilidad (`us-east-1a`, `us-east-1b`).
- **EC2 (t2.micro):** Servidores Ubuntu que ejecutan el clúster de Docker.
- **Automatización (User Data):** Las instancias se auto-configuran al nacer, instalando Docker, clonando el repositorio y levantando los contenedores mediante un script Bash.

---

## 🚀 Guía de Instalación y Uso

### 💻 Ejecución Local

1. Asegúrate de tener **Docker** y **Docker Compose** instalados en tu máquina.
2. Clona el repositorio e ingresa a la carpeta del proyecto.
3. Ejecuta el siguiente comando para levantar todos los servicios:
   ```bash
   docker-compose up -d --build
   ```
4. Abre tu navegador y visita: [http://localhost](http://localhost)

*(Nota: Si deseas detener los contenedores y limpiar tu entorno, ejecuta `docker-compose down`).*

---

### ☁️ Despliegue en AWS (Cloud)

Para desplegar este proyecto en Amazon Web Services, sigue estos pasos:

1. **Security Groups:** 
   - `SG-LoadBalancer`: Permitir puerto 80 desde `0.0.0.0/0`.
   - `SG-EC2-Servers`: Permitir puerto 80 y puerto 22 desde `0.0.0.0/0`.
2. **Launch Template:**
   - Crear una plantilla usando **Ubuntu 24.04 LTS** (`t2.micro`).
   - Habilitar **Auto-assign public IP**.
   - Asignar el `SG-EC2-Servers`.
   - Inyectar el script de aprovisionamiento en la sección **User Data**.
3. **Application Load Balancer & Target Group:**
   - Crear un Target Group apuntando al puerto 80 y asignarlo a un nuevo ALB expuesto a internet.
4. **Auto Scaling Group:**
   - Crear el ASG usando el Launch Template, definir un mínimo de 2 instancias distribuidas en diferentes subredes, y adjuntarlo al Load Balancer.

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, React Router DOM.
- **Backend:** Python 3, Flask, SQLite.
- **DevOps / Nube:** Docker, Docker Compose, Nginx, AWS (EC2, ALB, ASG, VPC).
