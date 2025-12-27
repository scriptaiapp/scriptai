import { Test, TestingModule } from '@nestjs/testing';
import { TrainAiController } from './train-ai.controller';

describe('TrainAiController', () => {
  let controller: TrainAiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainAiController],
    }).compile();

    controller = module.get<TrainAiController>(TrainAiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
