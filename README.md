# GDX-Analytics-Looker-FOI

## Project Status

This project is currently under development and actively supported by the GDX Analytics Team.

## Features
This is an intranet web-app allowing authenticated users to specify filters and 
download FOI report in PDF or Excel format.

## Configuration

| Environment Variable    | Mandatory | Default    | Description                |
| ----------------------- | --------- | ---------- | -------------------------- |
| PGUSER                  | Yes       |            |                            |
| PGHOST                  | Yes       |            |                            |
| PGPASSWORD              | Yes       |            |                            |
| PGDATABASE              | Yes       |            |                            |
| PGPORT                  | No        | 5439       |                            |
| SNOWPLOW_TRACKER_URL    | Yes       |            | snowplow tracker url       |
| SNOWPLOW_COLLECTOR_HOST | Yes       |            | snowplow collector host    |
| FILE_STORE_PATH         | No        | ./sessions | path to session file store |
| TRUST_PROXY             | No        |            | express.js trust proxy     |

## Setup Dev Environment
VS Code is the preferred dev tool.
### Prerequisites
  * localhost has access to Redshift
  * localhost has Node.js installed
  * localhost has applicable env var above defined
  * access to Keycloak realm admin console
  * setup a Keycloak client with http://localhost:8080 as *Root URL*
  
### Install & Launch
1. Run
  ```
  git clone https://github.com/bcgov/foi-report-download.git
  cd foi-report-download
  cp ~/keycloak.json .
  npm i -g yarn
  yarn install
  ```
2. Download keycloak.json from Keycloak admin console client's Installation tab to ./keycloak.json
3. Run
   ```
   yarn run start
   ```
  
    If everything works out, the output should be something like
    ```
    yarn run v1.22.4
    $ node .
    launch http://localhost:8080 to explore
    ```
4. Open http://localhost:8080 in browser and login to the app.

## Getting Help
Please contact the GDX Service desk via the [GCPE GDX Client Service Desk Portal](https://apps.gcpe.gov.bc.ca/jira/servicedesk/customer/portal/9). 

## Contributors
See [contributors](https://github.com/bcgov/foi-report-download/graphs/contributors).

## License

Copyright 2015 Province of British Columbia

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
