import { controller, httpGet, response } from "inversify-express-utils";

@controller("/")
class <%= className %> {
  
  constructor() { }

  @httpGet("/")
  execute(@response() res: any) {
    return res.send("You use case called here");
  }
}

export { <%= className %> };
