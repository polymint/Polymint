// export default async function handler(req, res) {
//     res.status(200).end("noop");
// }

// export const config = {
//     api: {
//         bodyParser: {
//             sizeLimit: "50mb",
//         },
//     },
// };

import { NestFactory } from '@nestjs/core';
import * as bodyParser from 'body-parser';

// import { AppModule } from './app.module';

async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   app.useStaticAssets(`${__dirname}/public`);
const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ bodyLimit: 10048576 }),
  // the next two lines did the trick
  app.use(bodyParser.json({limit: '50mb'}));
  app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
  app.enableCors();
  await app.listen(3001);
}
bootstrap();