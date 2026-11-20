# Android-приложение ЕГЭ Тренажёр

Android-версия собирается из текущего `index.html` с помощью Capacitor. Исходный сайт и iPhone PWA остаются отдельными и не меняются.

## Что делает сборка

1. `npm run build:web` копирует актуальную версию сайта и нужные изображения в `www/`.
2. Для Android WebView отключается регистрация браузерного Service Worker и скрывается кнопка установки PWA.
3. Capacitor создаёт Android-проект.
4. GitHub Actions собирает тестовый APK и сохраняет его как workflow artifact на 30 дней.

## Локальная сборка

Требуются Node.js 22, Java 21 и Android SDK.

```bash
npm install
npm run build:web
npx cap add android
npx capacitor-assets generate --android --iconBackgroundColor '#a93645' --splashBackgroundColor '#171515'
npx cap sync android
cd android
./gradlew assembleDebug
```

APK: `android/app/build/outputs/apk/debug/app-debug.apk`.

## Перед публичным распространением

Сейчас CI собирает debug APK для первого тестирования. Перед публикацией постоянной ссылки на сайте нужно настроить собственный Android signing keystore через GitHub Actions Secrets и собирать подписанный release APK. Нельзя хранить keystore или его пароль в открытом репозитории.

## Синхронизация с сайтом

Каждая новая сборка использует актуальный `index.html` из основной ветки. Firebase остаётся облачным источником аккаунтов и данных; в APK не добавляются отдельная база или отдельная авторизация.
