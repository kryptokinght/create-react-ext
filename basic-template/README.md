# Create React Extension basic Boilerplate

Template for creating a baic web extension

## Installation :checkered_flag:

```bash
# Install dependencies
$ npm install
```

## Development :computer:

* Run script
```bash
# Launches the web-ext from the app/ folder
# in the respective browser instance
$ npm run start:chrome
# launches in firefox
$ npm run start:mozilla
```

## Build :wrench: :hammer:

*The app/ folder is also the build folder and the extension is packaged from the app/ folder only.*


## Compress :nut_and_bolt: 

```bash
# compress app/ folder to {manifest.name}.zip and crx
$ npm run compress -- [options]
```

#### Options

If you want to build `crx` file (auto update), please provide options, and add `update.xml` file url in [manifest.json](https://developer.chrome.com/extensions/autoupdate#update_url manifest.json).

* --app-id: your extension id (can be get it when you first release extension)
* --key: your private key path (default: './key.pem')  
  you can use `npm run compress-keygen` to generate private key `./key.pem`
* --codebase: your `crx` file url

See [autoupdate guide](https://developer.chrome.com/extensions/autoupdate) for more information.
