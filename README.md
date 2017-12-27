# GreeceVol Refugee Services

QR-code based app by [GreeceVol.info](https://greecevol.info) that helps organisations manage and provide services to refugees

## Development

This app is built with [Nativescript + Angular](https://docs.nativescript.org/angular/start/introduction), and uses the [ZXing](https://github.com/zxing/zxing) library for QR/barcodes via [nativescript-barcodescanner](https://github.com/EddyVerbruggen/nativescript-barcodescanner). While Nativescript supports cross-platform development, the app is currently tested only on Android.

### Setup

0. [Install git](https://git-scm.com/downloads) (if you haven't already) and clone this repository
  ```bash
  git clone https://github.com/GreeceVol/refugee-services.git
  ```

1. Follow [these steps](https://docs.nativescript.org/angular/start/quick-setup) to setup Node, Nativescript and the Android SDK.

2. Use Node's package manager, npm, to install the dependencies of this app
  ```bash
  npm install
  ```

3. [Create an Android virtual device](https://developer.android.com/studio/run/managing-avds.html) or [setup an Android device for development](https://developer.android.com/studio/run/device.html)

4. Open a command prompt/terminal within the `refugee-services` directory, and start developing by running
  ```bash
  tns run android
  ```
This will compile and deploy the app on the emulator/hardware device. It will continue running, observing the project files for changes and syncing with the device (live sync).

## Contribute

Thank you for your interest in contributing to this repository.

We welcome contributions. If you notice a bug or would like to include a feature, please [create an issue](https://github.com/GreeceVol/refugee-services/issues/new). This helps to avoid duplication of effort and to start a discussion with the developers before you make any changes.

Please follow the [Forking workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/forking-workflow) by forking this repo, creating a new branch in your forked repo, committing changes to your repo, and [creating a pull request (PR)](https://github.com/GreeceVol/refugee-services/compare) to merge your changes with the `master` branch of this repo.

## License

GNU General Public License version 3