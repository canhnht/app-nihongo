MINAGOI
=====================

## Setup

- `npm install` to install dependencies
- `npm install --global ionic cordova` to install ionic cordova
- `ionic platform add android` to add platform android
- Install Android SDK

## Run project

- `ionic serve` to open app in browser
- `ionic run android` to install app in android device

## Helpful commands

### Install Ionic plugin

http://ionicframework.com/docs/v2/native/
`ionic plugin add <ionic plugin 1> <ionic plugin 2> --save` will install plugin and added plugin info to `config.xml`

### Start new Ionic project

`ionic start <project folder> blank --v2 -a <app name> -i <package name>`

### Generate components, providers, pages, ...

- `ionic g --list` to list all available generators
- `ionic g page <page name>` to generate page
