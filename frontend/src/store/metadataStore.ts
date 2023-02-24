import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { objectService } from '@/services';

import type { Ref } from 'vue';
import type { Metadata } from '@/interfaces';

export const useMetadataStore = defineStore('metadata', () => {
  // State
  const metadata: Ref<Array<Metadata>> = ref([]);

  // Getters
  const getMetadata = computed(() => metadata.value);

  // Actions
  async function fetchMetadata(params: object = {}) {
    try {
      metadata.value = (await objectService.getMetadata(null, { ...params })).data;
    }
    catch (error) {
      console.error(`fetchMetadata error: ${error}`); // eslint-disable-line no-console
      // So that a caller can action it
      throw error;
    }
  }

  const getMetadataByObjectId = (objectId: string) => metadata.value.find((x: Metadata) => x.objectId === objectId);
  const getValue = (objectId: string, key: string) =>
    getMetadataByObjectId(objectId)?.metadata.find(x => x.key === key)?.value;

  return {
    // Getters
    getMetadata,

    // Actions
    getMetadataByObjectId,
    fetchMetadata,
    getValue
  };
});
