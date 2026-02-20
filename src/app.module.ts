import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaxationModule } from './modules/taxation/taxation.module';

@Module({
  imports: [TaxationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
