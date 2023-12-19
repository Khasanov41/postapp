# PostApp

Простое JS приложение для создания постов и заметок.

PostApp основан на [JSONPlaceholder](https://github.com/typicode/jsonplaceholder) и [Bootstrap](https://getbootstrap.com/).

![overview](/images/main.png)

# Функционал
* Создание, редактирование, удаление постов
* Добавление постов в избранное
* Редактор текста [TinyMCE](https://www.tiny.cloud/)
* Поддержка темной и светлой тем

# Установка
1. Скачайте репозиторий:
```bash
$ git clone https://github.com/Khasanov41/postapp
```

2. Установите зависимости:
```bash
$ npm install -g json-server
```
3. Запустите локальный сервер:
```
$ cd postapp
$ json-server --watch db.json
```
4. Откройте страничку в браузере [http://localhost:3000](http://localhost:3000)
