![Logo](https://polyflowbuilder.duncanapple.io/assets/logo.png)

## About

PolyFlowBuilder is a tool allows you to easily visualize and plan your academic path during your stay at Cal Poly SLO.

Take PolyFlowBuilder for a spin on the [official website](https://polyflowbuilder.duncanapple.io).

Beta versions of the application are deployed on the [beta website](https://beta.polyflowbuilder.duncanapple.io). **Note that anything may change at any time (including data loss) on the beta website.**

## History

Meant as a replacement to the now-gone PolyFlows (see a [Wayback Machine snapshot](https://web.archive.org/web/20191017041519/http://polyflows.com/)), PolyFlowBuilder was initially written by [@AGuyWhoIsBored](#maintainers) during the Summer of 2020. It is meant to be more up-to-date, more robust, more active, and aims to make course planning at Cal Poly SLO as efficient and productive as possible.

PolyFlowBuilder was rewritten during the 2022-2023 academic year at Cal Poly as a senior project to allow the project to grow, scale, and to be more organized for future maintenance. See the final senior project report [here](https://www.dropbox.com/scl/fi/jlxaqddehsy94283eaipo/Applegarth-CPE-Senior-Project-Final-Report.pdf?rlkey=5nakk1ebdzpauv2zbtlppsocq&dl=0).

Since the August 20, 2023, PolyFlowBuilder has been open source to ensure the vision of the project continues and does not become deprecated like its predecessor PolyFlows.

## Main Features

- Can create flowcharts with a specified catalog year, starting year, major, and concentration (if applicable), and it will auto-populate with the respective flowchart (if it's available)
- Default flowchart templates are available for the 2015-2017 catalog all the way up to the 2022-2026 catalog
- Drag-and-drop interface for managing individual courses on your flowchart
- Each class contains information about its catalog description, unit count, and prerequisites (if any)
- Can color your classes with specific and custom colors (designating major classes, support classes, GEs, etc...)
- You can export your created flowchart as a PDF for printing or for markup (I find this especially handy myself) (will be improved in future updates)
- You can validate your flowchart to ensure that you have the minimum units, minimum upper-division units, GWR class, USCP class, Curriculum Sheet validation, and class-by-class prerequisite validation (with curriculum sheet validation planned in the future!)
- Can add notes to your flowchart
- Can add/remove terms from your flowchart (i.e. if you're taking summer classes at CP)
- Can create custom classes (i.e. if you need an "elective" placeholder, or anything else of that nature)
- "Credit Bin" allows you to keep track of courses you've earned units for towards your degree that you got from other instutitions (e.g. incoming transfer units, floating units, etc.)
- Can create as many flows as you need to succeed
- Term data is included in course information if available, sourced from public Cal Poly data provided by the Registrar's Office

## Repository Structure

The content in this repository can be broken down into the following components:

1. Application source: all content in the `src` and `static` folders, which is the source for the PolyFlowBuilder web application.

2. PolyFlowBuilder Database source: all content in the `api/src` folder, which contain the scripts that generate a sizeable portion of the data available through PolyFlowBuilder.

3. PolyFlowBuilder Database data: all content in the `api/data` folder, which contains the data and associated metadata in JSON format that makes up the data available through PolyFlowBuilder. See the [License](#license) and [Attribution](#attribution) sections for how you are allowed to use this data.

4. Migration source: all content in the `migration` folder, which contain scripts to migrate user data from the current live version of PolyFlowBuilder to the new version (which lives in this repository).

5. Database schema: all content in the `prisma` folder, which contains the Prisma schema for the PolyFlowBuilder database.

6. Tests: all content in the `tests` folder along with colocated unit tests in the Application source (see #1), which make up the tests for the project.

7. Miscellaneous files: all other files not mentioned in the above sections (which are largely the files located at the root of the repository), which have a variety of uses.

These components are likely to be separated into their own repositories in the future, but for now they are all included here for simplicity.

## Tentative Roadmap

Some major features planned for the future of PolyFlowBuilder (in no particular order) are:

- Multiple major/minor support
- Quarter-to-Semester (Q2S) transition support
- Flowchart Marketplace
- Improved PDF Exports
- More Advanced Validation Suites
- More Complete Testing

## License

The PolyFlowBuilder source is licensed under the [AGPL-3.0 license](https://choosealicense.com/licenses/agpl-3.0/). See [LICENSE](https://github.com/polyflowbuilder/polyflowbuilder/blob/main/LICENSE).

The PolyFlowBuilder Database is licensed under the [ODbL license](https://choosealicense.com/licenses/odbl-1.0/). See [LICENSE-DATA](https://github.com/polyflowbuilder/polyflowbuilder/blob/main/LICENSE-DATA.md). Attribution is required for any and all public use of this data; see the [Attribution](#attribution) section for more information.

## Attribution

The data that makes up the PolyFlowBuilder Database has been meticulously (and to a certain extent, manually) sourced, constructed, and refined over the lifespan of the project to be of the highest quality possible. Therefore, it is imperative that these data are attributed correctly to PolyFlowBuilder (and therefore to the Database contributors) if the PolyFlowBuilder Database is used in other works. Use of any portion of the PolyFlowBuilder Database is governed by the [ODbL license](https://choosealicense.com/licenses/odbl-1.0/) (see [License](#license)).

In particular, see this exerpt from ODbL section 4.3:

> However, if you Publicly Use a Produced Work, You must include a notice associated with
> the Produced Work reasonably calculated to make any Person that uses,
> views, accesses, interacts with, or is otherwise exposed to the Produced
> Work aware that Content was obtained from the Database, Derivative
> Database, or the Database as part of a Collective Database, and that it
> is available under this License.

From this, an attribution notice is required when using data sourced from the PolyFlowBuilder Database. An example attribution notice could be:

> Contains data from [PolyFlowBuilder](https://github.com/polyflowbuilder/polyflowbuilder), which is made available under the Open Database License (ODbL).

If you have any questions about attribution, feel free to [reach out](#support).

## Support

For support with PolyFlowBuilder features, issues, concerns, or anything else related to the project, you can either:

1. [Submit feedback](https://polyflowbuilder.duncanapple.io/feedback) on PolyFlowBuilder's official website.

2. Join the official PolyFlowBuilder [Discord server](https://discord.gg/xCadnCRC9f) and ask your question there.

## Maintainers

- @AGuyWhoIsBored ([Bitbucket](https://bitbucket.org/AGuyWhoIsBored), [GitHub](https://github.com/AGuyWhoIsBored), [LinkedIn](https://linkedin.com/in/dapplegarth))
