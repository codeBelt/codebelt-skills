'use client';

import {createClassyStore} from '@codebelt/classy-store';
import {createStoreHook} from '@codebelt/classy-store/react';
import {defaultModelId} from './modelStore.constants';
import type {Model} from './modelStore.types';

class ModelStore {
  models: Model[] = [];
  activeModelId: string = defaultModelId;

  get activeModel(): Model | undefined {
    return this.models.find((model) => model.id === this.activeModelId);
  }

  setActiveModel(modelId: string): void {
    this.activeModelId = modelId;
  }

  setModels(models: Model[]): void {
    this.models = models;
  }
}

export const modelStore = createClassyStore(new ModelStore());
export const useModelStore = createStoreHook(modelStore);
