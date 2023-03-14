'use strict';

import {mkdir} from 'fs';
import Generator from 'yeoman-generator';

type props = {
  schematic: string;
  name: string;
};

// <g|generator> Generator
export default class extends Generator {
  public answers: props = {} as props;

  constructor(args: string | string[], options: {}) {
    super(args, options);

    // One of the following argument is required
    //  - u | usecase
    //  - c | controller
    //  - d | dto
    //  - s | service
    //
    // In every case the name of <usecase, controller, service> is required
    //
    // There's a possible --no-spec flag to skip the creation of the spec file
    //
    // Examples:
    // - yo g usecase <name>
    // - yo g usecase <name> --no-spec
    // - yo g u <name>
    // - yo g u <name> --no-spec
    //
    // - yo g controller <name>
    // - yo g controller <name> --no-spec
    // - yo g c <name>
    // - yo g c <name> --no-spec

    this.argument('schematic', {
      type: String,
      required: false,
      description: 'The schematic of the generator',
    });

    this.argument('name', {
      type: String,
      required: false,
      description: "The name of the schematic's entity",
    });

    this.option('spec', {
      type: Boolean,
      default: true,
      description: 'Whether to create the spec file',
    });
  }

  public initializing() {}

  public async prompting() {
    const {schematic} = await this.prompt<{schematic?: string}>([
      {
        type: 'list',
        name: 'schematic',
        message: 'What do you want to generate?',
        choices: ['usecase', 'controller', 'dto', 'service'],
        when: !this.options.schematic,
      },
    ]);

    this.answers.schematic = schematic ?? this.options.schematic;

    const {name} = await this.prompt<{name?: string}>([
      {
        type: 'input',
        name: 'name',
        message: `What is the name of the ${this.answers.schematic}?`,
        when: !this.options.name,
      },
    ]);

    this.answers.name = name ?? this.options.name;
  }

  private _schematicValidation(): boolean {
    const options = ['usecase', 'controller', 'dto', 'service'];

    return !options.includes(this.answers.schematic);
  }

  public validate() {
    if (this._schematicValidation()) {
      this.env.error(
        new Error(
          `The schematic ${this.answers.schematic} is not supported. Please use one of the following: usecase, controller, service`
        )
      );
    }
  }

  private _pascalCase(str: string): string {
    return str
      .split(/[_\-\s]+|(?=[A-Z])/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  public writing() {
    const {schematic, name} = this.answers;

    // TODO: Promisify this eventually (https://yeoman.io/authoring/running-context.html @ Asynchronous tasks)
    mkdir(`src/${name}`, {recursive: true}, err => {
      if (err) this.env.error(err);

      // Create the file
      this.fs.copyTpl(
        this.templatePath(`${schematic}.tpl`),
        this.destinationPath(`src/${name}/${name}.${schematic}.ts`),
        {
          className: this._pascalCase(name),
        }
      );
    });
  }

  public end() {}
}
