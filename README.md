# **🍽️ Reto Técnico - Backend Node.js (Microservicios con AWS ECS) 🚀**

Este repositorio contiene la solución al **reto técnico de Backend Node.js** propuesto por **Alegra**. La aplicación simula un sistema de pedidos en un restaurante que ofrece platos gratuitos, siguiendo una arquitectura basada en **microservicios** con **Fastify**, **Redis** y **Docker**, desplegados en **AWS ECS**.

---

## **📌 Descripción del Proyecto**
El sistema permite a un gerente solicitar platos a la cocina. La cocina selecciona aleatoriamente una receta y solicita los ingredientes a la bodega. Si la bodega no tiene suficientes ingredientes, realiza una compra en la plaza de mercado. Una vez que los ingredientes están disponibles, el plato se prepara y se entrega.

### **⚙️ Arquitectura**
- **`orders-app`**: Maneja las órdenes de comida generadas por los usuarios.
- **`kitchen-app`**: Procesa las órdenes y solicita ingredientes a la bodega.
- **`inventory-app`**: Administra los ingredientes y gestiona las compras en la plaza de mercado.

Los microservicios se comunican mediante **WebSockets** y **Redis**, garantizando asincronismo y procesamiento masivo de pedidos.

---

## **🛠️ Tecnologías Utilizadas**
✅ **Node.js** con **Fastify**  
✅ **Docker** y **Docker Compose**  
✅ **Redis** para comunicación entre microservicios  
✅ **AWS ECS Anywhere** para despliegue en la nube  
✅ **GitHub Actions** para CI/CD  
✅ **MongoDB/PostgreSQL (opcional, si se requiere persistencia)**  
✅ **Frontend** [🔗 Enlace aquí]

---

## **🚀 Despliegue en AWS ECS**
Los microservicios se despliegan en **AWS ECS Anywhere**, usando el nivel gratuito de **2200 horas al mes**.  
La infraestructura está gestionada dentro de un **monorepo**, con imágenes Docker alojadas en **Amazon ECR** y un flujo CI/CD automatizado con **GitHub Actions**.

---

## **📝 Requisitos del Reto**
✔️ Arquitectura de **microservicios con Docker**  
✔️ Soporte para **pedidos masivos**  
✔️ Comunicación **asincrónica** entre servicios  
✔️ **Visibilidad en tiempo real** de órdenes y stock  
✔️ **Despliegue gratuito** en un servidor accesible  

---

## **📂 Estructura del Repositorio**
```
📺 alegra-challenge
├── 📺 orders-app       # Microservicio de órdenes
├── 📺 kitchen-app      # Microservicio de cocina
├── 📺 inventory-app    # Microservicio de bodega
├── 📺 infra            # Configuración de AWS ECS
├── 📺 .github/workflows # GitHub Actions (CI/CD)
├── 📺 README.md        # Documentación del proyecto
```
---

## **Diagrama de Flujo**

```mermaid
graph TB
    User((Restaurant Manager))

    subgraph "Orders Service"
        OrdersApp["Orders App<br>Fastify"]
        
        subgraph "Orders Components"
            OrdersController["Orders Controller<br>Node.js"]
            OrderProcessor["Order Processor<br>Node.js"]
            OrdersDB[("Orders Database<br>PostgreSQL")]
            OrdersRedis["Message Queue<br>Redis"]
        end
    end

    subgraph "Kitchen Service"
        KitchenApp["Kitchen App<br>Fastify"]
        
        subgraph "Kitchen Components"
            RecipeManager["Recipe Manager<br>Node.js"]
            QueueProcessor["Queue Processor<br>Node.js"]
            KitchenDB[("Kitchen Database<br>PostgreSQL")]
            KitchenRedis["Message Queue<br>Redis"]
            OrderUpdater["Order Status Updater<br>Node.js"]
        end
    end

    subgraph "Inventory Service"
        InventoryApp["Inventory App<br>Fastify"]
        
        subgraph "Inventory Components"
            InventoryManager["Inventory Manager<br>Node.js"]
            PurchaseService["Purchase Service<br>Node.js"]
            InventoryDB[("Inventory Database<br>MongoDB")]
            WebsocketHandler["WebSocket Handler<br>Fastify WebSocket"]
        end
    end

    %% User interactions
    User -->|"Places order"| OrdersApp
    
    %% Orders Service flows
    OrdersApp -->|"Routes requests"| OrdersController
    OrdersController -->|"Stores orders"| OrdersDB
    OrdersController -->|"Publishes orders"| OrdersRedis
    OrderProcessor -->|"Processes orders"| OrdersRedis

    %% Kitchen Service flows
    KitchenRedis -->|"Consumes orders"| QueueProcessor
    QueueProcessor -->|"Gets recipe"| RecipeManager
    RecipeManager -->|"Stores/retrieves recipes"| KitchenDB
    QueueProcessor -->|"Requests ingredients"| InventoryApp
    OrderUpdater -->|"Updates order status"| OrdersApp

    %% Inventory Service flows
    InventoryManager -->|"Manages stock"| InventoryDB
    InventoryManager -->|"Triggers purchases"| PurchaseService
    WebsocketHandler -->|"Real-time updates"| User
    PurchaseService -->|"Records purchases"| InventoryDB

    %% Inter-service communication
    OrdersApp -->|"Sends order"| KitchenApp
    KitchenApp -->|"Requests ingredients"| InventoryApp
    InventoryApp -->|"Confirms stock"| KitchenApp
```

---

## **🔗 Instrucciones de Uso**
1. **Clonar el repositorio**  
   ```bash
   git clone https://github.com/MichaelAuditore/alegra-challenge
   cd alegra-challenge
   ```

2. **Configurar variables de entorno**  
   - Copiar el archivo `.env.example` en cada microservicio y completar con valores.

3. **Ejecutar localmente con Docker Compose**  
   - Configurar la variable de entorno `PURCHASE_URL` en docker-compose.yaml.

   - Si tienes instalado el plugin de Docker Compose (versión v2 integrada en el CLI de Docker), ejecuta:
      ```bash
      docker compose up --build
      ```

   - Si usas la versión independiente (standalone), ejecuta:
      ```
      docker-compose up --build
      ```
   - Una vez que ha sido desplegado, podrás acceder a cada uno de los servicios y su documentación Swagger:

   **Orders API**

    - `localhost:3000/health` - Valida la operatividad del servicio.
    - `localhost:3000/documentation` - Muestra documentación interactiva Swagger.

   **Kitchen API**

    - `localhost:3001/health` - Valida la operatividad del servicio.
    - `localhost:3001/documentation` - Muestra documentación interactiva Swagger.

   **Inventory API**

    - `localhost:3002/health` - Valida la operatividad del servicio.
    - `localhost:3002/documentation` - Muestra documentación interactiva Swagger.


4. **Desplegar en AWS ECS**  
   El despliegue es automático a través de **GitHub Actions**. Cada push a `main` reconstruye y actualiza los servicios en **AWS ECS**.

   Se bloque la rama main para que el proceso de ejecución de actions se haga después de completar un Pull Request

---

## **📊 Estado del Despliegue**
🔗 **URL de la aplicación:** [🔗 Enlace aquí]  
🔗 **Repositorio en GitHub:** [🔗 Enlace aquí]  

---

## **📌 Autor**
**Miguel Ángel Parada Cañón**  
💻 Desarrollador Fullstack | Arquitectura de Microservicios | AWS | Fastify  

---
