# 🎯 Focus-U - Gestor de Tareas Colaborativo

**Focus-U** es una aplicación moderna de gestión de tareas y proyectos diseñada para equipos.
Combina un **calendario interactivo**, **sistema de equipos**, **tareas colaborativas** y **modo oscuro**.

![Version](https://img.shields.io/badge/version-1.1.0-blue)
![Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Características Principales

### 📅 Calendario Inteligente
- Navegación dinámina por meses y años
- Vista: Mes, Semana, Día
- Visualización de tareas por fecha
- Estadísticas en tiempo real
- Colores asignados por prioridad/estado

### 👥 Sistema de Equipos
- Crear y gestionar equipos
- Agregar miembros por email
- Roles personalizables (Admin, Editor, Viewer)
- Color distintivo por equipo
- Historial de cambios

### ✅ Gestión de Tareas
- Crear, editar, completar tareas
- Asignar prioridades (Alta, Media, Baja)
- Categorías personalizables
- Estado: Pendiente, En Progreso, Completada
- Fechas de vencimiento
- Descripción detallada

### 🌙 Modo Oscuro
- Toggle día/noche disponible
- Tema guardado en localStorage
- Soporte en todos los componentes
- Optimizado para vista nocturna

### 🎨 Animaciones Fluidas
- Transiciones suaves con Framer Motion
- Hover effects interactivos
- Animaciones de entrada/salida
- Performance optimizado

---

## 🚀 Iniciando

### Requisitos Previos
- **Node.js** >= 18.0.0
- **npm** o **yarn**
- **MongoDB** (local o Atlas)
- **Git**

### 1. Clonar el Repositorio
```bash
git clone c:\Users\User\OneDrive\Escritorio\mi-proyecto
cd focus-u
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Crear archivo `.env.local`:
```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/focus-u
# O para MongoDB Atlas:
# MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/focus-u

# JWT
JWT_SECRET=tu-secret-super-seguro-aqui
NEXTAUTH_SECRET=tu-secret-para-nextauth
NEXTAUTH_URL=http://localhost:3000

# API
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 4. Ejecutar en Desarrollo
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### 5. Ejecutar en Producción
```bash
npm run build
npm run start
```

---

## 📚 Documentación

### Estructura del Proyecto
```
focus-u/
├── app/
│   ├── api/                          # API endpoints REST
│   │   ├── auth/                     # Autenticación
│   │   ├── tasks/                    # Gestión de tareas
│   │   ├── calendar/                 # Calendario
│   │   └── teams/                    # Equipos (NUEVO)
│   ├── components/                   # Componentes reutilizables
│   │   ├── Calendar.tsx              # Calendario mejorado
│   │   ├── TaskForm.tsx              # Formulario de tareas
│   │   ├── TaskList.tsx              # Lista de tareas
│   │   └── Header.tsx                # Encabezado
│   ├── layouts/
│   │   └── DashboardLayout.tsx       # Layout principal (¡CON ANIMACIONES!)
│   ├── dashboard/
│   ├── calendar/
│   ├── tasks/
│   ├── team/                         # Página de equipos (NUEVA)
│   └── layout.tsx                    # Layout raíz
├── contexts/
│   └── ThemeContext.tsx              # Context para Dark Mode (NUEVO)
├── models/
│   ├── User.ts                       # Modelo de usuario
│   ├── Task.ts                       # Modelo de tarea
│   └── Team.ts                       # Modelo de equipo (NUEVO)
├── lib/
│   └── mongodb.ts                    # Conexión MongoDB
├── public/                           # Archivos estáticos
├── styles/                           # Estilos globales
├── IDEAS_Y_MEJORAS.md                # Roadmap y sugerencias (NUEVO)
├── CHANGELOG.md                      # Historial de cambios (NUEVO)
└── tailwind.config.js                # Configuración Tailwind
```

### Rutas Principales
| Ruta | Descripción | Estado |
|------|-------------|--------|
| `/login` | Página de inicio de sesión | ✅ |
| `/register` | Página de registro | ✅ |
| `/dashboard` | Panel principal | ✅ |
| `/tasks` | Gestor de tareas | ✅ |
| `/calendar` | Calendario interactivo | ✅ MEJORADO |
| `/team` | Gestión de equipos | ✅ NUEVO |
| `/settings` | Configuración | ⏳ |

---

## 🔌 API Endpoints

### Autenticación
```
POST   /api/auth/login              # Iniciar sesión
POST   /api/auth/register           # Registrarse
POST   /api/auth/logout             # Cerrar sesión
```

### Tareas
```
GET    /api/tasks                   # Obtener todas las tareas
POST   /api/tasks                   # Crear nueva tarea
PUT    /api/tasks?id=ID             # Actualizar tarea
DELETE /api/tasks?id=ID             # Eliminar tarea
```

### Calendario
```
GET    /api/calendar?month=M&year=Y # Obtener eventos del mes
POST   /api/calendar                # Crear evento
PUT    /api/calendar?id=ID          # Actualizar evento
DELETE /api/calendar?id=ID          # Eliminar evento
```

### Equipos ⭐ NUEVO
```
GET    /api/teams?email=EMAIL       # Obtener equipos del usuario
POST   /api/teams                   # Crear nuevo equipo
PUT    /api/teams?id=ID             # Actualizar equipo (miembros)
DELETE /api/teams?id=ID             # Eliminar equipo
```

---

## 🎓 Cómo Usar

### Crear una Tarea
1. Ve a **Tareas** o **Dashboard**
2. Haz clic en **+ Crear Tarea**
3. Completa:
   - Título (obligatorio)
   - Descripción
   - Fecha de vencimiento
   - Prioridad
   - Categoría
4. Haz clic en **Guardar**

### Gestionar Calendario
1. Ve a **Calendario**
2. Usa botones para navegar: **← Anterior**, **Hoy**, **Siguiente →**
3. Cambia la vista: **Mes**, **Semana**, **Día**
4. Haz clic en una tarea para verla en detalle

### Crear un Equipo
1. Ve a **Equipos**
2. Haz clic en **➕ Nuevo Equipo**
3. Ingresa:
   - Nombre del equipo
   - Descripción
   - Color distintivo
4. Haz clic en **Crear Equipo**

### Agregar Miembros
1. Ve a **Equipos**
2. Selecciona un equipo
3. En **Agregar Miembro**, ingresa email
4. Haz clic en **Agregar**
5. (Los roles se asignan como: Viewer por defecto)

### Cambiar a Modo Oscuro
1. En cualquier página con sidebar
2. Busca el botón **🌙 Modo Oscuro** o **☀️ Modo Claro**
3. Haz clic para cambiar el tema
4. ¡El tema se guarda automáticamente!

---

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 16** - Framework React con SSR
- **React 19** - Librería UI
- **Tailwind CSS** - Estilos utility-first
- **Framer Motion** - Animaciones
- **React Big Calendar** - Calendario
- **Date-fns** - Manipulación de fechas

### Backend
- **Next.js API Routes** - Backend integrado
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación segura
- **bcryptjs** - Hashing de contraseñas

### Herramientas
- **TypeScript** - Type safety
- **ESLint** - Linting
- **Tailwind CSS** - Diseño responsive

---

## 📝 Variables de Entorno

```bash
# Base de datos
MONGODB_URI=mongodb://localhost:27017/focus-u

# Autenticación
JWT_SECRET=tu-secret-aqui
NEXTAUTH_SECRET=tu-secret-nextauth
NEXTAUTH_URL=http://localhost:3000

# Configuración
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

---

## 📱 Funcionalidades en Desarrollo

- [ ] Notificaciones en tiempo real
- [ ] Sincronización con Google Calendar
- [ ] Modelo de vista Kanban
- [ ] Dashboard con estadísticas
- [ ] Exportar tareas a CSV/PDF
- [ ] Aplicación móvil (React Native)
- [ ] Chat y comentarios de equipo

---

## 🎯 Mejoras Recientes (v1.1.0)

✅ **Sistema de Dark Mode completo**
- ThemeContext global
- Persistencia en localStorage
- Soporte en todos los componentes

✅ **Calendario mejorado**
- Navegación dinámica por meses
- Estadísticas rápidas
- Múltiples vistas

✅ **Sistema de Equipos (NUEVO)**
- Crear y gestionar equipos
- Agregar/remover miembros
- Roles personalizables

✅ **Animaciones fluidas**
- Transiciones suaves
- Hover effects
- Performance optimizado

**Ver [CHANGELOG.md](CHANGELOG.md) para más detalles.**

---

## 💡 Ideas y Sugerencias

Tenemos un roadmap completo de mejoras futuras.
**Ver [IDEAS_Y_MEJORAS.md](IDEAS_Y_MEJORAS.md)** para:
- Sugerencias de features
- Mejoras técnicas
- Optimizaciones de performance
- Roadmap de desarrollo

---

## 🐛 Reportar Bugs

¿Encontraste un bug? Por favor:

1. Verifica que no sea un issue conocido
2. Crea un issue describiendo:
   - Qué ocurrió
   - Qué esperabas
   - Cómo reproducirlo
   - Navegador/sistema operativo

---

## 📞 Soporte

Si tienes preguntas o necesitas ayuda:

1. Revisa la [documentación](IDEAS_Y_MEJORAS.md)
2. Consulta [CHANGELOG.md](CHANGELOG.md)
3. Abre un issue en GitHub

---

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

## 🙏 Créditos

Desarrollado con ❤️ por el equipo de Focus-U.

### Librerías Utilizadas
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [MongoDB](https://www.mongodb.com/)

---

## 📊 Estadísticas

- **Componentes**: 10+
- **API Endpoints**: 12+
- **Modelos**: 3
- **Líneas de código**: 5000+

---

**¡Gracias por usar Focus-U! 🚀**

Última actualización: 26 de Marzo, 2026

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
