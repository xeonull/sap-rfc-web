# SAP RFC (node-rfc + vue3)

## Install SAP NetWeaver RFC library

1. Download `SAP NWRFC SDK` from SAP portal

1. Copy content of `nwrfcsdk` archive to any directory, for example C:\nwrfcsdk

1. Set `SAPNWRFC_HOME` environment variable 
    ```bash
    set SAPNWRFC_HOME=C:\nwrfcsdk
    ```
1. Add lib directory to `Path` environment variable 
    ```bash
    set PATH=%PATH%;C:\nwrfcsdk\lib
    ```
1. Reboot PC

## Run Server
1. Open Server directory
    ```bash
    cd server
    ```
1. Install dependencies
    ```
    npm install
    ```
1. Update file `sapnwrfc.ini` with correct parameters for connecting to your SAP systems

1. Launch Server
    ```
    npm run start
    ```
## Run Client
1. Open Client directory
    ```bash
    cd client
    ```
1. Install dependencies
    ```
    npm install
    ```
1. Launch Client
    ```
    npm run dev
    ```
