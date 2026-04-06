# ⚡ Guía Rápida - Focus-U

## 5 Minutos for Empezar

### Paso 1: Instalar
```bash
npm install
```

### Paso 2: Configurar .env.local
```bash
MONGODB_URI=mongodb://localhost:27017/focus-u
JWT_SECRET=dev-secret-change-in-production
NEXTAUTH_SECRET=dev-secret-change-in-production
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Paso 3: Ejecutar
```bash
npm run dev
```

### Paso 4: Acceder
Abre: [http://localhost:3000](http://localhost:3000)

### Paso 5: Registrarse
- Email: `test@example.com`
- Contraseña: `Test123!`
- ¡Ya estás adentro!

---

## 🎯 Acciones Principales

### 1️⃣ Ver Dashboard
```
Inicio → Dashboard
- Ver todas tus tareas
- Estadísticas rápidas
- Navegación principal
```

### 2️⃣ Crear Tarea
```
Dashboard / Tareas → "+ Nueva Tarea"
Campos:
  - Título (requerido)
  - Descripción
  - Fecha de vencimiento
  - Prioridad: Alta/Media/Baja
  - Categoría: Personal/Trabajo/Estudio/Proyecto
```

### 3️⃣ Ver Calendario
```
Calendario → Navega meses
- Botón "← Anterior"
- Botón "Hoy" (vuelve al mes actual)
- Botón "Siguiente →"
- Vista: Mes(default), Semana, Día
```

### 4️⃣ Crear Equipo
```
Equipos → "+ Nuevo Equipo"
- Nombre: "Proyecto A"
- Descripción: "Equipo para proyecto A"
- Color: Elige uno
→ Crear
```

### 5️⃣ Agregar Miembros
```
Equipos → Selecciona equipo → "Agregar Miembro"
- Email: usuario@example.com
→ Agregar
```

### 6️⃣ Cambiar a Modo Oscuro
```
Cualquier página → Botón en sidebar
"🌙 Modo Oscuro" o "☀️ Modo Claro"
- Se guarda automáticamente
```

---

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo

# Build
npm run build           # Compila para producción
npm run start           # Ejecuta versión compilada

# Linting
npm run lint            # Verifica código con ESLint

# Base de datos
# (MongoDB debe estar corriendo por separado)
```

---

## 📱 URL de Acceso Rápido

| Página | URL |
|--------|-----|
| Login | `http://localhost:3000/login` |
| Register | `http://localhost:3000/register` |
| Dashboard | `http://localhost:3000/dashboard` |
| Tareas | `http://localhost:3000/tasks` |
| Calendario | `http://localhost:3000/calendar` |
| Equipos | `http://localhost:3000/team` |
| Configuración | `http://localhost:3000/settings` |

---

## 🐛 Troubleshooting

### P: No puedo conectar a MongoDB
**R:** Asegúrate de:
- MongoDB está en ejecución (`mongod`)
- La URI es correcta en `.env.local`
- El puerto 27017 está disponible

### P: Dark mode no se ve
**R:** 
- Recarga la página (Ctrl+R o Cmd+R)
- Limpia caché (Dev Tools > Application > Clear)
- Verifica `tailwind.config.js` tiene `darkMode: 'class'`

### P: Las animaciones se ven lentas
**R:**
- Revisa rendimiento en DevTools > Performance
- Desactiva otras pestañas/apps
- Verifica que GPU está habilitada

### P: Las tareas no aparecen en calendario
**R:**
- Asegúrate de crear tareas ANTES del mes actual
- Navega al mes correcto en calendario
- Recarga la página

---

## 📚 Más Información

- [README.md](README.md) - Documentación completa
- [CHANGELOG.md](CHANGELOG.md) - Cambios por versión
- [IDEAS_Y_MEJORAS.md](IDEAS_Y_MEJORAS.md) - Roadmap completo

---

## 🚀 Next Steps

Después de que todo funcione:

1. **Crear varias tareas** con diferentes prioridades
2. **Navegar el calendario** por diferentes meses
3. **Crear un equipo** y agregar miembros
4. **Cambiar a modo oscuro** para ver el tema
5. **Revisar IDEAS_Y_MEJORAS.md** para funciones futuras

---

**¡Disfruta usando Focus-U! 🎉**
