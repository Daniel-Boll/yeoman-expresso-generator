import { provide } from "inversify-binding-decorators";

@provide(<%= className %>)
class <%= className %> {

    constructor() {}

    execute(): string {
        return "your use case";
    }
}

export { <%= className %> };
