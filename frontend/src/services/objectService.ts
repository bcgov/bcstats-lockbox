import { comsAxios } from './interceptors';
import { setDispositionHeader } from '@/utils/utils';

import type { AxiosRequestConfig } from 'axios';
import type { GetMetadataOptions, GetObjectTaggingOptions, MetadataPair, SearchObjectsOptions, Tag } from '@/types';

const PATH = '/object';

export default {
  /**
   * @function createObject
   * Post an object
   * @param {any} object Object to be created
   * @param {string} bucketId Bucket id containing the object
   * @param {AxiosRequestConfig} axiosOptions Axios request config options
   * @returns {Promise} An axios response
   */
  async createObject(
    object: any,
    headers: {
      metadata?: Array<{ key: string; value: string }>,
    },
    params: {
      bucketId?: string,
      tagset?: Array<{ key: string; value: string }>
    },
    axiosOptions?: AxiosRequestConfig
  ) {
    const config = {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': setDispositionHeader(object.name)
      },
      params: {
        bucketId: params.bucketId,
        tagset: {}
      },
    };

    // Map the metadata if required
    if (headers.metadata) {
      config.headers = {
        ...config.headers,
        ...Object.fromEntries((headers.metadata.map((x: { key: string; value: string }) => ([x.key, x.value]))))
      };
    }

    // Map the tagset if required
    if (params.tagset) {
      config.params.tagset = Object.fromEntries(
        (params.tagset.map((x: { key: string; value: string }) => ([x.key, x.value])))
      );
    }

    const fd = await object.arrayBuffer();
    return comsAxios(axiosOptions).put(PATH, fd, config);
  },

  /**
   * @function deleteObject
   * Delete an object
   * @param {string} objectId The id for the object to delete
   * @param {string} versionId An optional versionId
   * @returns {Promise} An axios response
   */
  deleteObject(objectId: string, versionId?: string) {
    return comsAxios().delete(`${PATH}/${objectId}`, {
      params: {
        versionId: versionId
      }
    });
  },

  /**
   * @function deleteTagging
   * Removes the specified set of tags from the object
   * All tags in the tag-set will be removed from the object if no tags are specified
   * @returns {Promise} An axios response
   */
  deleteTagging(
    objectId: string,
    tagging: Array<Tag>,
    versionId?: string,
  ) {
    return comsAxios().delete(`${PATH}/${objectId}/tagging`, {
      params: {
        tagset: Object.fromEntries((tagging.map((x: { key: string; value: string }) => ([x.key, x.value])))),
        versionId: versionId
      }
    });
  },

  /**
   * @function getMetadata
   * Get an object's metadata
   * @param {any} headers Optional request headers
   * @param {GetMetadataOptions} params Optional query parameters
   * @returns {Promise} An axios response
   */
  getMetadata(headers: any = {}, params: GetMetadataOptions = {}) {
    // remove objectId array if its first element is undefined
    if (params.objectId && params.objectId[0] === undefined) delete params.objectId;
    return comsAxios().get(`${PATH}/metadata`, { headers: headers, params: params });
  },

  /**
   * @function getObjectTagging
   * Get an objects tags
   * @param {GetObjectTaggingOptions} params Optional query parameters
   * @returns {Promise} An axios response
   */
  getObjectTagging(params: GetObjectTaggingOptions = {}) {
    return comsAxios().get(`${PATH}/tagging`, { params: params });
  },

  /**
   * @function getObject
   * Get an object
   * @param {string} objectId The id for the object to get
   * @param {string} versionId An optional versionId
   */
  getObject(objectId: string, versionId?: string) {
    // Running in 'url' download mode only, could add options for other modes if needed
    return comsAxios()
      .get(`${PATH}/${objectId}`, {
        params: {
          versionId: versionId,
          download: 'url',
        },
      })
      .then((response) => {
        const url = response.data;
        window.open(url, '_blank');
      });
  },

  /**
   * @function headObject
   * Get an object details (head call)
   * @param {string} objectId The id for the object to get
   * @returns {Promise} An axios response
   */
  headObject(objectId: string) {
    return comsAxios().head(`${PATH}/${objectId}`);
  },

  /**
   * @function listObjectVersion
   * Returns the object version history
   * @param {string} objectId The id for the object to get
   * @returns {Promise} An axios response
   */
  listObjectVersion(objectId: string) {
    return comsAxios().get(`${PATH}/${objectId}/version`);
  },

  /**
   * @function replaceMetadata
   * Creates a copy and new version of the object with the given metadata replacing the existing
   * @returns {Promise} An axios response
   */
  replaceMetadata(
    objectId: string,
    metadata: Array<{ key: string; value: string }>,
    versionId?: string,
  ) {
    return comsAxios().put(`${PATH}/${objectId}/metadata`, undefined, {
      headers: {
        ...Object.fromEntries((metadata.map((x: { key: string; value: string }) => ([x.key, x.value]))))
      },
      params: {
        versionId: versionId
      }
    });
  },

  /**
   * @function replaceTagging
   * Replace the existing tag-set of an object with the set of given tags
   * @returns {Promise} An axios response
   */
  replaceTagging(
    objectId: string,
    tagging: Array<Tag>,
    versionId?: string,
  ) {
    return comsAxios().put(`${PATH}/${objectId}/tagging`, undefined, {
      params: {
        tagset: Object.fromEntries((tagging.map((x: { key: string; value: string }) => ([x.key, x.value])))),
        versionId: versionId
      }
    });
  },

  /**
   * @function searchMetadata
   * Gets a list of tags matching the given parameters
   * @param {Object} headers Optional request headers
   * @returns {Promise} An axios response
   */
  searchMetadata(
    headers: {
      metadata?: Array<MetadataPair>,
    },) {

    const config = {
      headers: {},
    };

    // Map the metadata if required
    if (headers.metadata) {
      config.headers = {
        ...Object.fromEntries((headers.metadata.map((x: { key: string; value: string }) => ([x.key, x.value]))))
      };
    }
    return comsAxios().get(`${PATH}/metadata`, config);
  },

  /**
   * @function searchObjects
   * List and search for all objects
   * @param {SearchObjectsOptions} params Optional query parameters
   * @returns {Promise} An axios response
   */
  searchObjects(params: SearchObjectsOptions = {}, headers: any = {},) {
    // remove objectId array if its first element is undefined
    if (params.objectId && params.objectId[0] === undefined) delete params.objectId;
    return comsAxios().get(PATH, { params: params, headers: headers });
  },

  /**
   * @function searchTagging
   * Gets a list of tags matching the given parameters
   * @param {Array<Tag>} tagset Query parameters to search on
   * @returns {Promise} An axios response
   */
  searchTagging(tagset: Array<Tag>) {
    return comsAxios().get(`${PATH}/tagging`, {
      params: {
        tagset: Object.fromEntries((tagset.map((x: { key: string; value: string }) => ([x.key, x.value]))))
      }
    });
  },

  /**
   * @function togglePublic
   * Toggles the public property for an object
   * @param {string} objectId The id for the object
   * @param {boolean} isPublic Boolean on public status
   * @returns {Promise} An axios response
   */
  togglePublic(objectId: string, isPublic: boolean) {
    return comsAxios().patch(`${PATH}/${objectId}/public`, null, {
      params: {
        public: isPublic,
      },
    });
  },

  /**
   * @function updateObject
   * Update the object record (will add new version)
   * @param {string} objectId The id for the object
   * @param {any} object Object to be created
   * @param {AxiosRequestConfig} axiosOptions Axios request config options
   * @returns {Promise} An axios response
   */
  async updateObject(
    objectId: string,
    object: any,
    headers: {
      metadata?: Array<{ key: string; value: string }>,
    },
    params: {
      tagset?: Array<{ key: string; value: string }>
    },
    axiosOptions?: AxiosRequestConfig
  ) {
    const config = {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': setDispositionHeader(object.name)
      },
      params: {
        tagset: {}
      },
    };

    // Map the metadata if required
    if (headers.metadata) {
      config.headers = {
        ...config.headers,
        ...Object.fromEntries((headers.metadata.map((x: { key: string; value: string }) => ([x.key, x.value]))))
      };
    }

    // Map the tagset if required
    if (params.tagset) {
      config.params.tagset = Object.fromEntries(
        (params.tagset.map((x: { key: string; value: string }) => ([x.key, x.value])))
      );
    }

    const fd = await object.arrayBuffer();
    return comsAxios(axiosOptions).put(`${PATH}/${objectId}`, fd, config);
  },
};
