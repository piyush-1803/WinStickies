const { app, nativeImage } = require('electron');

app.whenReady().then(() => {
  const i = nativeImage.createEmpty();
  console.log('Methods:', Object.keys(i.__proto__ || i));
  app.quit();
});
