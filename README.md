# INSULIX — Aplicación móvil

INSULIX es una aplicación móvil en desarrollo para apoyar el seguimiento de personas con diabetes. Permite registrar y consultar lecturas de glucosa, revisar su evolución y acceder a funciones de bienestar. También contempla herramientas para que el personal médico dé seguimiento a sus pacientes.

## Componentes de INSULIX

- Aplicación móvil: https://github.com/milaneso69/app-mobile-insulix
- API: https://github.com/YamiTS09/API-INSULIX

## Funciones principales

- Inicio de sesión y acceso según el tipo de usuario.
- Registro manual de glucosa, identificado como lectura real.
- Simulación de lecturas para demostración, separada de los registros reales.
- Gráfica de glucosa con filtros por periodo y tipo de lectura.
- Sección de bienestar con funciones relacionadas con peso, dieta y actividad física.
- Sección para que el personal médico consulte pacientes y gestione su seguimiento.

> Las lecturas simuladas son únicamente demostrativas y no representan mediciones clínicas.

## Tecnologías

- Angular 20
- Ionic 8
- Capacitor 8 para Android
- Firebase Authentication
- ApexCharts
- API de INSULIX, mantenida en un repositorio separado

## Requisitos

- Node.js 22 LTS o 24.x y npm.
- Android Studio y Android SDK para compilar o ejecutar la aplicación en Android.
- Un JDK compatible con el Gradle incluido en el proyecto. Si Android Studio muestra que Java 25 no es compatible, selecciona un JDK compatible, como 17 o 21, en la configuración de Gradle.

## Instalación y ejecución web

Desde la carpeta raíz del repositorio:

```bash
npm install
npm start
```

La aplicación de desarrollo queda disponible en `http://localhost:4200`.

Para generar una compilación web:

```bash
npm run build
```

## Ejecutar en Android

Con Android Studio y el SDK configurados:

```bash
npm run build
npx cap sync android
npx cap open android
```

Android Studio abrirá el proyecto nativo para sincronizar Gradle, seleccionar un emulador o dispositivo y ejecutar la aplicación.

Para generar un APK de depuración desde Windows PowerShell:

```powershell
Set-Location android
.\gradlew.bat assembleDebug
```

El APK se genera en `android/app/build/outputs/apk/debug/app-debug.apk`.

## Configuración de servicios

La aplicación utiliza Firebase Authentication y consume los servicios del API de INSULIX. Para ejecutarla en otro entorno, revisa la configuración de entornos de Angular en `src/environments/` y ajusta los valores necesarios para Firebase y las direcciones del API.

No agregues al repositorio credenciales privadas, claves de cuentas de servicio ni otros secretos. El API se configura y ejecuta desde su propio repositorio.

## Estructura del repositorio

```text
src/          Código de la aplicación Angular e Ionic
android/      Proyecto nativo de Android generado con Capacitor
www/          Archivos web preparados para Capacitor
```

## Estado del proyecto

INSULIX continúa en desarrollo. Algunas funciones y servicios pueden cambiar conforme avance el proyecto.
