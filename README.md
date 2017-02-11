# MINAGOI

## Setup

- Recommended editor: [Visual Studio Code](https://code.visualstudio.com/f?utm_expid=101350005-17.ZUysucFlStyPwU4hcu0waA.5&utm_referrer=https%3A%2F%2Fwww.google.com.sg%2F)
- Install [plugin EditorConfig](http://editorconfig.org/) to use ```.editorconfig``` files.
- Install typescript and typings globally by ```npm install --global typescript typings```
- `npm install` to install dependencies
- `npm install --global ionic cordova` to install ionic cordova
- `ionic platform add android` to add platform android
- Install Android SDK
- Go to folder `node_modules`, clone this library https://github.com/canhnht/openjtalk

## Run project

- `ionic serve` to open app in browser
- `ionic run android` to install app in android device

## Translation

- Go to folder ```www/i18n```
- Meaning of following files:
  * ```vi.json``` - Vietnamese
  * ```ja.json``` - Japanese
  * ```en.json``` - English
- Each file contains a JSON object. All keys is same across all files.
Value of JSON key will be translated to equivalent language.

## Helpful commands

### Install Ionic plugin

http://ionicframework.com/docs/v2/native/
`ionic plugin add <ionic plugin 1> <ionic plugin 2> --save` will install plugin and added plugin info to `config.xml`

### Start new Ionic project

`ionic start <project folder> blank --v2 -a <app name> -i <package name>`

### Generate components, providers, pages, ...

- `ionic g --list` to list all available generators
- `ionic g page <page name>` to generate page

### Copy database from Android device to computer
1. Connect your device and launch the application in debug mode.
2. You may want to use `adb -d shell "run-as com.yourpackge.name ls /data/data/com.yourpackge.name/databases/"` to see what the database filename is.
3. Copy the database file from your application folder to your SD card.
```
adb -d shell "run-as com.yourpackge.name cp /data/data/com.yourpackge.name/databases/filename.sqlite > /sdcard/filename.sqlite"
```

4. Pull the database files to your machine:
```
adb pull /sdcard/filename.sqlite
```

5. Open db file

### Use sqlite3 in adb shell
**adb shell sqlite3 works only on emulator.**
1. Run `adb shell`
2. Run `run-as <com.package.name>`
3. Go to database directory at `/data/data/<com.package.name>/databases`
4. Run `sqlite3 <database file.db>`

6. Access database in device
Run `./access_database.sh`

### Clear proxy in terminal
- Run `env | grep -i proxy` to get all proxy settings
- Remove all *proxy* variables. `unset http_proxy ftp_proxy all_proxy ALL_PROXY socks_proxy https_proxy`

## Helpful references

### Install npm library
http://ionicframework.com/docs/v2/resources/third-party-libs/

## Notes
- To display app icon in local notification. Copy icon.png from `mipmap` folder to `drawable` folder
