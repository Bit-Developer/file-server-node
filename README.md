# file-server-node
File server built with node, express in typescript.

## 2. Configuration
### 2.1 Environment Variables
Create file named `.env.dev` under folder `env` in the root directory with the following content.
```sh
PORT=5000
ROOT_DIR='.'
REQUEST_DELAY=0
```
### 2.2 Start Server
Run script.
```sh
npm run dev
```
A configuration file named `env.config.ts` will be created in `.src/config` and server will be listening to the given port.
### 2.3 More environments
* 1) Create environment file for other scenarios in `env` folder, eg, stage, prod, etc.
* 2) Add one new command in `package.json` with change the `NODE_ENV` value, eg.
```sh
"stage": "NODE_ENV=stage npm run start-config && nodemon ./src/server.ts --ignore ./uploads",
```

## 3. Deployment
### 3.1 Prepare Frontend
Go to project `file-server-angular`, build Angular application for production.
```sh
npm run prod
```
### 3.2 Prepare Backend
Go to project `file-server-node`, build node server for production.
```sh
npm run prod
```
### 3.3 Start server
Then, copy all frontend files in `file-server-angular/dist` to `file-server-node/dist/wwww`.

Copy all backend and frontend files to server.
```sh
cd 'file-server-node'
node './dist/src/server.js'
```
Access `http://192.168.0.2:12020/`.

## 4. Troubleshooting
### 4.1 Stop Express Server
Find the server process by searching 'node'.
```sh
ps aux | grep node
Johnny    3761  0.0  3.2 899840 58356 ?        Ssl  07:32   0:03 node ./dist/src/server.js
```
Kill it with PID.
```sh
kill -9 3761
```

## 5. Docker
Build for production. All the compiled html files and js files will be generated in `dist`.
```sh
npm run build
```
Create image with node.js.
```sh
docker build -t jojozhuang/file-server-node .
```
Create container.
```sh
docker run --name file-server -p 12020:80 -v=/var/services/video:/app/root -v=/var/services/web/fullstack-sites/file-server/www:/app/web -d jojozhuang/file-server-node
```
Access http://192.168.0.2:12020/ in browser.