# FOI Report Download
---

[![img](https://img.shields.io/badge/Lifecycle-Stable-97ca00)](https://github.com/bcgov/repomountie/blob/master/doc/lifecycle-badges.md)

This is an intranet web-app allowing authenticated users to specify filters and download FOI report in PDF or Excel format.

## Features
* VueJS frontend and NodeJS backend; with Keycloak authentication on frontend (using a public client from [Common Hosted Single Sign-On (CSS)](https://bcgov.github.io/sso-requests/my-dashboard/)).
* A form allowing user to specify filters and reporting file format
* Download report in either pdf or Excel format

## Usage
### Configuration

| Environment Variable    | Mandatory | Default    | Description                |
| ----------------------- | --------- | ---------- | -------------------------- |
| PGUSER                  | Yes       |            |                            |
| PGHOST                  | Yes       |            |                            |
| PGPASSWORD              | Yes       |            |                            |
| PGDATABASE              | Yes       |            |                            |
| PGPORT                  | No        | 443        |                            |
| SNOWPLOW_TRACKER_URL    | Yes       |            | snowplow tracker url       |
| SNOWPLOW_COLLECTOR_HOST | Yes       |            | snowplow collector host    |
| TRUST_PROXY             | No        |            | express.js trust proxy     |
| NODE_ENV                | Yes       | production | in local set it to dev     |
| VITE_PROJECT            | Yes       | dev        | in test=test in prod=prod |


#### Development
VS Code is the preferred dev tool.
##### Requirements
  * localhost has access to Redshift
  * localhost has Node.js v18.8.0 installed (other Node.js versions may work but have not been tested)
  * localhost has applicable env var above defined
  
##### Install & Launch
1. Run
  ```
  git clone https://github.com/bcgov/foi-report-download.git
  cd foi-report-download
  npm install
  ```
2. Download keycloak.json from Keycloak admin console client's Installation tab to ./keycloak.json
3. Run
   ```
   npm run start
   ```
  
    If everything works out, the output should be something like
    ```
    $ node .
    launch http://localhost:8080 to explore
    ```
4. Open http://localhost:8080 in browser and login to the app using IDIR-MFA if you are not already logged in.

## Project Status

This project is stable and actively supported by the GDX Analytics Team.

## Related Repositories
 
### [GDX-Analytics/](https://github.com/bcgov/GDX-Analytics)
This is the central repository for work by the GDX Analytics Team.

### [GDX-Analytics-Looker-FOI/](https://github.com/bcgov/GDX-Analytics-Looker-FOI)
This is the GDX Analytics project for the FOI Project's Lookml.

## Getting Help or Reporting an Issue

For any questions regarding this project, or for inquiries about starting a new analytics account, please contact the GDX Analytics Team.

## Contributors
 
The GDX Analytics Team are the main contributors to this project and maintain the code.

## How to Contribute

If you would like to contribute, please see our [CONTRIBUTING](CONTRIBUTING.md) guideleines.

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## License

```
Copyright 2015 Province of British Columbia
 
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
 
   http://www.apache.org/licenses/LICENSE-2.0
 
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
```
