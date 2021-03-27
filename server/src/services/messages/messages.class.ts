import { Service, MongooseServiceOptions } from 'feathers-mongoose';
import { Params } from '@feathersjs/feathers';
import { Application } from '../../declarations';

export class Messages extends Service {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<MongooseServiceOptions>, app: Application) {
    super(options);
  }

  create(data: any, params?: Params) {
    const { text, channel} = data;
    let { author } = data;
    author = author ? author : 'Anonymous';
    const message = { text, channel, author };
    console.log(message);
    return super.create(message, params);
  }
}
