<script setup lang="ts">
import { Message } from '@/lib/primevue';
import { storeToRefs } from 'pinia';

import { Button } from '@/lib/primevue';
import { useAuthStore, useConfigStore } from '@/store';
import { RouteNames } from '@/utils/constants';

// Store
const { getIsAuthenticated } = storeToRefs(useAuthStore());
const { getConfig } = storeToRefs(useConfigStore());
</script>

<template>
  <div class="grid">
    <div class="text-center">
      <Message
        v-if="getConfig?.notificationBanner"
        severity="warn"
      >
        {{ getConfig?.notificationBanner }}
      </Message>
      <h1 class="mb-4">Store and share files in BC Stats LockBox</h1>
      <p class="text-xl">
        This website allows
        <a
          href="https://www2.gov.bc.ca/gov/content/governments/services-for-government/information-management-technology/id-services/idir"
        >
          IDIR
        </a>
        and
        <a href="https://www.bceid.ca/">BCeID</a>
        users to upload and share files.
        <br />
        <br />
        BC Stats LockBox displays files in folders, which are visualizations of &quot;bucket&quot; storage location sources
        required to use BC Stats LockBox. 
      </p>

      <div class="flex flex-column justify-content-center align-items-center mb-4">
        <router-link :to="{ name: RouteNames.LIST_BUCKETS }">
          <Button>
            {{ getIsAuthenticated ? 'Go to my files' : 'Log in to get started' }}
          </Button>
        </router-link>

        <img
          src="@/assets/images/home_1.png"
          class="border-1 drop-shadow w-8 sm:col-10 mt-5 mb-8 flex align-items-center"
          alt="Screenshot of BC Stats LockBox's file list interface:
            a list of example files and possible actions including Upload, Download and Delete."
        />
      </div>

      <div class="grid mb-8 text-left">
        <div class="col-6 pr-5">
          <h3 class="mb-3">Upload and download objects</h3>
          <p class="text-xl">With BC Stats LockBox, you can use low-cost object storage for your files, images and documents.</p>
        </div>
      </div>
      <div class="col-6 pl-5">
        <div class="flex align-items-center">
          <img
            src="@/assets/images/home_2.png"
            class="border-1 drop-shadow"
            alt="Screenshot of BC Stats LockBox's upload interface: a drag-and-drop area,
                possible actions including Choose, Start Upload and Close."
          />
        </div>
      </div>

      <div class="grid mb-4 text-left">
        <div class="col-6 pr-5">
          <h3 class="mb-3">Manage access and share</h3>
          <p class="text-xl">
            You can assign custom permissions to other users through IDIR or Business BCeID authentication.<br /><br />
            Contact your organization's privacy and security teams to see if this fits your intended use.
            Make sure you don't upload personal or private information without the consent of your Ministry
            Privacy Officer.
          </p>
        </div>
        <div class="col-6">
          <img
            src="@/assets/images/home_3.png"
            class="border-1 drop-shadow"
            alt="Screenshot of BC Stats LockBox's share interface,
                    demonstrating a share link and QR code."
          />
        </div>
      </div>

      <div class="flex flex-column justify-content-center align-items-center">
        <router-link :to="{ name: RouteNames.LIST_BUCKETS }">
          <Button>
            {{ getIsAuthenticated ? 'Go to my files' : 'Log in to get started' }}
          </Button>
        </router-link>

        <h2 class="mt-8 mb-4">Terms of Use</h2>
        <div class="text-left text-xl">
          <ul>
            <li>
              It is your responsibility to comply with the
              <a
                href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/96165_03#part3"
                target="_blank"
              >
                Freedom of Information and Protection of Privacy Act
              </a>
              governing the collection, use and disclosure of personally identifiable information
            </li>
            <li>
              Access to this tool does not inherently grant permission to collect, use or disclose any personally
              identifiable information
            </li>
            <li>
              It is your responsibility to provide a Collection Notice to individuals before collecting personally
              identifiable information, as required by law
            </li>
            <li>
              Before uploading and distributing files you are required to discuss your privacy intentions with your
              <a
                href="https://www2.gov.bc.ca/gov/content/governments/services-for-government/information-management-technology/privacy/resources/privacy-officers"
                target="_blank"
              >
                Ministry Privacy Officer
              </a>
              and to complete assessments as required
            </li>
            <li>
              If you intend to advise users to access with BCeID, please send an email to the
              <a href="mailto:IDIM.Consulting@gov.bc.ca">Provincial Identity Information Management Program</a>
              indicating your BCeID-related intentions
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
img {
  max-width: 100%;
}
ul li {
  margin-bottom: 1rem;
}
</style>
