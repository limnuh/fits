npm install -g express
npm install -g express-generator
brew update
brew install mongodb
sudo mkdir -p /data/db     # ha nincs létrehozva a könyvtár
sudo chown -R $USER /data/db
mongod                     # db indítása
npm install
npm start