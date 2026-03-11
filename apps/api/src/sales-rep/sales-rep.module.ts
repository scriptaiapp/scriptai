import { Module } from '@nestjs/common';
import { SalesRepController } from './sales-rep.controller';
import { SalesRepService } from './sales-rep.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [SalesRepController],
  providers: [SalesRepService],
  exports: [SalesRepService],
})
export class SalesRepModule {}
